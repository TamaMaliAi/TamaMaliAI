'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const quizOptions = [
  {
    title: 'Multiple Choice',
    href: '/teacher-dashboard/quizzes/create/multiple-choice'
  },
  {
    title: 'Identification',
    href: '/teacher-dashboard/quizzes/create/identification'
  },
  {
    title: 'Enumeration',
    href: '/teacher-dashboard/quizzes/create/enumeration'
  }
]

export default function QuizTypeSelection() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full'>
        {quizOptions.map((quiz) => (
          <Link key={quiz.title} href={quiz.href} className='group'>
            <Card className='cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg'>
              <CardHeader>
                <CardTitle className='text-center text-xl font-semibold group-hover:text-primary'>
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-center text-gray-500'>Create a {quiz.title} quiz</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
