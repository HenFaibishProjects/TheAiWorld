// import { Controller, Post, Body } from '@nestjs/common';
// import axios from 'axios';

// @Controller('chat')
// export class AppController {
//   @Post()
//   async sendMessage(@Body('message') message: string) {
//     const apiKey = process.env.CLAUDE_API_KEY;
// try {
//     const response = await axios.post(
//       'https://api.anthropic.com/v1/messages',
//       {
//         model: "claude-3-5-haiku-20241022",
//         max_tokens: 60,
//         messages: [{ role: "user", content: message }],
//         temperature: 0.3
//       },
//       {
//         headers: {
//           "x-api-key": apiKey,
//           "anthropic-version": "2023-06-01",
//           "content-type": "application/json",
//         }
//       }
//     );

//     return response.data;

//   } catch (error) {
//   console.error("🔥 API ERROR:", error.response?.data || error.message);
//   throw error;
// }
// }
// }
