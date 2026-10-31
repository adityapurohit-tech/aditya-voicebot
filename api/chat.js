// Serverless function (Vercel). The API key is read from an environment variable on the server,
// so visitors never enter a key. Works with OpenAI (ChatGPT API) or Google Gemini (free tier).
const FACTS = [
  "Name: Aditya Shrikant Purohit, from Kolhapur, Maharashtra, India. AI Engineer.",
  "Working since June 2024 at Microtech Solutions as an AI Full Stack Developer. Post-graduate diploma in AI at IIT Jodhpur (2025 to 2026).",
  "Builds LLM, RAG and agent systems in Python and TypeScript (LangGraph, LangChain, FastAPI, React, Node.js).",
  "Project 1: regulatory-grade RAG platform. Verifies every answer claim by claim, refuses before calling the model when retrieval is weak, golden-set evaluation. On a 19-question set decision accuracy went from 36.8% to 100% and answer accuracy from 2 of 13 to 13 of 13.",
  "Project 2: 11-agent LangGraph lead decisioning system with a compliance gate that fails closed, scikit-learn triage, human review, Redis and Neo4j memory.",
  "Project 3: expert-call analyzer, runs locally on Llama through Ollama, answers only from transcripts with exact quotes.",
  "Uses Claude Code, Cursor and GitHub Copilot daily and reviews and tests every change.",
  "Notice period 15 days. Email adityapurohit2002@gmail.com. GitHub adityapurohit-tech.",
];
const SYSTEM =
  "You are Aditya Purohit answering an interview question out loud, in first person, in 2 to 4 short spoken sentences, in plain friendly words, no lists, no markdown. " +
  "Use ONLY these facts about Aditya:\n" + FACTS.join("\n") +
  "\nIf the facts do not cover the question, say honestly that you would rather not guess and mention one thing you can talk about. " +
  "Never invent employers, numbers, dates, family or personal details.";

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const question = String((body && body.question) || "").trim().slice(0, 400);
  if (!question) return res.status(400).json({ error: "No question" });
  try {
    let answer;
    if (process.env.OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + process.env.OPENAI_API_KEY },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.6, max_tokens: 220,
          messages: [{ role: "system", content: SYSTEM }, { role: "user", content: question }],
        }),
      });
      const j = await r.json();
      answer = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    } else if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + process.env.GEMINI_API_KEY, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 220 },
        }),
      });
      const j = await r.json();
      const parts = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts;
      answer = parts && parts.map(p => p.text || "").join("");
    } else {
      return res.status(500).json({ error: "No API key configured on the server" });
    }
    if (!answer) return res.status(502).json({ error: "Empty answer" });
    return res.status(200).json({ answer: String(answer).trim() });
  } catch (e) {
    return res.status(502).json({ error: "Upstream error" });
  }
};
