import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API Key');
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  const modelNames = data.models ? data.models.map((m: any) => m.name) : data;
  console.log('Available models:');
  console.log(JSON.stringify(modelNames, null, 2));
}

run();
