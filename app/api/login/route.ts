import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { username, password, role }: { username: string; password: string; role: string } = await req.json()

    // Log user input (except password for security)
    console.log('Login attempt:', { username, role })

    if (!username || !password || !role) {
      return NextResponse.json({ message: 'All fields are required', success: false }, { status: 400 })
    }

    const validRoles = Object.values(UserRole)
    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ message: 'Invalid role', success: false }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        email: username,
        role: role as UserRole,
        deleted: false
      }
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials', success: false }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email, role: user.role }, // convert ID to string
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    const response = NextResponse.json({
      message: 'Login successful',
      success: true,
      user: {
        id: user.id.toString(), // convert ID to string
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Login failed', success: false }, { status: 500 })
  }
}
