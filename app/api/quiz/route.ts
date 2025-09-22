import { NextResponse } from 'next/server'
import { PrismaClient, QuizType, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      subject,
      type,
      timeLimit,
      totalPoints,
      deadline,
      teacherId,
      questions
    }: {
      title: string
      description?: string
      subject?: string
      type: QuizType
      timeLimit?: number
      totalPoints: number
      deadline?: string
      teacherId: number
      questions?: {
        text: string
        type: string
        order: number
        points: number
        options?: { text: string; isCorrect: boolean }[]
      }[]
    } = await req.json()

    // 1. Validate required fields
    if (!title || !type || !totalPoints || !teacherId) {
      return NextResponse.json({ message: 'Missing required fields', success: false }, { status: 400 })
    }

    // 2. Validate teacher
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: UserRole.TEACHER, deleted: false }
    })
    if (!teacher) {
      return NextResponse.json({ message: 'Invalid teacher ID', success: false }, { status: 400 })
    }

    // 3. Create quiz with optional questions
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        subject,
        type,
        timeLimit,
        totalPoints,
        deadline: deadline ? new Date(deadline) : undefined,
        teacherId,
        questions:
          questions && questions.length > 0
            ? {
                create: questions.map((q) => ({
                  text: q.text,
                  type: q.type as QuizType,
                  order: q.order,
                  points: q.points,
                  options:
                    q.options && q.options.length > 0
                      ? {
                          create: q.options.map((o) => ({
                            text: o.text,
                            isCorrect: o.isCorrect
                          }))
                        }
                      : undefined
                }))
              }
            : undefined
      },
      include: {
        questions: {
          include: { options: true }
        }
      }
    })

    return NextResponse.json({
      message: 'Quiz created successfully',
      success: true,
      quiz
    })
  } catch (error) {
    console.error('Create quiz error:', error)
    return NextResponse.json({ message: 'Failed to create quiz', success: false }, { status: 500 })
  }
}
