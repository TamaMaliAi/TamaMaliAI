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

// ------------------- 🔹 GET ALL or ONE GROUP -------------------
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('id')
    const teacherId = searchParams.get('teacherId')

    // 1️⃣ If groupId is provided → return that specific group
    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          students: {
            include: {
              student: { select: { id: true, name: true, email: true } }
            }
          }
        }
      })

      if (!group) {
        return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
      }

      return NextResponse.json({ success: true, group })
    }

    // 2️⃣ Otherwise → get all groups (optionally filter by teacher)
    const whereClause = teacherId ? { teacherId: Number(teacherId) } : {}

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    return NextResponse.json({ success: true, groups })
  } catch (error) {
    console.error('Get group error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch groups' }, { status: 500 })
  }
}
