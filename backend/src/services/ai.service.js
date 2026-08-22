const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
});


// ============================================================
// ZOD SCHEMA
// Used for validating Gemini's response before using it.
// ============================================================

const interviewReportSchema = z.object({
    matchScore: z
        .number()
        .min(0)
        .max(100)
        .describe(
            "A score between 0 and 100 indicating how well the candidate's profile matches the job description."
        ),

    technicalQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The technical question that can be asked in the interview."
                    ),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question."
                    ),

                answer: z
                    .string()
                    .describe(
                        "How the candidate should answer this question, including important points and approach."
                    )
            })
        )
        .describe(
            "Technical interview questions along with their intention and guidance for answering them."
        ),

    behavioralQuestions: z
        .array(
            z.object({
                question: z
                    .string()
                    .describe(
                        "The behavioral question that can be asked in the interview."
                    ),

                intention: z
                    .string()
                    .describe(
                        "The intention of the interviewer behind asking this question."
                    ),

                answer: z
                    .string()
                    .describe(
                        "How the candidate should answer this question, including important points and approach."
                    )
            })
        )
        .describe(
            "Behavioral interview questions along with their intention and guidance for answering them."
        ),

    skillGaps: z
        .array(
            z.object({
                skill: z
                    .string()
                    .describe(
                        "The skill that the candidate is lacking or needs to improve."
                    ),

                severity: z
                    .enum(["low", "medium", "high"])
                    .describe(
                        "The severity of this skill gap based on its importance for the job."
                    )
            })
        )
        .describe(
            "Important skill gaps in the candidate's profile along with their severity."
        ),

    preparationPlan: z
        .array(
            z.object({
                day: z
                    .number()
                    .int()
                    .min(1)
                    .describe(
                        "The day number in the preparation plan, starting from 1."
                    ),

                focus: z
                    .string()
                    .describe(
                        "The main focus of this day, such as DSA, system design, SQL, or mock interviews."
                    ),

                tasks: z
                    .array(z.string())
                    .describe(
                        "Specific tasks to be completed on this day."
                    )
            })
        )
        .describe(
            "A day-wise preparation plan for the candidate."
        ),

    title: z
        .string()
        .describe(
            "The title of the job for which the interview report is generated."
        )
});


// ============================================================
// NATIVE GEMINI JSON SCHEMA
// Do NOT use zodToJsonSchema here.
// ============================================================

const interviewReportJsonSchema = {
    type: "object",

    properties: {
        matchScore: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description:
                "A score between 0 and 100 indicating how well the candidate's profile matches the job description."
        },

        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description:
                            "The technical question that can be asked in the interview."
                    },

                    intention: {
                        type: "string",
                        description:
                            "The intention of the interviewer behind asking this question."
                    },

                    answer: {
                        type: "string",
                        description:
                            "How the candidate should answer this question and what points to cover."
                    }
                },
                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: {
                        type: "string",
                        description:
                            "The behavioral question that can be asked in the interview."
                    },

                    intention: {
                        type: "string",
                        description:
                            "The intention of the interviewer behind asking this question."
                    },

                    answer: {
                        type: "string",
                        description:
                            "How the candidate should answer this question and what points to cover."
                    }
                },
                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: {
                        type: "string",
                        description:
                            "The skill that the candidate is lacking or needs to improve."
                    },

                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"],
                        description:
                            "The severity of the skill gap."
                    }
                },
                required: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: {
                        type: "integer",
                        minimum: 1,
                        description:
                            "The day number in the preparation plan."
                    },

                    focus: {
                        type: "string",
                        description:
                            "The main focus of this day."
                    },

                    tasks: {
                        type: "array",
                        items: {
                            type: "string"
                        },
                        description:
                            "Specific tasks to complete on this day."
                    }
                },
                required: [
                    "day",
                    "focus",
                    "tasks"
                ]
            }
        },

        title: {
            type: "string",
            description:
                "The title of the job for which the interview report is generated."
        }
    },

    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title"
    ]
};


// ============================================================
// GENERATE INTERVIEW REPORT
// ============================================================

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
Generate an interview preparation report for the candidate.

Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Requirements:

1. MATCH SCORE
- Calculate a realistic match score between 0 and 100.
- Consider required skills, experience, projects, education and other relevant requirements.

2. JOB TITLE
- Identify the job title from the job description.
- Return it in the "title" field.

3. TECHNICAL QUESTIONS
- Generate 10 technical interview questions.
- EACH item in technicalQuestions MUST be an OBJECT.
- Each object MUST contain:
  - question
  - intention
  - answer
