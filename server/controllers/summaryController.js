
const Groq = require("groq-sdk");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const TEXT_MODEL =
  process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile";

const VISION_MODEL =
  process.env.GROQ_VISION_MODEL ||
  "meta-llama/llama-4-scout-17b-16e-instruct";

// ------------------------------------
// 1. CREATE AI PROMPT
// ------------------------------------

const createPrompt = (content, length = "medium") => {
  const instructions = {
    short: "Create a short summary in 5-7 bullet points.",
    medium:
      "Create a clear summary with headings, subheadings and bullet points.",
    detailed:
      "Create detailed study notes with headings, definitions, examples and important concepts.",
  };

  return `
You are an intelligent AI academic study assistant.

Analyze the following study material.

SUMMARY STYLE:
${instructions[length] || instructions.medium}

Your response must include:

1. Main topic
2. Introduction
3. Important concepts
4. Key definitions
5. Important points
6. Examples wherever available
7. Important keywords

Use simple English suitable for college students.

Do not invent information.
Do not remove important concepts.

STUDY MATERIAL:

${content}
`;
};

// ------------------------------------
// 2. GENERATE TEXT SUMMARY
// ------------------------------------

const generateTextSummary = async (content, length) => {
  const response = await groq.chat.completions.create({
    model: TEXT_MODEL,

    messages: [
      {
        role: "system",
        content:
          "You are an expert AI academic study assistant.",
      },
      {
        role: "user",
        content: createPrompt(content, length),
      },
    ],

    temperature: 0.3,
  });

  return response.choices[0].message.content;
};

// ------------------------------------
// 3. HANDLE LONG DOCUMENTS
// ------------------------------------

const summarizeLongText = async (content, length) => {
  const chunkSize = 10000;

  if (content.length <= chunkSize) {
    return await generateTextSummary(content, length);
  }

  const chunks = [];

  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.substring(i, i + chunkSize));
  }

  const partialSummaries = [];

  for (const chunk of chunks) {
    const summary = await generateTextSummary(
      chunk,
      "medium"
    );

    partialSummaries.push(summary);
  }

  const combinedContent = partialSummaries.join("\n\n");

  return await generateTextSummary(
    combinedContent,
    length
  );
};

// ------------------------------------
// 4. EXTRACT PDF TEXT
// ------------------------------------

const extractPDFText = async (buffer) => {
  const data = await pdfParse(buffer);

  return data.text;
};

// ------------------------------------
// 5. EXTRACT DOCX TEXT
// ------------------------------------

const extractDOCXText = async (buffer) => {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value;
};

// ------------------------------------
// 6. SUMMARIZE IMAGE
// ------------------------------------

const summarizeImage = async (file, length) => {
  const base64Image = file.buffer.toString("base64");

  const imageUrl = `data:${file.mimetype};base64,${base64Image}`;

  const prompt = `
You are an AI academic study assistant.

Read and understand this uploaded image.

The image may contain:
- Handwritten student notes
- Printed textbook pages
- Classroom notes
- Educational diagrams

Extract the educational content carefully.

${createPrompt(
  "Read the uploaded image and understand its educational content.",
  length
)}

Important:
- Preserve important definitions.
- Explain difficult concepts simply.
- Do not guess unclear handwriting.
- Mention if some text is unreadable.
`;

  const response = await groq.chat.completions.create({
    model: VISION_MODEL,

    messages: [
      {
        role: "user",

        content: [
          {
            type: "text",
            text: prompt,
          },
          {
            type: "image_url",

            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],

    temperature: 0.3,
  });

  return response.choices[0].message.content;
};

// ------------------------------------
// 7. MAIN SUMMARY CONTROLLER
// ------------------------------------

const generateSummary = async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is missing.",
      });
    }

    const {
      text,
      summaryLength = "medium",
    } = req.body || {};

    let summary = "";
    let sourceName = "Pasted text";
    let contentType = "text";

    // FILE UPLOAD
    if (req.file) {
      const file = req.file;

      sourceName = file.originalname;
      contentType = file.mimetype;

      // IMAGE
      if (file.mimetype.startsWith("image/")) {
        const allowedImages = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedImages.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: "Unsupported image format.",
          });
        }

        summary = await summarizeImage(
          file,
          summaryLength
        );
      }

      // PDF
      else if (
        file.mimetype === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf")
      ) {
        const extractedText = await extractPDFText(
          file.buffer
        );

        if (!extractedText.trim()) {
          return res.status(400).json({
            success: false,
            message:
              "No readable text found. This PDF may contain scanned pages.",
          });
        }

        summary = await summarizeLongText(
          extractedText,
          summaryLength
        );
      }

      // DOCX
      else if (
        file.originalname.toLowerCase().endsWith(".docx")
      ) {
        const extractedText = await extractDOCXText(
          file.buffer
        );

        if (!extractedText.trim()) {
          return res.status(400).json({
            success: false,
            message: "No readable text found in this DOCX file.",
          });
        }

        summary = await summarizeLongText(
          extractedText,
          summaryLength
        );
      }

      // TXT
      else if (
        file.mimetype === "text/plain" ||
        file.originalname.toLowerCase().endsWith(".txt")
      ) {
        const extractedText = file.buffer.toString("utf-8");

        if (!extractedText.trim()) {
          return res.status(400).json({
            success: false,
            message: "The uploaded TXT file is empty.",
          });
        }

        summary = await summarizeLongText(
          extractedText,
          summaryLength
        );
      }

      // UNSUPPORTED FILE
      else {
        return res.status(400).json({
          success: false,
          message:
            "Unsupported file. Upload an image, PDF, DOCX or TXT file.",
        });
      }
    }

    // PASTED TEXT
    else if (text && text.trim()) {
      summary = await summarizeLongText(
        text.trim(),
        summaryLength
      );
    }

    // NO INPUT
    else {
      return res.status(400).json({
        success: false,
        message: "Please paste text or upload a file.",
      });
    }

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      message: "Summary generated successfully.",
      summary,
      sourceName,
      contentType,
    });

  } catch (error) {
    console.error(
      "GENERATE SUMMARY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate summary.",
      error: error.message,
    });
  }
};

// ------------------------------------
// 8. EXPORT CONTROLLER
// ------------------------------------

module.exports = {
  generateSummary,
};
