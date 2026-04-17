import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export const GROQ_MODEL = process.env.GROQ_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";
