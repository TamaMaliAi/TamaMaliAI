'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, AlertCircle } from 'lucide-react'
import { useStudentRouteParams } from '../../../../hooks/useStudentRouteParams'

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

type Quiz = {
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

type Answer = {
  questionId: number
  selectedOptionId?: number
  textAnswer?: string
}

export default function AnswerQuizPage() {
  const router = useRouter()
  const { studentId, quizId } = useStudentRouteParams()
  
  const [quiz, setQuiz] = React.useState<Quiz | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [submitting, setSubmitting] = React.useState(false)
  const [answers, setAnswers] = React.useState<Answer[]>([])
  const [timeElapsed, setTimeElapsed] = React.useState(0)

  // Timer
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch quiz data
  React.useEffect(() => {
    if (!quizId || !studentId) return

    const fetchQuiz = async () => {
      try {
        // Fetch from student assignment endpoint
        const res = await fetch(`/api/student/quiz?studentId=${studentId}&quizId=${quizId}`)
        
        if (!res.ok) {
          console.error('API response not OK:', res.status)
          throw new Error('Failed to fetch quiz')
        }
        
        const data = await res.json()
        console.log('Quiz data received:', data)
        
        // Check if quiz data exists
        if (!data || !data.quiz) {
          console.error('No quiz data in response:', data)
          throw new Error('Quiz data not found')
        }
        
        // Check if questions exist
        if (!data.quiz.questions || !Array.isArray(data.quiz.questions)) {
          console.error('No questions found in quiz:', data.quiz)
          throw new Error('Quiz questions not found')
        }
        
        setQuiz(data.quiz)
        
        // Initialize answers array
        const initialAnswers: Answer[] = data.quiz.questions.map((q: Question) => ({
          questionId: q.id,
          selectedOptionId: undefined,
          textAnswer: ''
        }))
        setAnswers(initialAnswers)
      } catch (err) {
        console.error('Error fetching quiz:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, studentId])

  const handleMultipleChoiceChange = (questionId: number, optionId: number) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedOptionId: optionId }
          : answer
      )
    )
  }

  const handleIdentificationChange = (questionId: number, text: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, textAnswer: text }
          : answer
      )
    )
  }

