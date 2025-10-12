import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const {
      quizId,
      studentId,
      groupId
    }: {
      quizId: number
      studentId?: number
      groupId?: number
    } = await req.json()

    // Validate input
    if (!quizId || (!studentId && !groupId)) {
      return NextResponse.json(
        { message: 'quizId and either studentId or groupId are required', success: false },
        { status: 400 }
      )
    }

    // Validate quiz exists
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, deleted: false }
    })
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found', success: false }, { status: 404 })
    }

    // Assign to student
    if (studentId) {
      const student = await prisma.user.findFirst({
        where: { id: studentId, role: UserRole.STUDENT, deleted: false }
      })
      if (!student) {
        return NextResponse.json({ message: 'Invalid student ID', success: false }, { status: 400 })
      }

      const assignment = await prisma.quizAssignment.create({
        data: { quizId, studentId }
      })

      return NextResponse.json({ message: 'Quiz assigned to student', success: true, assignment })
    }

    // Assign to group
    if (groupId) {
      const group = await prisma.group.findFirst({
        where: { id: groupId, deleted: false }
      })
      if (!group) {
        return NextResponse.json({ message: 'Invalid group ID', success: false }, { status: 400 })
      }

      const assignment = await prisma.quizAssignment.create({
        data: { quizId, groupId }
      })

      return NextResponse.json({ message: 'Quiz assigned to group', success: true, assignment })
    }
  } catch (error) {
    console.error('Assign quiz error:', error)
    return NextResponse.json({ message: 'Failed to assign quiz', success: false }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const assignmentId = searchParams.get('assignmentId')
    const quizId = searchParams.get('quizId')
    const studentId = searchParams.get('studentId')
    const groupId = searchParams.get('groupId')

    // If querying a specific assignment
    if (assignmentId) {
      const assignment = await prisma.quizAssignment.findUnique({
        where: { id: Number(assignmentId) },
        include: {
          quiz: true,
          student: true,
          group: true
        }
      })

      if (!assignment) {
        return NextResponse.json({ message: 'Assignment not found', success: false }, { status: 404 })
      }

      return NextResponse.json({ success: true, assignment })
    }

    // Otherwise, query all assignments (with optional filters)
    const assignments = await prisma.quizAssignment.findMany({
      where: {
        ...(quizId ? { quizId: Number(quizId) } : {}),
        ...(studentId ? { studentId: Number(studentId) } : {}),
        ...(groupId ? { groupId: Number(groupId) } : {})
      },
      include: {
        quiz: true,
        student: true,
        group: true
      },
      orderBy: { assignedAt: 'desc' }
    })

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Fetch assignments error:', error)
    return NextResponse.json({ message: 'Failed to fetch assignments', success: false }, { status: 500 })
  }
}
