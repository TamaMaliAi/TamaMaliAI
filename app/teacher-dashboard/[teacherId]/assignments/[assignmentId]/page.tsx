'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  User,
  AlertCircle,
  CheckCircle,
  Timer,
  Award,
  BookOpen,
  AlertTriangle
} from 'lucide-react'

type Assignment = {
  id: number
  quiz: {
    id: number
    title: string
    description?: string
    subject?: string
    type: string
    timeLimit?: number
    totalPoints: number
    deadline?: string
  }
  student?: {
    id: number
    name: string
    email: string
  } | null
  group?: {
    id: number
    name: string
  } | null
  assignedAt: string
}

export default function AssignmentDetailsPage() {
  const { assignmentId } = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!assignmentId) return

    const fetchAssignment = async () => {
      try {
        const res = await fetch(`/api/assignment?assignmentId=${assignmentId}`)
        const data = await res.json()

        if (data.success && data.assignment) {
          setAssignment(data.assignment)
        } else if (data.success && data.assignments?.length > 0) {
          setAssignment(data.assignments[0])
        }
      } catch (err) {
        console.error('Error fetching assignment:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignment()
  }, [assignmentId])

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null

    const now = new Date()
    const deadlineDate = new Date(deadline)
    const timeDiff = deadlineDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24)

    if (timeDiff < 0) {
      return { status: 'overdue', label: 'Past Due', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle }
    } else if (hoursDiff < 24) {
      return {
        status: 'urgent',
        label: 'Due Soon',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: AlertTriangle
      }
    } else if (daysDiff < 3) {
      return {
        status: 'upcoming',
        label: 'Due Soon',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Clock
      }
    } else {
      return {
        status: 'active',
        label: 'Active',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle
      }
    }
  }

  const formatTimeRemaining = (deadline?: string) => {
    if (!deadline) return null

    const now = new Date()
    const deadlineDate = new Date(deadline)
    const timeDiff = deadlineDate.getTime() - now.getTime()

    if (timeDiff < 0) {
      const overdueDays = Math.abs(Math.floor(timeDiff / (1000 * 60 * 60 * 24)))
      return `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`
    } else {
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`
    }
  }

  if (loading) {
    return (
      <div className='max-w-4xl mx-auto mt-12 px-4 space-y-6'>
        <Skeleton className='h-10 w-24' />
        <Skeleton className='h-12 w-2/3' />
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-32 w-full' />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className='max-w-4xl mx-auto mt-20 px-4 text-center'>
        <div className='bg-gray-50 rounded-lg p-12 border'>
          <AlertCircle className='w-16 h-16 mx-auto mb-4 text-gray-400' />
          <h2 className='text-2xl font-semibold mb-2 text-gray-900'>Assignment Not Found</h2>
          <p className='text-gray-600 mb-6'>
            The assignment you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>

          <Button onClick={() => router.back()} className='inline-flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  const deadlineStatus = getDeadlineStatus(assignment.quiz.deadline)
  const timeRemaining = formatTimeRemaining(assignment.quiz.deadline)
  const StatusIcon = deadlineStatus?.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='max-w-4xl mx-auto mt-8 px-4 pb-12 space-y-6'
    >
      {/* Header */}
      <div className='flex items-center justify-between'>
        <Button variant='ghost' onClick={() => router.back()} className='inline-flex items-center gap-2 -ml-3'>
          <ArrowLeft className='h-4 w-4' /> Back
        </Button>
      </div>

      {/* Status Alert */}
      {deadlineStatus && (deadlineStatus.status === 'overdue' || deadlineStatus.status === 'urgent') && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
            deadlineStatus.status === 'overdue'
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-orange-50 border-orange-300 text-orange-800'
          }`}
        >
          <AlertCircle className='h-5 w-5 mt-0.5 flex-shrink-0' />
          <p className='font-medium text-base'>
            {deadlineStatus.status === 'overdue'
              ? `This assignment is ${timeRemaining}`
              : `Deadline approaching: ${timeRemaining}`}
          </p>
        </div>
      )}

      {/* Main Quiz Card */}
      <Card className='border-2 shadow-lg overflow-hidden'>
        <div className='bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 border-b'>
          <div className='flex items-start justify-between gap-4 mb-3'>
            <div className='flex-1'>
              <div className='flex items-center gap-3 mb-2 flex-wrap'>
                <h1 className='text-3xl font-bold tracking-tight text-gray-900'>{assignment.quiz.title}</h1>
                {deadlineStatus && StatusIcon && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${deadlineStatus.color}`}
                  >
                    <StatusIcon className='h-3.5 w-3.5' />
                    {deadlineStatus.label}
                  </span>
                )}
              </div>
              {assignment.quiz.subject && (
                <div className='flex items-center gap-2 text-gray-600'>
                  <BookOpen className='h-4 w-4' />
                  <span className='text-sm font-medium'>{assignment.quiz.subject}</span>
                </div>
              )}
            </div>
          </div>

          {assignment.quiz.description && (
            <p className='text-base text-gray-700 leading-relaxed mt-4 max-w-3xl'>{assignment.quiz.description}</p>
          )}
        </div>

        <CardContent className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Type */}
            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
              <div className='flex items-center gap-2 mb-2 text-gray-600'>
                <BookOpen className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-wide'>Type</span>
              </div>
              <p className='text-lg font-semibold text-gray-900 capitalize'>{assignment.quiz.type.replace('_', ' ')}</p>
            </div>

            {/* Points */}
            <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
              <div className='flex items-center gap-2 mb-2 text-gray-600'>
                <Award className='h-4 w-4' />
                <span className='text-xs font-medium uppercase tracking-wide'>Total Points</span>
              </div>
              <p className='text-lg font-semibold text-gray-900'>{assignment.quiz.totalPoints}</p>
            </div>

            {/* Time Limit */}
            {assignment.quiz.timeLimit && (
              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='flex items-center gap-2 mb-2 text-gray-600'>
                  <Timer className='h-4 w-4' />
                  <span className='text-xs font-medium uppercase tracking-wide'>Time Limit</span>
                </div>
                <p className='text-lg font-semibold text-gray-900'>{assignment.quiz.timeLimit} mins</p>
              </div>
            )}

            {/* Deadline */}
            {assignment.quiz.deadline && (
              <div
                className={`rounded-lg p-4 border-2 ${
                  deadlineStatus?.status === 'overdue'
                    ? 'bg-red-50 border-red-300'
                    : deadlineStatus?.status === 'urgent'
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className='flex items-center gap-2 mb-2 text-gray-600'>
                  <Calendar className='h-4 w-4' />
                  <span className='text-xs font-medium uppercase tracking-wide'>Deadline</span>
                </div>
                <p className='text-sm font-semibold mb-1 text-gray-900'>
                  {new Date(assignment.quiz.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className='text-xs text-gray-600'>
                  {new Date(assignment.quiz.deadline).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
                {timeRemaining && (
                  <p
                    className={`text-xs mt-2 font-medium ${
                      deadlineStatus?.status === 'overdue' ? 'text-red-700' : 'text-gray-700'
                    }`}
                  >
                    {timeRemaining}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Details Card */}
      <Card className='border-2 shadow-md'>
        <CardHeader className='bg-gray-50'>
          <CardTitle className='text-xl flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6 space-y-4'>
          {/* Assigned To */}
          <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='bg-blue-100 p-2.5 rounded-lg'>
              {assignment.student ? (
                <User className='h-5 w-5 text-blue-700' />
              ) : (
                <Users className='h-5 w-5 text-blue-700' />
              )}
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600 mb-1'>Assigned To</p>
              {assignment.student ? (
                <div>
                  <p className='text-lg font-semibold text-gray-900'>{assignment.student.name}</p>
                  <p className='text-sm text-gray-600'>{assignment.student.email}</p>
                  <span className='inline-block mt-2 px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full'>
                    Individual Student
                  </span>
                </div>
              ) : assignment.group ? (
                <div>
                  <p className='text-lg font-semibold text-gray-900'>{assignment.group.name}</p>
                  <span className='inline-block mt-2 px-2.5 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full'>
                    Group Assignment
                  </span>
                </div>
              ) : (
                <p className='text-gray-500 italic'>No assignment target specified</p>
              )}
            </div>
          </div>

          {/* Assigned Date */}
          <div className='flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='bg-blue-100 p-2.5 rounded-lg'>
              <Clock className='h-5 w-5 text-blue-700' />
            </div>
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-600 mb-1'>Assigned On</p>
              <p className='text-lg font-semibold text-gray-900'>
                {new Date(assignment.assignedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className='text-sm text-gray-600'>
                {new Date(assignment.assignedAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
