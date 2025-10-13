import moment from 'moment'
import { User, UserRole } from '@prisma/client'

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'ella.martinez1@example.com',
    password: '$2b$10$ZpJ7d4FqK9rF6uYhW2jHneK7gQyL5zXbC8pWmD3tQ0sA2vR9lM8dW',
    name: 'Ella Martinez',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: moment('2025-09-10T10:15:31.000Z').toDate(),
    updatedAt: moment('2025-09-10T10:15:31.000Z').toDate()
  },
  {
    id: 2,
    email: 'liam.garcia2@example.com',
    password: '$2b$10$E8nYpR2dJ3tWvB5cF4mDkQ6zU1oT7sR9pC8nXhG3eV5yN0mA2qLz',
    name: 'Liam Garcia',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: moment('2025-09-11T08:12:11.000Z').toDate(),
    updatedAt: moment('2025-09-11T08:12:11.000Z').toDate()
  },
  {
    id: 3,
    email: 'sophia.kim3@example.com',
    password: '$2b$10$J1qRzM8vN3lFhE9dW6uTjQ1bL5rC2mY4xV8zD9nT2pS3hR7aJ9uZ',
    name: 'Sophia Kim',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: moment('2025-09-12T14:45:03.000Z').toDate(),
    updatedAt: moment('2025-09-12T14:45:03.000Z').toDate()
  },
  // ... rest of your users, same pattern ...
  {
    id: 25,
    email: 'grace.king25@example.com',
    password: '$2b$10$L8nNkT5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Grace King',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: moment('2025-10-04T16:22:44.000Z').toDate(),
    updatedAt: moment('2025-10-04T16:22:44.000Z').toDate()
  }
]
