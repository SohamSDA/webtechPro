import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Endpoint for debugging help
app.post("/debug", async (req, res) => {
  try {
    const { errorMessage, code } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
You are an expert debugger. 
Explain the following JavaScript error and suggest a possible fix in simple terms.
Error Message: ${errorMessage}
Code Snippet:
${code}
    `;

    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    res.json({ suggestion: explanation.trim() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI debugging failed." });
  }
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));