import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const quizId = searchParams.get('quizId')

    if (!studentId || !quizId) {
      return NextResponse.json(
        { success: false, message: 'studentId and quizId are required' },
        { status: 400 }
      )
    }

    // Verify the student has access to this quiz through an assignment
    const assignment = await prisma.quizAssignment.findFirst({
      where: {
        studentId: Number(studentId),
        quizId: Number(quizId),
        deleted: false
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: 'Quiz not assigned to this student' },
        { status: 403 }
      )
    }

    // Fetch the quiz with questions and options
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(quizId) },
      include: {
        questions: {
          include: { 
            options: true 
          },
          orderBy: { order: 'asc' }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, quiz })
  } catch (error) {
    console.error('Fetch quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}