const handleSubmit = async () => {
    if (!quiz || !studentId) return

    // Validate all questions are answered
    const unanswered = answers.some((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      if (question?.type === 'MULTIPLE_CHOICE') {
        return !answer.selectedOptionId
      } else {
        return !answer.textAnswer?.trim()
      }
    })

    if (unanswered) {
      alert('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)

    try {
      console.log('Submitting quiz with data:', {
        studentId: Number(studentId),
        quizId: quiz.id,
        answersCount: answers.length,
        timeSpent: timeElapsed
      })

      const res = await fetch('/api/student/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: Number(studentId),
          quizId: quiz.id,
          answers: answers,
          timeSpent: timeElapsed
        })
      })

      const result = await res.json()
      console.log('Submit response:', result)

      if (!res.ok) {
        console.error('Failed to submit quiz:', result)
        alert(`Failed to submit quiz: ${result.message || 'Unknown error'}`)
        setSubmitting(false)
        return
      }

      // Wait a moment to ensure DB commit completes
      console.log('Waiting for database commit...')
      await new Promise(resolve => setTimeout(resolve, 500))

      console.log('Navigating to result page with submissionId:', result.submissionId)
      router.push(`/student-dashboard/${studentId}/quizzes/result/multiple-choice/${result.submissionId}`)
    } catch (err) {
      console.error('Error submitting quiz:', err)
      alert('An error occurred. Please try again.')
      setSubmitting(false)
    }
    // Note: Don't set submitting to false here, let the navigation handle it
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const answeredCount = answers.filter((answer) => {
    const question = quiz?.questions.find((q) => q.id === answer.questionId)
    if (question?.type === 'MULTIPLE_CHOICE') {
      return answer.selectedOptionId !== undefined
    } else {
      return answer.textAnswer?.trim()
    }
  }).length

  const isQuizComplete = answeredCount === quiz?.questions.length

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto p-6 space-y-6'>
        <Skeleton className='h-32 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
        <Skeleton className='h-64 w-full rounded-2xl' />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='rounded-2xl'>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <AlertCircle className='h-12 w-12 text-red-500 mb-4' />
            <p className='text-lg font-semibold'>Quiz not found</p>
            <Button className='mt-4 cursor-pointer' onClick={() => router.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Header */}
      <Card className='mb-6 rounded-2xl shadow-sm'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div className='flex-1'>
              <CardTitle className='text-2xl mb-2'>{quiz.title}</CardTitle>
              {quiz.description && (
                <p className='text-sm text-gray-600 mb-2'>{quiz.description}</p>
              )}
              <div className='flex gap-3 text-sm text-gray-500'>
                {quiz.teacher && (
                  <span>👨‍🏫 {quiz.teacher.name}</span>
                )}
                {quiz.subject && (
                  <span>📚 {quiz.subject}</span>
                )}
              </div>
            </div>
            <Badge variant='secondary' className='text-lg px-4 py-2'>
              {quiz.totalPoints} pts
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar - Sticky */}
      <Card className='mb-6 sticky top-0 z-10 bg-white rounded-2xl shadow-md'>
        <CardContent className='py-4'>
          <div className='flex justify-between items-center mb-3'>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium'>
                {answeredCount}/{quiz.questions.length} Answered
              </span>
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Clock className='h-4 w-4' />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <Button 
              onClick={(e) => {
                if (submitting || !isQuizComplete) {
                  e.preventDefault()
                  return
                }
                handleSubmit()
              }}
              className={submitting || !isQuizComplete ? 'opacity-50' : ''}
              style={{ cursor: isQuizComplete && !submitting ? 'pointer' : 'not-allowed' }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className='space-y-6'>
        {quiz.questions
          .sort((a, b) => a.order - b.order)
          .map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id)

            return (
              <Card key={question.id} className='rounded-2xl shadow-sm border-2 border-gray-200 transition-all'>
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
                      </div>
                      <p className='text-gray-900 font-normal'>{question.text}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.type === 'MULTIPLE_CHOICE' && question.options ? (
                    <div className='space-y-3'>
                      {question.options.map((option, optIndex) => {
                        const isSelected = answer?.selectedOptionId === option.id
                        return (
                          <div
                            key={option.id}
                            onClick={() => handleMultipleChoiceChange(question.id, option.id)}
                            className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                            }`}
                          >
                            <div className='flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0'
                              style={{
                                borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                                backgroundColor: isSelected ? '#3b82f6' : 'white'
                              }}
                            >
                              {isSelected && (
                                <div className='w-2 h-2 rounded-full bg-white' />
                              )}
                            </div>
                            <Label
                              className='flex-1 cursor-pointer'
                            >
                              <span className='font-medium text-gray-700 mr-2'>
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              {option.text}
                            </Label>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor={`answer-${question.id}`} className='mb-2 block text-sm font-medium'>
                        Your Answer
                      </Label>
                      <Input
                        id={`answer-${question.id}`}
                        placeholder='Type your answer here...'
                        value={answer?.textAnswer || ''}
                        onChange={(e) =>
                          handleIdentificationChange(question.id, e.target.value)
                        }
                        className='w-full'
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
      </div>

      {/* Submit Button (Bottom) - Sticky */}
      <Card className='mt-6 sticky bottom-0 bg-white rounded-2xl shadow-md'>
        <CardContent className='py-4'>
          <div className='flex justify-between items-center'>
            <div className='text-sm'>
              {isQuizComplete ? (
                <span className='text-green-600 font-medium'>
                  All questions answered!
                </span>
              ) : (
                <span className='text-gray-600'>
                  {quiz.questions.length - answeredCount} question(s) remaining
                </span>
              )}
            </div>
            <Button
              onClick={(e) => {
                if (submitting || !isQuizComplete) {
                  e.preventDefault()
                  return
                }
                handleSubmit()
              }}
              size='lg'
              className={submitting || !isQuizComplete ? 'opacity-50' : ''}
              style={{ cursor: isQuizComplete && !submitting ? 'pointer' : 'not-allowed' }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}