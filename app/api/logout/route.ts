import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({
      message: 'Logged out successfully',
      success: true,
    });

    // Clear cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error.',
        success: false,
      },
      { status: 500 }
    );
  }
}
