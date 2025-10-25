import { GoogleGenerativeAI } from '@google/generative-ai'
import { QUIZ_GENERATION_PROMPT } from '@/app/constants/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'
    })

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: QUIZ_GENERATION_PROMPT }]
        },
        {
          role: 'model',
          parts: [
            {
              text: "**Hello! I'm TamaMali AI, your quiz generation assistant.**\n\nI can help you create:\n- **Identification quizzes** - Short answer questions\n- **Multiple choice quizzes** - Questions with 4 options\n\n**What would you like to create today?**"
            }
          ]
        }
      ]
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(message)
          let fullResponse = ''

          // Collect full response first
          for await (const chunk of result.stream) {
            fullResponse += chunk.text()
          }

          // Stream character by character for smooth display
          for (let i = 0; i < fullResponse.length; i++) {
            try {
              controller.enqueue(encoder.encode(fullResponse[i]))
            } catch {
              break
            }
            // Small delay between characters for smooth streaming effect
            await new Promise((resolve) => setTimeout(resolve, 10))
          }

          // After streaming is complete, check for quiz data
          const jsonMatch = fullResponse.match(/```json\n([\s\S]*?)\n```/)
          if (jsonMatch) {
            try {
              const quizData = JSON.parse(jsonMatch[1])
              controller.enqueue(encoder.encode('__QUIZ_DATA__' + JSON.stringify(quizData)))
            } catch (e) {
              console.error('Failed to parse quiz JSON:', e)
            }
          }

          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode('Sorry, something went wrong while generating the response.'))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      }
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Failed to generate response', { status: 500 })
  }
}
