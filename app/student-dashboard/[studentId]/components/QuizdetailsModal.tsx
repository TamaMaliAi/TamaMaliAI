import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { X, ArrowLeft, Clock, Trophy } from 'lucide-react'

type QuizDetails = {
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

type QuizAttempt = {
  id: number
  score: number
  submittedAt: string
  attemptNo: number
}

type QuizDetailsModalProps = {
  isOpen: boolean
  isLoading: boolean
  quiz: QuizDetails | null
  studentId: string | null
  onClose: () => void
  onStartQuiz: () => void
  onViewResult: (submissionId: number) => void
}

export function QuizDetailsModal({
  isOpen,
  isLoading,
  quiz,
  studentId,
  onClose,
  onStartQuiz,
  onViewResult,
}: QuizDetailsModalProps) {
  const [view, setView] = useState<'details' | 'attempts'>('details')
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loadingAttempts, setLoadingAttempts] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setView('details')
    }
  }, [isOpen])

  const fetchAttempts = async () => {
    if (!quiz || !studentId) return

    setLoadingAttempts(true)
    try {
      const res = await fetch(`/api/student/quiz-attempts?studentId=${studentId}&quizId=${quiz.id}`)
      
      if (res.ok) {
        const data = await res.json()
        setAttempts(data.attempts || [])
      } else {
        console.error('Failed to fetch attempts')
        setAttempts([])
      }
    } catch (error) {
      console.error('Error fetching attempts:', error)
      setAttempts([])
    } finally {
      setLoadingAttempts(false)
    }
  }

  const handleSeeResults = () => {
    setView('attempts')
    fetchAttempts()
  }

  const handleBackToDetails = () => {
    setView('details')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10 max-h-[90vh] overflow-y-auto'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer'
          disabled={isLoading}
        >
          <X className='w-5 h-5' />
        </button>

        {/* Back Button (only in attempts view) */}
        {view === 'attempts' && (
          <button
            onClick={handleBackToDetails}
            className='absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 cursor-pointer'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
        )}

        <div></div>

        {/* Header */}
        <div
          className={`flex flex-col items-center ${
            view === 'attempts' ? 'mt-10' : 'mt-0'
          } mb-6`}
        >
          <h2 className='text-2xl font-bold text-gray-900 text-center'>
            {view === 'details' ? 'Start Quiz' : 'Your Attempts'}
          </h2>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className='space-y-4 py-4'>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        ) : quiz ? (
          <>
            {/* Details View */}
            {view === 'details' && (
              <div className='space-y-4 py-4'>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>{quiz.title}</h3>
                  {quiz.description && (
                    <p className='text-sm text-gray-600 mt-1'>{quiz.description}</p>
                  )}
                </div>

                <div className='space-y-2 text-sm'>
                  {quiz.teacher && (
                    <p className='flex items-center gap-2'>
                      <span className='font-medium text-gray-700'>Teacher:</span>
                      <span className='text-gray-900'>{quiz.teacher.name}</span>
                    </p>
                  )}
                  <p className='flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>Total Points:</span>
                    <span className='text-gray-900'>{quiz.totalPoints}</span>
                  </p>
                  <p className='flex items-center gap-2'>
                    <span className='font-medium text-gray-700'>Type:</span>
                    <span className='text-gray-900'>
                      {quiz.type === 'MULTIPLE_CHOICE'
                        ? 'Multiple Choice'
                        : 'Identification'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Attempts View */}
            {view === 'attempts' && (
              <div className='py-4'>
                {loadingAttempts ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className='h-20 w-full rounded-lg' />
                    ))}
                  </div>
                ) : attempts.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <p className='text-sm'>No attempts yet</p>
                    <p className='text-xs mt-1'>Take the quiz to see your results here</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {attempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        onClick={() => onViewResult(attempt.id)}
                        className='border-2 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-500'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <Trophy className='h-4 w-4 text-gray-500' />
                            <span className='font-semibold text-sm'>
                              Attempt {attempt.attemptNo}
                            </span>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(attempt.score, quiz.totalPoints)}`}>
                            {attempt.score}/{quiz.totalPoints}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-gray-500'>
                          <Clock className='h-3 w-3' />
                          {formatDate(attempt.submittedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}

        {/* Footer */}
        <div className='flex gap-3 mt-6'>
          {view === 'details' ? (
            <>
              <Button
                type='button'
                variant='outline'
                onClick={handleSeeResults}
                disabled={isLoading || !quiz}
                className='flex-1 cursor-pointer'
              >
                See Results
              </Button>
              <Button
                type='button'
                onClick={onStartQuiz}
                disabled={isLoading || !quiz}
                className='flex-1 cursor-pointer'
              >
                Start Quiz
              </Button>
            </>
          ) : (
            <Button
              type='button'
              onClick={handleBackToDetails}
              disabled={loadingAttempts}
              className='w-full cursor-pointer'
            >
              Back to Quiz Details
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}