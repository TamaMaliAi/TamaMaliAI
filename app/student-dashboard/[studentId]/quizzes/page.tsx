'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useStudentRouteParams } from '../hooks/useStudentRouteParams'
import { QuizDetailsModal } from '../components/QuizdetailsModal'

type Quiz = {
  id: number
  title: string
  description?: string | null
  subject?: string | null
  totalPoints: number
  type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
}

type QuizDetails = Quiz & {
  teacher?: {
    name: string
    email?: string
  }
}

// Add this new type for the API response
type ApiAssignment = {
  quiz: {
    id: number
    title: string
    description?: string | null
    subject?: string | null
    totalPoints: number
    type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
    teacher?: {
      name: string
      email?: string
    }
  }
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizDetails | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false)
  const router = useRouter()
  const { studentId } = useStudentRouteParams()

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!studentId) return

      try {
        const res = await fetch(`/api/student/assignment?studentId=${studentId}`, {
          cache: 'no-store',
        })

        if (!res.ok) {
          console.error('API returned error status:', res.status)
          setLoading(false)
          return
        }

        const data = await res.json()

        if (data.success) {
          // Fix line 55 - Replace 'any' with 'ApiAssignment'
          const mappedQuizzes = data.assignments.map((a: ApiAssignment) => ({
            id: a.quiz.id,
            title: a.quiz.title,
            description: a.quiz.description,
            subject: a.quiz.subject,
            totalPoints: a.quiz.totalPoints,
            type: a.quiz.type,
          }))
          setQuizzes(mappedQuizzes)
        } else {
          console.error('Error fetching quizzes:', data.message)
        }
      } catch (err) {
        console.error('Failed to fetch quizzes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [studentId])

  const handleQuizClick = async (quizId: number) => {
    setLoadingQuizDetails(true)
    setModalOpen(true)

    try {
      const assignment = quizzes.find(q => q.id === quizId)
      
      if (!assignment) {
        console.error('Quiz not found in local data')
        setModalOpen(false)
        setLoadingQuizDetails(false)
        return
      }

      const url = `/api/student/assignment?studentId=${studentId}`
      console.log('Fetching assignments from:', url)
      
      const res = await fetch(url, {
        cache: 'no-store',
      })

      console.log('Response status:', res.status)
      
      const data = await res.json()
      console.log('Response data:', data)

      if (!res.ok) {
        console.error('Failed to fetch quiz details:', data.message || 'Unknown error')
        setModalOpen(false)
        return
      }

      if (data.success && data.assignments) {
        // Fix line 110 - Replace 'any' with 'ApiAssignment'
        const quizAssignment = data.assignments.find((a: ApiAssignment) => a.quiz.id === quizId)
        
        if (quizAssignment && quizAssignment.quiz) {
          setSelectedQuiz({
            id: quizAssignment.quiz.id,
            title: quizAssignment.quiz.title,
            description: quizAssignment.quiz.description,
            subject: quizAssignment.quiz.subject,
            totalPoints: quizAssignment.quiz.totalPoints,
            type: quizAssignment.quiz.type,
            teacher: quizAssignment.quiz.teacher,
          })
        } else {
          console.error('Quiz not found in assignments')
          setModalOpen(false)
        }
      } else {
        console.error('Quiz data not found in response')
        setModalOpen(false)
      }
    } catch (err) {
      console.error('Error fetching quiz details:', err)
      setModalOpen(false)
    } finally {
      setLoadingQuizDetails(false)
    }
  }

  const handleStartQuiz = () => {
    if (selectedQuiz) {
      const quizType = selectedQuiz.type === 'MULTIPLE_CHOICE' ? 'multiple-choice' : 'identification'
      router.push(`/student-dashboard/${studentId}/quizzes/answer/${quizType}/${selectedQuiz.id}`)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedQuiz(null)
  }

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
            onClick={() => handleQuizClick(quiz.id)}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg font-semibold line-clamp-1'>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {quiz.description && (
                <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{quiz.description}</p>
              )}
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

  const handleViewResult = (submissionId: number) => {
    if (studentId && selectedQuiz) {
      const resultPath = selectedQuiz.type === 'IDENTIFICATION' 
        ? `/student-dashboard/${studentId}/quizzes/result/identification/${submissionId}`
        : `/student-dashboard/${studentId}/quizzes/result/multiple-choice/${submissionId}`
      router.push(resultPath)
      setModalOpen(false)
    }
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>📚 All Quizzes</h1>
      </div>

      <Tabs defaultValue='MULTIPLE_CHOICE' className='w-full'>
        <div className='flex justify-center mb-6'>
          <TabsList className='grid grid-cols-2 w-[300px]'>
            <TabsTrigger value='MULTIPLE_CHOICE' className='cursor-pointer'>
              Multiple Choice
            </TabsTrigger>
            <TabsTrigger value='IDENTIFICATION' className='cursor-pointer'>
              Identification
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='MULTIPLE_CHOICE'>{renderQuizzes('MULTIPLE_CHOICE')}</TabsContent>
        <TabsContent value='IDENTIFICATION'>{renderQuizzes('IDENTIFICATION')}</TabsContent>
      </Tabs>

      <QuizDetailsModal
        isOpen={modalOpen}
        isLoading={loadingQuizDetails}
        quiz={selectedQuiz}
        studentId={studentId ? String(studentId) : null}
        onClose={handleCloseModal}
        onStartQuiz={handleStartQuiz}
        onViewResult={handleViewResult}
      />
    </div>
  )
}