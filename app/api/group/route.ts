import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const {
      name,
      teacherId,
      studentIds
    }: {
      name: string
      teacherId: number
      studentIds?: number[]
    } = await req.json()

    // 1. Validate fields
    if (!name || !teacherId) {
      return NextResponse.json({ message: 'Name and teacherId are required', success: false }, { status: 400 })
    }

    // 2. Check teacher validity
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: UserRole.TEACHER, deleted: false }
    })

    if (!teacher) {
      return NextResponse.json({ message: 'Invalid teacher ID', success: false }, { status: 400 })
    }

    // 3. Validate students if provided
    let validStudents: { id: number }[] = []
    if (studentIds && studentIds.length > 0) {
      validStudents = await prisma.user.findMany({
        where: { id: { in: studentIds }, role: UserRole.STUDENT, deleted: false },
        select: { id: true }
      })

      if (validStudents.length !== studentIds.length) {
        return NextResponse.json({ message: 'Some student IDs are invalid', success: false }, { status: 400 })
      }
    }

    // 4. Create group and connect students
    const group = await prisma.group.create({
      data: {
        name,
        teacherId,
        students: {
          create: validStudents.map((s) => ({
            studentId: s.id
          }))
        }
      },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Group created successfully',
      success: true,
      group
    })
  } catch (error) {
    console.error('Create group error:', error)
    return NextResponse.json({ message: 'Failed to create group', success: false }, { status: 500 })
  }
}
