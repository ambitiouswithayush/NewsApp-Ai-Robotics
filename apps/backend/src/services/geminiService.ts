import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY is not set. Summarization will fail.');
}

// Initialize the standard Google Gen AI SDK
const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

/**
 * Summarizes the provided article text into exactly 60 words or fewer, 
 * maintaining the core context for an AI/Robotics audience.
 * @param title The title of the article
 * @param content The raw text content of the article
 * @returns A string containing the summarized text
 */
export async function summarizeArticle(title: string, content: string): Promise<string> {
  const prompt = `
You are an expert tech editor for a short-form AI and Robotics news app.
Your task is to summarize the following article in STRICTLY 60 words or fewer.
The summary MUST be highly readable, dense with facts, and omit unnecessary fluff.

Article Title: ${title}

Article Text:
${content}

Return ONLY the summary text, nothing else. Do not include markdown formatting or quotes.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text() || '';
    
    // Safety check just in case the model goes slightly over
    const words = summary.split(/\s+/);
    if (words.length > 65) { // Small buffer
       return words.slice(0, 60).join(' ') + '...';
    }
    
    return summary.trim();
  } catch (error: any) {
    console.warn(`⚠️ Gemini summarization failed (likely quota limits). Using fallback local summarizing for: ${title}`);
    
    // Fallback: Naively slice the first 50-60 words of the full content 
    const cleanContent = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanContent.split(' ');
    
    if (words.length <= 60) return cleanContent;
    return words.slice(0, 55).join(' ') + '...';
  }
}
