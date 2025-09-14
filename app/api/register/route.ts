import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    // Basic validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ 
        message: 'All fields are required',
        success: false 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        message: 'Password must be at least 6 characters long',
        success: false 
      }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'User with this email already exists',
        success: false 
      }, { status: 409 });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: role
      }
    });

    return NextResponse.json({
      message: 'User registered successfully',
      success: true
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: 'Registration failed',
      success: false 
    }, { status: 500 });
  }
}