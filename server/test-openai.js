require('dotenv').config();
const OpenAI = require("openai");

async function test() {
    console.log("Testing OpenAI connection...");
    console.log("Key length:", process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : "Missing");

    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Hello, are you working?" }],
            model: "gpt-3.5-turbo",
        });
        console.log("Success! Response:", completion.choices[0].message.content);
    } catch (error) {
        console.error("FAILED. Error details:");
        console.error(error);
    }
}

test();