- Do NOT return technicalQuestions as an array of strings.

4. BEHAVIORAL QUESTIONS
- Generate 10 behavioral interview questions.
- EACH item in behavioralQuestions MUST be an OBJECT.
- Each object MUST contain:
  - question
  - intention
  - answer
- Do NOT return behavioralQuestions as an array of strings.

5. SKILL GAPS
- Identify important skills that are missing or insufficiently demonstrated in the resume.
- EACH item in skillGaps MUST be an OBJECT.
- Each object MUST contain:
  - skill
  - severity
- severity MUST be exactly one of:
  - low
  - medium
  - high
- Do NOT return skillGaps as an array of strings.

6. PREPARATION PLAN
- Generate a 7-day preparation plan.
- EACH item in preparationPlan MUST be an OBJECT.
- Each object MUST contain:
  - day
  - focus
  - tasks
- tasks MUST be an array of strings.
- Do NOT return preparationPlan as an array of strings.

IMPORTANT:
- Use the exact camelCase property names from the schema.
- Do NOT use snake_case names such as match_score or technical_questions.
- Do NOT flatten objects into arrays of key/value strings.
- Do NOT invent skills, experience, projects, education, certifications,
  achievements or qualifications that are not present in the candidate's information.
- Base the analysis on the provided resume and job description.
- Return ONLY the JSON object matching the provided schema.

Do not assume or infer that the candidate has experience,
education, projects, organizations, or skills unless they are
explicitly present in the provided resume or self-description.

Every candidate-specific statement in the generated report
must be supported by the provided information.
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,

            config: {
                responseMimeType: "application/json",

                // Native JSON schema for Gemini
                responseJsonSchema: interviewReportJsonSchema
            }
        });

        const parsedResponse = JSON.parse(response.text);

        // console.log("AI RESPONSE:");
        // console.dir(parsedResponse, { depth: null });

        // Validate Gemini's response before MongoDB
        const validatedResponse =
            interviewReportSchema.parse(parsedResponse);

        return validatedResponse;

    } catch (error) {

        console.error(
            "Interview report generation failed:"
        );

        console.error(error);

        throw error;
    }
}


// ============================================================
// GENERATE PDF FROM HTML
// ============================================================

async function generatePdfFromHtml(htmlContent) {

    const browser = await puppeteer.launch();

    try {

        const page = await browser.newPage();

        // Resume HTML does not need JavaScript
        await page.setJavaScriptEnabled(false);

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        const pdfBuffer = await page.pdf({
            format: "A4",

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        return pdfBuffer;

    } finally {

        // Make sure Chrome is always closed
        await browser.close();
    }
}


// ============================================================
// GENERATE RESUME PDF
// ============================================================

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const resumePdfSchema = z.object({
        html: z
            .string()
            .describe(
                "The complete HTML content of the resume."
            )
    });


    const resumePdfJsonSchema = {
        type: "object",

        properties: {
            html: {
                type: "string",
                description:
                    "The complete HTML content of the resume that can be rendered by Puppeteer and converted to PDF."
            }
        },

        required: ["html"]
    };


    const prompt = `
Generate a professional, ATS-friendly resume for the candidate.

Candidate Resume:
${resume}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Requirements:

- Tailor the resume to the provided job description.
- Highlight the candidate's relevant strengths, experience, skills and projects.
- Do NOT invent information that is not present in the candidate's original resume or self-description.
- Do NOT create fake companies, projects, certifications, education, achievements, skills or work experience.
- Keep the resume concise and ideally 1-2 pages.
- Make the resume professional and easy to read.
- Make it ATS-friendly.
- Use a clean and simple design.
- Avoid excessive colors and decorative elements.
- Do not use JavaScript.
- Do not use iframes.
- Do not include external scripts.
- The HTML should be directly renderable by Puppeteer.
- Return the complete HTML inside the "html" field.
- Return ONLY the JSON object specified by the response schema.
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseJsonSchema:
                    resumePdfJsonSchema
            }
        });


        const parsedResponse =
            JSON.parse(response.text);


        // Validate Gemini response
        const validatedResponse =
            resumePdfSchema.parse(parsedResponse);


        const pdfBuffer =
            await generatePdfFromHtml(
                validatedResponse.html
            );


        return pdfBuffer;

    } catch (error) {

        console.error(
            "Resume PDF generation failed:"
        );

        console.error(error);

        throw error;
    }
}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    generateInterviewReport,
    generateResumePdf
};