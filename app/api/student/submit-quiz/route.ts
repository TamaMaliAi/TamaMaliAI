import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type Answer = {
  questionId: number
  selectedOptionId?: number
  textAnswer?: string
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, quizId, answers, timeSpent } = body

    console.log('Submitting quiz:', { studentId, quizId, answersCount: answers?.length, timeSpent })

    if (!studentId || !quizId || !answers) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch quiz with questions and options
    const quiz = await prisma.quiz.findUnique({
      where: { 
        id: Number(quizId),
        deleted: false 
      },
      include: {
        questions: {
          where: { deleted: false },
          include: { 
            options: {
              where: { deleted: false }
            }
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

    // Verify the student has access to this quiz
    const assignment = await prisma.quizAssignment.findFirst({
      where: {
        OR: [
          { studentId: Number(studentId) },
          { 
            group: {
              students: {
                some: { studentId: Number(studentId) }
              }
            }
          }
        ],
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

    // Count previous attempts
    const previousAttempts = await prisma.quizAttempt.count({
      where: {
        studentId: Number(studentId),
        quizId: Number(quizId),
        deleted: false
      }
    })

    // Calculate score and process answers
    let totalScore = 0
    const processedAnswers: Array<{
      questionId: number
      selectedOptionId?: number
      textAnswer?: string
      isCorrect: boolean
    }> = []

    for (const answer of answers) {
      const question = quiz.questions.find(q => q.id === answer.questionId)
      
      if (!question) {
        console.warn(`Question ${answer.questionId} not found`)
        continue
      }

      let isCorrect = false

      if (question.type === 'MULTIPLE_CHOICE' && answer.selectedOptionId) {
        const selectedOption = question.options.find(
          opt => opt.id === answer.selectedOptionId
        )
        isCorrect = selectedOption?.isCorrect || false
        
        if (isCorrect) {
          totalScore += question.points
        }

        processedAnswers.push({
          questionId: question.id,
          selectedOptionId: answer.selectedOptionId,
          isCorrect
        })
      } else if (question.type === 'IDENTIFICATION' && answer.textAnswer) {
        // For identification questions, check against correct answer
        const correctOption = question.options.find(opt => opt.isCorrect)
        
        if (correctOption) {
          // Case-insensitive and trimmed comparison
          const studentAnswer = answer.textAnswer.toLowerCase().trim()
          const correctAnswer = correctOption.text.toLowerCase().trim()
          
          isCorrect = studentAnswer === correctAnswer
          
          if (isCorrect) {
            totalScore += question.points
          }
          
          console.log('Identification answer check:', {
            questionId: question.id,
            studentAnswer: answer.textAnswer,
            correctAnswer: correctOption.text,
            isCorrect
          })
        }

        processedAnswers.push({
          questionId: question.id,
          textAnswer: answer.textAnswer,
          isCorrect
        })
      }
    }

    console.log('Processed answers:', { totalScore, answersCount: processedAnswers.length })

    // Create quiz attempt with answers in a transaction
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: Number(studentId),
        quizId: Number(quizId),
        score: totalScore,
        attemptNo: previousAttempts + 1,
        timeSpent: timeSpent || 0,
        answers: {
          create: processedAnswers.map(answer => ({
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            textAnswer: answer.textAnswer,
            isCorrect: answer.isCorrect
          }))
        }
      },
      include: {
        answers: {
          include: {
            selectedOption: true
          }
        }
      }
    })

    console.log('Quiz attempt created:', attempt.id)

    return NextResponse.json({
      success: true,
      message: 'Quiz submitted successfully',
      submissionId: attempt.id,
      score: totalScore,
      totalPoints: quiz.totalPoints,
      timeSpent: timeSpent || 0
    })
  } catch (error) {
    console.error('Submit quiz error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit quiz', error: String(error) },
      { status: 500 }
    )
  }
}