# Aditya voice bot: deploy in about 10 minutes (Vercel, free)

1. Create a new GitHub repository (for example `aditya-voicebot`) and upload the three items in this folder:
   `index.html`, `api/chat.js` (keep the `api` folder) and `package.json`.
2. Go to https://vercel.com, sign in with GitHub, click "Add New... Project", and import the repository. Click Deploy.
3. In Vercel: Project > Settings > Environment Variables. Add ONE of these, then Redeploy:
   - `OPENAI_API_KEY` (your ChatGPT/OpenAI key), optional `OPENAI_MODEL` (default gpt-4o-mini), or
   - `GEMINI_API_KEY` (free key from https://aistudio.google.com), optional `GEMINI_MODEL`.
4. Open your Vercel URL (like https://aditya-voicebot.vercel.app), ask a question that is not in the prepared answers
   (for example "Do you like cricket?") and check that you get an answer. Then submit that URL.

The API key stays on the server. Visitors never type or see a key.
