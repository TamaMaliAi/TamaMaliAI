import { User, UserRole } from '@prisma/client'

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'ella.martinez1@example.com',
    password: '$2b$10$ZpJ7d4FqK9rF6uYhW2jHneK7gQyL5zXbC8pWmD3tQ0sA2vR9lM8dW',
    name: 'Ella Martinez',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-10T10:15:31.000Z'),
    updatedAt: new Date('2025-09-10T10:15:31.000Z')
  },
  {
    id: 2,
    email: 'liam.garcia2@example.com',
    password: '$2b$10$E8nYpR2dJ3tWvB5cF4mDkQ6zU1oT7sR9pC8nXhG3eV5yN0mA2qLz',
    name: 'Liam Garcia',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-11T08:12:11.000Z'),
    updatedAt: new Date('2025-09-11T08:12:11.000Z')
  },
  {
    id: 3,
    email: 'sophia.kim3@example.com',
    password: '$2b$10$J1qRzM8vN3lFhE9dW6uTjQ1bL5rC2mY4xV8zD9nT2pS3hR7aJ9uZ',
    name: 'Sophia Kim',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-12T14:45:03.000Z'),
    updatedAt: new Date('2025-09-12T14:45:03.000Z')
  },
  {
    id: 4,
    email: 'noah.chen4@example.com',
    password: '$2b$10$X3hKfL9sW8dEoB5qR7yNnP2uZ1cT6vL4pQ9mA8eY3jS0kU6gD4rB',
    name: 'Noah Chen',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-13T11:03:09.000Z'),
    updatedAt: new Date('2025-09-13T11:03:09.000Z')
  },
  {
    id: 5,
    email: 'ava.perez5@example.com',
    password: '$2b$10$C9sKqR5mV4nGfE2uJ8lWbQ1zY3xP9rN7vH5oL2tA6pE4fC0gM9zV',
    name: 'Ava Perez',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-14T15:51:44.000Z'),
    updatedAt: new Date('2025-09-14T15:51:44.000Z')
  },
  {
    id: 6,
    email: 'ethan.nguyen6@example.com',
    password: '$2b$10$R6fKpT2wB5yHnC8eX3mAqD9lZ0sV7jU4pE2oM1rT6gL5fQ9yP8bK',
    name: 'Ethan Nguyen',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-15T13:25:11.000Z'),
    updatedAt: new Date('2025-09-15T13:25:11.000Z')
  },
  {
    id: 7,
    email: 'mia.ramirez7@example.com',
    password: '$2b$10$N4pQkS6jW7rL8xV3cD9aE5uG2mZ1nJ0bY8hR7tL5fP9sW2qC3vTg',
    name: 'Mia Ramirez',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-16T09:54:22.000Z'),
    updatedAt: new Date('2025-09-16T09:54:22.000Z')
  },
  {
    id: 8,
    email: 'oliver.lee8@example.com',
    password: '$2b$10$U5vYtR8kN3cL1pW6hJ2aF9mZ4xB0eS7uQ8rT3yG5dH9vK1tP2nC',
    name: 'Oliver Lee',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-17T16:42:19.000Z'),
    updatedAt: new Date('2025-09-17T16:42:19.000Z')
  },
  {
    id: 9,
    email: 'isabella.lopez9@example.com',
    password: '$2b$10$H2vRkL3dJ9cT8fW4gP7nS1yM6zU5bE0qV3xR9tJ2oY8lG6mZ1dF',
    name: 'Isabella Lopez',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-18T12:08:03.000Z'),
    updatedAt: new Date('2025-09-18T12:08:03.000Z')
  },
  {
    id: 10,
    email: 'lucas.santos10@example.com',
    password: '$2b$10$B4cNqW6vM8pK2rE9fD5tA1yX3lV7gJ0zQ6mR8uP5wY9bL2sH3dE',
    name: 'Lucas Santos',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-19T18:30:25.000Z'),
    updatedAt: new Date('2025-09-19T18:30:25.000Z')
  },
  {
    id: 11,
    email: 'amelia.davis11@example.com',
    password: '$2b$10$P7tNqW3rE9fC1vA5dG6jL8sY2hR4mZ0kQ9nT5xB7pU2oF6yC8vL',
    name: 'Amelia Davis',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-20T10:23:48.000Z'),
    updatedAt: new Date('2025-09-20T10:23:48.000Z')
  },
  {
    id: 12,
    email: 'benjamin.wilson12@example.com',
    password: '$2b$10$S2qDkR8wV5mN4hY9fT7xL1zB3pA6oJ0vE8nG2rC5tQ4sW3uF7yL',
    name: 'Benjamin Wilson',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-21T11:14:03.000Z'),
    updatedAt: new Date('2025-09-21T11:14:03.000Z')
  },
  {
    id: 13,
    email: 'harper.johnson13@example.com',
    password: '$2b$10$J6rQkP9dT2xM3fE7cH8yB1aL5sN0oZ4vC9pR8wU2mK6tF3gV7bJ',
    name: 'Harper Johnson',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-22T14:07:58.000Z'),
    updatedAt: new Date('2025-09-22T14:07:58.000Z')
  },
  {
    id: 14,
    email: 'elijah.brown14@example.com',
    password: '$2b$10$V4kYqN3hJ8cR1pE9tD5uA6sW2nZ7bX0lM3fG9qR5yP8oK2vT1zC',
    name: 'Elijah Brown',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-23T13:22:44.000Z'),
    updatedAt: new Date('2025-09-23T13:22:44.000Z')
  },
  {
    id: 15,
    email: 'evelyn.taylor15@example.com',
    password: '$2b$10$R7mPqK5nH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Evelyn Taylor',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-24T15:59:19.000Z'),
    updatedAt: new Date('2025-09-24T15:59:19.000Z')
  },
  {
    id: 16,
    email: 'henry.white16@example.com',
    password: '$2b$10$M3dNqT6vP8rE1fH9jC2sA7bG4yL5oZ0kV8pT2rF9uW4gM3nH6yL',
    name: 'Henry White',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-25T09:51:12.000Z'),
    updatedAt: new Date('2025-09-25T09:51:12.000Z')
  },
  {
    id: 17,
    email: 'charlotte.moore17@example.com',
    password: '$2b$10$Y2dPqK8vL5rE3hJ9fC6sA7wB1xL0oZ4vT8pR2nF9uG4mM3tH6yL',
    name: 'Charlotte Moore',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-26T14:20:11.000Z'),
    updatedAt: new Date('2025-09-26T14:20:11.000Z')
  },
  {
    id: 18,
    email: 'william.thomas18@example.com',
    password: '$2b$10$T9dNqK5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'William Thomas',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-27T17:38:42.000Z'),
    updatedAt: new Date('2025-09-27T17:38:42.000Z')
  },
  {
    id: 19,
    email: 'scarlett.jackson19@example.com',
    password: '$2b$10$D3fKqP9vL8rE1hJ9tC6sA7wB1xL0oZ4vT8pR2nF9uG4mM3tH6yL',
    name: 'Scarlett Jackson',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-28T19:14:27.000Z'),
    updatedAt: new Date('2025-09-28T19:14:27.000Z')
  },
  {
    id: 20,
    email: 'james.anderson20@example.com',
    password: '$2b$10$Q2tNkR5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'James Anderson',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-29T10:31:44.000Z'),
    updatedAt: new Date('2025-09-29T10:31:44.000Z')
  },
  {
    id: 21,
    email: 'aria.murphy21@example.com',
    password: '$2b$10$N2mPkR5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Aria Murphy',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-09-30T14:11:09.000Z'),
    updatedAt: new Date('2025-09-30T14:11:09.000Z')
  },
  {
    id: 22,
    email: 'alexander.clark22@example.com',
    password: '$2b$10$C8rMkT5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Alexander Clark',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-10-01T13:42:54.000Z'),
    updatedAt: new Date('2025-10-01T13:42:54.000Z')
  },
  {
    id: 23,
    email: 'sofia.robinson23@example.com',
    password: '$2b$10$A7mPkR5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Sofia Robinson',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-10-02T15:09:13.000Z'),
    updatedAt: new Date('2025-10-02T15:09:13.000Z')
  },
  {
    id: 24,
    email: 'mason.hall24@example.com',
    password: '$2b$10$F2vNkT5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Mason Hall',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-10-03T17:40:32.000Z'),
    updatedAt: new Date('2025-10-03T17:40:32.000Z')
  },
  {
    id: 25,
    email: 'grace.king25@example.com',
    password: '$2b$10$L8nNkT5vH4jE2cV9tD3sA8wB1xL6oJ0yZ5pT2rF9vU4gM3kH6yL',
    name: 'Grace King',
    role: UserRole.STUDENT,
    deleted: false,
    createdAt: new Date('2025-10-04T16:22:44.000Z'),
    updatedAt: new Date('2025-10-04T16:22:44.000Z')
  }
]
