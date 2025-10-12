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
          include: { options: true, answers: { select: { textAnswer: true } } }
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Extract teacherId from query string (like a request body for GET)
    const teacherId = searchParams.get('teacherId')
    const quizId = searchParams.get('quizId') // optional if fetching single quiz

    if (!teacherId) {
      return NextResponse.json({ message: 'teacherId is required', success: false }, { status: 400 })
    }

    if (quizId) {
      // Fetch single quiz
      const quiz = await prisma.quiz.findFirst({
        where: { id: Number(quizId), teacherId: Number(teacherId) },
        include: {
          questions: { include: { options: true } },
          teacher: true
        }
      })

      if (!quiz) {
        return NextResponse.json({ message: 'Quiz not found', success: false }, { status: 404 })
      }

      return NextResponse.json({ success: true, quiz })
    }

    // Fetch all quizzes for this teacher
    const quizzes = await prisma.quiz.findMany({
      where: { teacherId: Number(teacherId) },
      include: {
        questions: { include: { options: true, answers: true } },
        teacher: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, quizzes })
  } catch (err) {
    console.error('GET /api/quiz error:', err)
    return NextResponse.json({ message: 'Failed to fetch quiz(es)', success: false }, { status: 500 })
  }
}

// PUT /api/quiz?id=123
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'Quiz ID is required', success: false }, { status: 400 })
    }

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
      title?: string
      description?: string
      subject?: string
      type?: QuizType
      timeLimit?: number
      totalPoints?: number
      deadline?: string
      teacherId?: number
      questions?: {
        text: string
        type: string
        order: number
        points: number
        options?: { text: string; isCorrect: boolean }[]
      }[]
    } = await req.json()

    // Check if quiz exists
    const existingQuiz = await prisma.quiz.findUnique({ where: { id: Number(id) } })
    if (!existingQuiz) {
      return NextResponse.json({ message: 'Quiz not found', success: false }, { status: 404 })
    }

    // Update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        subject,
        type,
        timeLimit,
        totalPoints,
        deadline: deadline ? new Date(deadline) : undefined,
        teacherId,
        // If questions are provided, delete old ones and recreate
        ...(questions
          ? {
              questions: {
                deleteMany: {}, // remove all old questions
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
            }
          : {})
      },
      include: {
        questions: { include: { options: true } }
      }
    })

    return NextResponse.json({
      message: 'Quiz updated successfully',
      success: true,
      quiz: updatedQuiz
    })
  } catch (error) {
    console.error('Update quiz error:', error)
    return NextResponse.json({ message: 'Failed to update quiz', success: false }, { status: 500 })
  }
}
