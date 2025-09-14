import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role } = await req.json()

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        {
          message: 'All fields are required',
          success: false
        },
        { status: 400 }
      )
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          message: 'Please enter a valid email address',
          success: false
        },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: 'Password must be at least 6 characters long',
          success: false
        },
        { status: 400 }
      )
    }

    const validRoles = Object.values(UserRole)
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json(
        {
          message: 'Invalid role',
          success: false
        },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'User with this email already exists',
          success: false
        },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: role as UserRole
      }
    })

    return NextResponse.json(
      {
        message: 'User registered successfully',
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        message: 'Registration failed',
        success: false
      },
      { status: 500 }
    )
  }
}
