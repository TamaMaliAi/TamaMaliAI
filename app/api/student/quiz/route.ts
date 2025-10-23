import { NextResponse } from 'next/server'
import { PrismaClient, Quiz } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    const quizId = searchParams.get('quizId')

    if (!teacherId && !studentId) {
      return NextResponse.json(
        { message: 'teacherId or studentId is required', success: false },
        { status: 400 }
      )
    }

    // ===============================
    // 🔹 FETCH SINGLE QUIZ (teacher/student)
    // ===============================
    if (quizId) {
      const whereClause: any = { id: Number(quizId), deleted: false }

      if (teacherId) {
        whereClause.teacherId = Number(teacherId)
      } else if (studentId) {
        whereClause.AND = [
          { deleted: false },
          {
            OR: [
              { assignments: { some: { studentId: Number(studentId), deleted: false } } },
              {
                assignments: {
                  some: {
                    group: {
                      students: { some: { studentId: Number(studentId) } },
                    },
                  },
                },
              },
            ],
          },
        ]
      }

      const quiz = await prisma.quiz.findFirst({
        where: whereClause,
        include: {
          questions: { include: { options: true, answers: true } },
          teacher: true,
          assignments: {
            include: {
              group: true,
              student: true,
            },
          },
        },
      })

      if (!quiz) {
        return NextResponse.json({ message: 'Quiz not found', success: false }, { status: 404 })
      }

      return NextResponse.json({ success: true, quiz })
    }

    // ===============================
    // 🔹 FETCH MULTIPLE QUIZZES
    // ===============================

    // Define typed variable using Prisma’s return type
    type QuizWithRelations = Awaited<
      ReturnType<typeof prisma.quiz.findMany>
    >[number]

    let quizzes: QuizWithRelations[] = []

    if (teacherId) {
      quizzes = await prisma.quiz.findMany({
        where: {
          teacherId: Number(teacherId),
          deleted: false,
        },
        include: {
          questions: { include: { options: true, answers: true } },
          teacher: true,
          assignments: {
            include: { group: true, student: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    } else if (studentId) {
      quizzes = await prisma.quiz.findMany({
        where: {
          deleted: false,
          OR: [
            { assignments: { some: { studentId: Number(studentId), deleted: false } } },
            {
              assignments: {
                some: {
                  group: {
                    students: { some: { studentId: Number(studentId) } },
                  },
                },
              },
            },
          ],
        },
        include: {
          questions: { include: { options: true } },
          teacher: true,
          assignments: {
            include: { group: true, student: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ success: true, quizzes })
  } catch (err) {
    console.error('GET /api/quiz error:', err)
    return NextResponse.json(
      { message: 'Failed to fetch quiz(es)', success: false },
      { status: 500 }
    )
  }
}
