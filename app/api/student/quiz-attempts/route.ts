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

    // Fetch all attempts for this student and quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        studentId: Number(studentId),
        quizId: Number(quizId),
        deleted: false
      },
      orderBy: {
        submittedAt: 'desc' // Most recent first
      },
      select: {
        id: true,
        score: true,
        submittedAt: true,
        attemptNo: true
      }
    })

    return NextResponse.json({
      success: true,
      attempts
    })
  } catch (error) {
    console.error('Fetch quiz attempts error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quiz attempts', error: String(error) },
      { status: 500 }
    )
  }
}