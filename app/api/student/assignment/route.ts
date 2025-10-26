import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')

    if (!studentId) {
      return NextResponse.json(
        { success: false, message: 'studentId is required' },
        { status: 400 }
      )
    }

    // Fetch all assignments for the student including teacher info
    const assignments = await prisma.quizAssignment.findMany({
      where: { 
        studentId: Number(studentId),
        deleted: false 
      },
      include: { 
        quiz: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { assignedAt: 'desc' },
    })

    return NextResponse.json({ success: true, assignments })
  } catch (error) {
    console.error('Fetch assignments error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}