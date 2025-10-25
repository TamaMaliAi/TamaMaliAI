import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const submissionId = searchParams.get('submissionId')

    console.log('Fetching quiz result for submission:', submissionId)

    if (!submissionId) {
      return NextResponse.json(
        { success: false, message: 'submissionId is required' },
        { status: 400 }
      )
    }

    // Debug: Check all recent attempts
    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { deleted: false },
      orderBy: { id: 'desc' },
      take: 5,
      select: { id: true, studentId: true, quizId: true, score: true }
    })
    console.log('Recent attempts in DB:', recentAttempts)

    // Fetch the quiz attempt with all related data
    const attempt = await prisma.quizAttempt.findUnique({
      where: { 
        id: Number(submissionId),
        deleted: false 
      },
      include: {
        quiz: {
          include: {
            questions: {
              where: { deleted: false },
              include: {
                options: {
                  where: { deleted: false }
                }
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
        },
        answers: {
          where: { deleted: false },
          include: {
            selectedOption: true,
            question: {
              include: {
                options: {
                  where: { deleted: false }
                }
              }
            }
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!attempt) {
      console.error('Quiz attempt not found:', submissionId)
      return NextResponse.json(
        { success: false, message: 'Quiz attempt not found' },
        { status: 404 }
      )
    }

    console.log('Quiz attempt found:', {
      id: attempt.id,
      score: attempt.score,
      timeSpent: attempt.timeSpent,
      answersCount: attempt.answers.length
    })

    return NextResponse.json({ 
      success: true, 
      attempt,
      timeSpent: attempt.timeSpent || 0
    })
  } catch (error) {
    console.error('Fetch quiz result error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch quiz result', error: String(error) },
      { status: 500 }
    )
  }
}