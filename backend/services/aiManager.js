const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/generate";

async function generateResponse(prompt) {
    try {
        const response = await axios.post(OLLAMA_URL, {
            model: "qwen2.5-coder:3b",
            prompt: prompt,
            stream: false
        });

        return response.data.response;
    } catch (error) {
        console.error("Ollama Error:", error.message);
        throw new Error("Failed to generate AI response");
    }
}

module.exports = {
    generateResponse
};