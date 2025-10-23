'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type Quiz = {
  id: number
  title: string
  description?: string | null
  subject?: string | null
  totalPoints: number
  type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
  timeLimit?: number | null
}

export default function QuizConfirmPage() {
  const router = useRouter()
  const params = useParams()

  const studentId = params.studentId as string
  const quizId = params.quizId as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/student/quiz/${quizId}`)
        const data = await res.json()

        if (data.success) {
          setQuiz(data.quiz)
        } else {
          console.error('Error fetching quiz:', data.message)
        }
      } catch (error) {
        console.error('Failed to fetch quiz:', error)
      } finally {
        setLoading(false)
      }
    }

    if (quizId) fetchQuiz()
  }, [quizId])

  const handleStartQuiz = () => {
    if (!quiz || !studentId) return

    const basePath = `/student-dashboard/${studentId}/quizzes/answer`
    const nextPath =
      quiz.type === 'MULTIPLE_CHOICE'
        ? `${basePath}/multiple-choice/${quiz.id}`
        : `${basePath}/identification/${quiz.id}`

    router.push(nextPath)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="p-6 w-[400px] rounded-2xl space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        <p>Quiz not found or unavailable.</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4">
      <Card className="max-w-md w-full text-center rounded-2xl shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.description && (
            <p className="text-gray-600 text-sm">{quiz.description}</p>
          )}

          <p className="text-sm text-gray-500">
            <span className="mr-2">📘 {quiz.subject || 'N/A'}</span>
            <span>• {quiz.totalPoints} points</span>
          </p>

          {quiz.timeLimit && (
            <p className="text-sm text-gray-500">⏱ Time Limit: {quiz.timeLimit} minutes</p>
          )}

          <div className="pt-4">
            <Button
              onClick={handleStartQuiz}
              className="w-full rounded-xl text-lg font-semibold"
            >
              Start Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
