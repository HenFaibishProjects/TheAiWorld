import { AIConfig } from './ai.config';

export class AIClient {
  constructor(private apiKey: string) {}

  async sendMessage(userMessage: string) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": AIConfig.version,
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({
        model: AIConfig.model,
        temperature: AIConfig.temperature,
        max_tokens: AIConfig.maxTokens,

        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Return ONLY a valid JSON object.
No explanations. No markdown. No text before or after the JSON.

Use this exact schema (valid JSON object):
{
  "subject": "",
  "do the ai know the answer": "",
  "the answer": ""
}

Where:
- "subject" = a short string
- "do the ai know the answer" = "yes" or "no",
- "the answer" = detailed answer to the question

User message:
"${userMessage}"
                `
              }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Claude API Error:", data);
      throw new Error(data?.error?.message || "Claude API failed");
    }

    return data;
  }
}
