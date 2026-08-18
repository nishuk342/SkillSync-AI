const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendEmail = require("../utils/sendEmail");
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOTP = await bcrypt.hash(otp,salt);

    console.log(otp); //For Testing Only

    const user = await userModel.create({
        username,
        email,
        password: hashPassword,
        otp: hashedOTP, 
        otpExpires:Date.now() + 10 * 60 * 1000
    })

    if (user) {
      
      const message = `
      Welcome to SkillSync AI!, ${username}. Your OTP for registration is: ${otp}. 
      Please use this OTP to complete your registration process.
      Thank you for choosing SkillSync AI!
      `;
        console.log({otp})
      await sendEmail(email, "Welcome to SkillSync AI!- Your OTP for Registration", message);

    }
    else {
      res.status(400).json({ message: "Invalid user data" });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token)


    res.status(201).json({
        message: "User Registered Successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

/**
 * @name verifyOTPController
 * @description Verify the OPT entered by user
 * @access Public
 */
async function verifyOTPController(req, res) {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const isValid = await bcrypt.compare(otp,user.otp);
    if (!isValid) {
        return res.status(400).json({
            message: "Invalid OTP"
        });
    }

    if (user.otpExpires < Date.now()) {
        return res.status(400).json({
            message: "OTP expired"
        });
    }

    //user.verified = true;

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token)

    res.json({
        _id: user._id,
        name: user.username,
        email: user.email,
        token: token,
        message: "User verified successfully"
    });
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User LoggedIn Successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access Public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User Logged Out Successfully"
    })
}

/**
 * @name getMeController
 * @description Get the current logged in user details.
 * @access Private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User Details Fetched Successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}



module.exports = {
    registerUserController,
    verifyOTPController,
    loginUserController,
    logoutUserController,
    getMeController
}