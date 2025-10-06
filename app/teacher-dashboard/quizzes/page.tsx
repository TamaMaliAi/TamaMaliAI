'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

type Quiz = {
  id: number
  title: string
  description?: string | null
  subject?: string | null
  totalPoints: number
  type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch('/api/quiz')
        const data = await res.json()
        if (data.success) {
          setQuizzes(data.quizzes)
        }
      } catch (err) {
        console.error('Failed to fetch quizzes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const renderQuizzes = (type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION') => {
    const filtered = quizzes.filter((q) => q.type === type)

    if (loading) {
      return (
        <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className='p-6 rounded-2xl shadow-sm space-y-3'>
              <Skeleton className='h-6 w-2/3 rounded-md' />
              <Skeleton className='h-4 w-1/2 rounded-md' />
              <Skeleton className='h-4 w-1/3 rounded-md' />
            </Card>
          ))}
        </div>
      )
    }

    if (filtered.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center p-12 text-center text-gray-500'>
          <p className='text-sm italic'>
            No {type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Identification'} quizzes found.
          </p>
        </div>
      )
    }

    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6'>
        {filtered.map((quiz) => (
          <Card
            key={quiz.id}
            className='cursor-pointer rounded-2xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1'
            onClick={() =>
              router.push(
                `/teacher-dashboard/quizzes/update/${
                  quiz.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'identification'
                }/${quiz.id}`
              )
            }
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg font-semibold line-clamp-1'>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {quiz.description && <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{quiz.description}</p>}
              <p className='text-xs text-gray-500 font-medium'>
                <span className='mr-2'>📘 {quiz.subject || 'N/A'}</span>
                <span>• {quiz.totalPoints} pts</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>📚 All Quizzes</h1>
        <Button
          size='sm'
          className='rounded-xl px-4 py-2'
          onClick={() => router.push('/teacher-dashboard/quizzes/create')}
        >
          + Create Quiz
        </Button>
      </div>

      <Tabs defaultValue='MULTIPLE_CHOICE' className='w-full'>
        <div className='flex justify-center mb-6'>
          <TabsList className='grid grid-cols-2 w-[300px]'>
            <TabsTrigger value='MULTIPLE_CHOICE'>Multiple Choice</TabsTrigger>
            <TabsTrigger value='IDENTIFICATION'>Identification</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='MULTIPLE_CHOICE'>{renderQuizzes('MULTIPLE_CHOICE')}</TabsContent>
        <TabsContent value='IDENTIFICATION'>{renderQuizzes('IDENTIFICATION')}</TabsContent>
      </Tabs>
    </div>
  )
}
