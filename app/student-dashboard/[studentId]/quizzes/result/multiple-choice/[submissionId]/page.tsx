'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentRouteParams } from '../../../../hooks/useStudentRouteParams'
import { Clock, AlertCircle, CheckCircle2, XCircle, Trophy, ArrowLeft } from 'lucide-react'

type Option = {
  id: number
  text: string
  isCorrect: boolean
}

type Question = {
  id: number
  text: string
  type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
  points: number
  order: number
  options?: Option[]
}

type StudentAnswer = {
  id: number
  questionId: number
  selectedOptionId?: number
  textAnswer?: string
  isCorrect: boolean
  selectedOption?: Option
}

type QuizAttempt = {
  id: number
  score: number
  submittedAt: string
  attemptNo: number
  answers: StudentAnswer[]
  quiz: {
    id: number
    title: string
    description?: string | null
    subject?: string | null
    totalPoints: number
    type: 'MULTIPLE_CHOICE' | 'IDENTIFICATION'
    questions: Question[]
    teacher?: {
      name: string
    }
  }
}

export default function QuizResultPage() {
  const router = useRouter()
  const params = useParams()
  const [attempt, setAttempt] = React.useState<QuizAttempt | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [timeSpent, setTimeSpent] = React.useState(0)
  const { studentId } = useStudentRouteParams()

  // Get submissionId from URL params
  const submissionId = params?.submissionId as string
  
  console.log('URL Params:', params)
  console.log('Submission ID from params:', submissionId)

  React.useEffect(() => {
  window.scrollTo(0, 0)
}, [])

  // Fetch quiz results with retry logic
  React.useEffect(() => {
    console.log('useEffect triggered - submissionId:', submissionId)
    console.log('All params:', JSON.stringify(params))
    
    if (!submissionId) {
      console.log('No submissionId found, returning')
      return
    }

    const fetchResults = async (retryCount = 0) => {
      try {
        console.log('Fetching results for submission:', submissionId, 'Attempt:', retryCount + 1)
        
        // Add a small delay on first attempt to allow DB commit
        if (retryCount === 0) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        const res = await fetch(`/api/student/quiz-result?submissionId=${submissionId}`)
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Unknown error' }))
          console.error('API Error (Attempt ' + (retryCount + 1) + '):', errorData)
          
          // Retry up to 3 times if not found
          if (retryCount < 3) {
            console.log('Retrying in 1 second... (Attempt ' + (retryCount + 2) + '/4)')
            await new Promise(resolve => setTimeout(resolve, 1000))
            return fetchResults(retryCount + 1)
          }
          
          throw new Error(errorData.message || 'Failed to fetch results')
        }
        
        const data = await res.json()
        console.log('Results data:', data)
        setAttempt(data.attempt)
        setTimeSpent(data.timeSpent || 0)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching results:', err)
        setLoading(false)
        alert(`Failed to load results: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    fetchResults()
  }, [submissionId, params])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getScorePercentage = () => {
    if (!attempt) return 0
    return Math.round((attempt.score / attempt.quiz.totalPoints) * 100)
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 border-green-200'
    if (percentage >= 75) return 'bg-blue-50 border-blue-200'
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto p-6 space-y-6'>
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-48 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='rounded-2xl'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
            <p className='text-lg font-semibold'>Results not found</p>
            <Button className='mt-4' onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const percentage = getScorePercentage()
  const correctAnswers = attempt.answers.filter(a => a.isCorrect).length

  return (
    
    <div className='max-w-4xl mx-auto p-6'>
      {/* Back Button */}
      <Button
        variant='ghost'
        className='mb-4'
        onClick={() => router.push(`/student-dashboard/${studentId}/quizzes`)}
      >
        <ArrowLeft className='h-4 w-4 mr-2' />
        Back to Dashboard
      </Button>

      {/* Score Card */}
      <Card className={`mb-6 rounded-2xl shadow-lg border-2 ${getScoreBgColor(percentage)}`}>
        <CardContent className='py-8'>
          <div className='flex flex-col items-center text-center'>
            <Trophy className={`h-16 w-16 mb-4 ${getScoreColor(percentage)}`} />
            <h1 className='text-3xl font-bold mb-2'>Quiz Completed!</h1>
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            <div className='text-xl mb-4'>
              <span className='font-semibold'>{attempt.score}</span> out of{' '}
              <span className='font-semibold'>{attempt.quiz.totalPoints}</span> points
            </div>
            <div className='flex gap-6 text-sm text-gray-600'>
              <div className='flex items-center gap-2'>
                <CheckCircle2 className='h-4 w-4 text-green-600' />
                <span>{correctAnswers} Correct</span>
              </div>
              <div className='flex items-center gap-2'>
                <XCircle className='h-4 w-4 text-red-600' />
                <span>{attempt.quiz.questions.length - correctAnswers} Wrong</span>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                <span>{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Info */}
      <Card className='mb-6 rounded-2xl shadow-sm'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div className='flex-1'>
              <CardTitle className='text-2xl mb-2'>{attempt.quiz.title}</CardTitle>
              {attempt.quiz.description && (
                <p className='text-sm text-gray-600 mb-2'>{attempt.quiz.description}</p>
              )}
              <div className='flex gap-3 text-sm text-gray-500'>
                {attempt.quiz.teacher && (
                  <span>👨‍🏫 {attempt.quiz.teacher.name}</span>
                )}
                {attempt.quiz.subject && (
                  <span>📚 {attempt.quiz.subject}</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Questions Review */}
      <div className='space-y-6'>
        {attempt.quiz.questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => {
            const studentAnswer = attempt.answers.find(a => a.questionId === question.id)
            const isCorrect = studentAnswer?.isCorrect || false

            return (
              <Card 
                key={question.id} 
                className={`rounded-2xl shadow-sm border-2 ${
                  isCorrect ? 'border-green-500 bg-green-50/30' : 'border-red-500 bg-red-50/30'
                }`}
              >
                <CardHeader>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <CardTitle className='text-base'>
                          Question {index + 1}
                        </CardTitle>
                        <Badge variant='outline' className='text-xs'>
                          {question.points} {question.points === 1 ? 'pt' : 'pts'}
                        </Badge>
                        {isCorrect ? (
                          <Badge className='bg-green-600 text-white'>
                            <CheckCircle2 className='h-3 w-3 mr-1' />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className='bg-red-600 text-white'>
                            <XCircle className='h-3 w-3 mr-1' />
                            Wrong
                          </Badge>
                        )}
                      </div>
                      <p className='text-gray-900 font-normal'>{question.text}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.type === 'MULTIPLE_CHOICE' && question.options ? (
                    <div className='space-y-3'>
                      {question.options.map((option, optIndex) => {
                        const isSelected = studentAnswer?.selectedOptionId === option.id
                        const isCorrectOption = option.isCorrect
                        
                        let borderColor = 'border-gray-200'
                        let bgColor = 'bg-white'
                        
                        if (isCorrectOption) {
                          borderColor = 'border-green-500'
                          bgColor = 'bg-green-50'
                        }
                        
                        if (isSelected && !isCorrect) {
                          borderColor = 'border-red-500'
                          bgColor = 'bg-red-50'
                        }

                        return (
                          <div
                            key={option.id}
                            className={`flex items-center space-x-3 border-2 rounded-lg p-4 ${borderColor} ${bgColor}`}
                          >
                            <div 
                              className='flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0'
                              style={{
                                borderColor: isCorrectOption ? '#22c55e' : isSelected ? '#ef4444' : '#d1d5db',
                                backgroundColor: (isCorrectOption || isSelected) ? 
                                  (isCorrectOption ? '#22c55e' : '#ef4444') : 'white'
                              }}
                            >
                              {(isCorrectOption || isSelected) && (
                                <div className='w-2 h-2 rounded-full bg-white' />
                              )}
                            </div>
                            <div className='flex-1'>
                              <span className='font-medium text-gray-700 mr-2'>
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option.text}
                            </div>
                            {isCorrectOption && (
                              <CheckCircle2 className='h-5 w-5 text-green-600 flex-shrink-0' />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className='h-5 w-5 text-red-600 flex-shrink-0' />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className='space-y-3'>
                      <div className={`border-2 rounded-lg p-4 ${
                        isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      }`}>
                        <p className='text-sm font-medium text-gray-600 mb-1'>Your Answer:</p>
                        <p className='text-gray-900'>{studentAnswer?.textAnswer || 'No answer provided'}</p>
                      </div>
                      {!isCorrect && (
                        <div className='border-2 border-green-500 bg-green-50 rounded-lg p-4'>
                          <p className='text-sm font-medium text-gray-600 mb-1'>
                            <CheckCircle2 className='h-4 w-4 inline mr-1' />
                            Correct Answer:
                          </p>
                          <p className='text-gray-900 italic'>
                            (To be graded by teacher)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Bottom Actions */}
      <Card className='mt-6 rounded-2xl shadow-sm'>
        <CardContent className='py-4'>
          <div className='flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              Submitted on {new Date(attempt.submittedAt).toLocaleString()}
            </div>
            <Button onClick={() => router.push(`/student-dashboard/${studentId}/quizzes`)}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}