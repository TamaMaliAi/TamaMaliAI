'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BookOpen, HelpCircle } from 'lucide-react'
import { useTeacherRouteParams } from '../../hooks/useTeacherRouteParams'

export default function QuizTypeSelection() {
  const { teacherId } = useTeacherRouteParams()

  const quizOptions = [
    {
      title: 'Multiple Choice',
      href: `/teacher-dashboard/${teacherId}/quizzes/create/multiple-choice`,
      description: 'Create quizzes with multiple choice questions',
      icon: BookOpen
    },
    {
      title: 'Identification',
      href: `/teacher-dashboard/${teacherId}/quizzes/create/identification`,
      description: 'Create quizzes with written answers',
      icon: HelpCircle
    }
  ]
  return (
    <div className='flex flex-col items-center justify-center p-6'>
      <div className='mb-12 text-center'>
        <h1 className='text-3xl md:text-4xl font-bold tracking-tight text-gray-800'>Select Quiz Type</h1>
        <p className='text-gray-500 mt-2 text-base md:text-lg'>Choose the type of quiz you want to create</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full'>
        {quizOptions.map((quiz) => {
          const Icon = quiz.icon
          return (
            <Link key={quiz.title} href={quiz.href} className='group'>
              <Card className='cursor-pointer rounded-2xl border bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
                <CardHeader className='flex flex-col items-center'>
                  <div className='flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors'>
                    <Icon className='h-7 w-7 text-primary' />
                  </div>
                  <CardTitle className='text-xl font-semibold text-gray-800 group-hover:text-primary transition-colors'>
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-center text-gray-500 text-sm'>{quiz.description}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
