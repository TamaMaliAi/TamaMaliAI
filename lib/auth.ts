// // lib/auth.ts - Authentication utilities and middleware
// import jwt from 'jsonwebtoken';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export interface AuthenticatedRequest extends NextApiRequest {
//   user?: {
//     userId: string;
//     email: string;
//     role: 'TEACHER' | 'STUDENT';
//     iat?: number;
//     exp?: number;
//   };
// }

// export interface UserPayload {
//   userId: string;
//   email: string;
//   role: 'TEACHER' | 'STUDENT';
//   iat?: number;
//   exp?: number;
// }

// /**
//  * Verify and decode JWT token
//  */
// export function verifyToken(token: string): UserPayload | null {
//   try {
//     const decoded = jwt.verify(
//       token, 
//       process.env.JWT_SECRET || 'your-secret-key'
//     ) as UserPayload;
//     return decoded;
//   } catch (error) {
//     console.error('Token verification failed:', error);
//     return null;
//   }
// }

// /**
//  * Generate JWT token for user
//  */
// export function generateToken(payload: Omit<UserPayload, 'iat' | 'exp'>): string {
//   return jwt.sign(
//     payload,
//     process.env.JWT_SECRET || 'your-secret-key',
//     { expiresIn: '24h' }
//   );
// }

// /**
//  * Middleware to authenticate requests using JWT token from cookies
//  */
// export function authenticateToken(
//   req: AuthenticatedRequest, 
//   res: NextApiResponse, 
//   next: () => void
// ) {
//   const token = req.cookies.token;

//   if (!token) {
//     return res.status(401).json({ 
//       message: 'Access denied. No token provided.',
//       success: false 
//     });
//   }

//   const decoded = verifyToken(token);
//   if (!decoded) {
//     return res.status(403).json({ 
//       message: 'Invalid or expired token.',
//       success: false 
//     });
//   }

//   req.user = decoded;
//   next();
// }

// /**
//  * Middleware to require specific roles
//  */
// export function requireRole(allowedRoles: ('TEACHER' | 'STUDENT')[]) {
//   return (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
//     if (!req.user) {
//       return res.status(401).json({ 
//         message: 'Authentication required.',
//         success: false 
//       });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ 
//         message: 'Access denied. Insufficient permissions.',
//         success: false 
//       });
//     }

//     next();
//   };
// }

// /**
//  * Get current user from database using token
//  */
// export async function getCurrentUser(req: AuthenticatedRequest) {
//   if (!req.user) {
//     return null;
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { 
//         id: req.user.userId,
//         deleted: false 
//       },
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true
//       }
//     });

//     return user;
//   } catch (error) {
//     console.error('Error fetching current user:', error);
//     return null;
//   }
// }

// /**
//  * Check if user exists and is active
//  */
// export async function validateUserExists(userId: string): Promise<boolean> {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { 
//         id: userId,
//         deleted: false 
//       }
//     });
//     return !!user;
//   } catch (error) {
//     console.error('Error validating user existence:', error);
//     return false;
//   }
// }

// /**
//  * Higher-order function to wrap API routes with authentication
//  */
// export function withAuth(
//   handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
//   options?: {
//     roles?: ('TEACHER' | 'STUDENT')[];
//     validateUserExists?: boolean;
//   }
// ) {
//   return async (req: NextApiRequest, res: NextApiResponse) => {
//     return new Promise<void>((resolve) => {
//       authenticateToken(req as AuthenticatedRequest, res, async () => {
//         const authReq = req as AuthenticatedRequest;

//         try {
//           // Check roles if specified
//           if (options?.roles && options.roles.length > 0) {
//             if (!authReq.user || !options.roles.includes(authReq.user.role)) {
//               res.status(403).json({ 
//                 message: 'Access denied. Insufficient permissions.',
//                 success: false 
//               });
//               resolve();
//               return;
//             }
//           }

//           // Validate user exists in database if specified
//           if (options?.validateUserExists && authReq.user) {
//             const userExists = await validateUserExists(authReq.user.userId);
//             if (!userExists) {
//               res.status(401).json({ 
//                 message: 'User account not found or deactivated.',
//                 success: false 
//               });
//               resolve();
//               return;
//             }
//           }

//           // Execute the handler
//           await handler(authReq, res);
//           resolve();
//         } catch (error) {
//           console.error('Error in withAuth wrapper:', error);
//           res.status(500).json({
//             message: 'Internal server error',
//             success: false
//           });
//           resolve();
//         }
//       });
//     });
//   };
// }

// /**
//  * Extract user info from request (for use in API routes)
//  */
// export function getUserFromRequest(req: AuthenticatedRequest) {
//   return req.user || null;
// }

// /**
//  * Check if current user is a teacher
//  */
// export function isTeacher(req: AuthenticatedRequest): boolean {
//   return req.user?.role === 'TEACHER';
// }

// /**
//  * Check if current user is a student
//  */
// export function isStudent(req: AuthenticatedRequest): boolean {
//   return req.user?.role === 'STUDENT';
// }

// /**
//  * Middleware for teacher-only routes
//  */
// export const requireTeacher = (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
//   return requireRole(['TEACHER'])(req, res, next);
// };

// /**
//  * Middleware for student-only routes
//  */
// export const requireStudent = (req: AuthenticatedRequest, res: NextApiResponse, next: () => void) => {
//   return requireRole(['STUDENT'])(req, res, next);
// };

// /**
//  * Clean up database connection
//  */
// export async function disconnectPrisma() {
//   await prisma.$disconnect();
// }

// // Export prisma instance for use in other files
// export { prisma };