const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (to, subject, text) => {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "SkillSync AI",
        email: process.env.EMAIL_USER,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      textContent: text,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error(err);
  }
};

module.exports = sendEmail;