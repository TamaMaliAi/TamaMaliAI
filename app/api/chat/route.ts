import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { QUIZ_GENERATION_PROMPT } from '@/app/constants/prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro'
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

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    // Check if response contains JSON quiz data
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/)
    let quizData = null

    if (jsonMatch) {
      try {
        quizData = JSON.parse(jsonMatch[1])
      } catch (e) {
        console.error('Failed to parse quiz JSON:', e)
      }
    }

    return NextResponse.json({
      success: true,
      response,
      quizData
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate response'
      },
      { status: 500 }
    )
  }
}
