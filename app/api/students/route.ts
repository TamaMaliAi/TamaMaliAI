import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    // If studentId is provided, get a single student
    if (studentId) {
      const student = await prisma.user.findUnique({
        where: {
          id: parseInt(studentId),
          role: 'STUDENT',
          deleted: false
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          studentGroups: {
            include: {
              group: true
            }
          },
          assignedQuizzes: {
            include: {
              quiz: true
            }
          },
          attempts: {
            include: {
              quiz: true
            }
          },
          createdAt: true,
          updatedAt: true
        }
      })

      if (!student) {
        return Response.json({ error: 'Student not found' }, { status: 404 })
      }

      return Response.json({ student })
    }

    // Get all students
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        deleted: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentGroups: {
          include: {
            group: true
          }
        },
        assignedQuizzes: {
          include: {
            quiz: true
          }
        },
        attempts: {
          include: {
            quiz: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return Response.json({ students })
  } catch (error) {
    console.error('Error fetching students:', error)
    return Response.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
