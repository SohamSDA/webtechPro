import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

app.post("/complete", async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Continue this code intelligently and complete the next few lines:\n${code}`;

    const result = await model.generateContent(prompt);
    const completion = result.response.text();

    res.json({ suggestion: completion.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(3000, () => console.log(" Server running on http://localhost:3000"));