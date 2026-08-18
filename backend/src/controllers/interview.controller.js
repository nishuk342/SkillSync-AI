const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")




/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {

    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { selfDescription, jobDescription } = req.body

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeContent.text,
        selfDescription,
        jobDescription
    })

//     console.log("AI RESPONSE:");
//     console.log(interViewReportByAi);
//     console.log("AI TITLE:", interViewReportByAi.title);

    // Normalize AI response to satisfy model validation and schema expectations.
    const title = interViewReportByAi.title || jobDescription || "Untitled Job"

    const interviewReportPayload = {
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        title,
        matchScore: typeof interViewReportByAi.matchScore === "number" ? interViewReportByAi.matchScore : 0,
        technicalQuestions: Array.isArray(interViewReportByAi.technicalQuestions) ? interViewReportByAi.technicalQuestions : [],
        behavioralQuestions: Array.isArray(interViewReportByAi.behavioralQuestions) ? interViewReportByAi.behavioralQuestions : [],
        skillGaps: Array.isArray(interViewReportByAi.skillGaps) ? interViewReportByAi.skillGaps : [],
        preparationPlan: Array.isArray(interViewReportByAi.preparationPlan) ? interViewReportByAi.preparationPlan : []
    }

    // Merge any other fields from AI if present (non-destructive)
    Object.assign(interviewReportPayload, interViewReportByAi)

    const interviewReport = await interviewReportModel.create(interviewReportPayload)

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })

}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }