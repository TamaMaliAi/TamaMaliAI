'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { useTeacherRouteParams } from '../hooks/useTeacherRouteParams'

// Helper: Format time difference
const timeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

type Assignment = {
  id: number
  quiz: {
    id: number
    title: string
    subject?: string | null
    totalPoints: number
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
  createdAt: string
  dueDate?: string | null
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`/api/assignment`)
        const data = await res.json()
        if (data.success) setAssignments(data.assignments)
        else console.error('Error fetching assignments:', data.message)
      } catch (err) {
        console.error('Failed to fetch assignments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  const getStatusBadge = (assignment: Assignment) => {
    const due = assignment.dueDate ? new Date(assignment.dueDate) : null
    if (!due) return <Badge variant='outline'>No due date</Badge>

    const now = new Date()
    if (due < now) return <Badge className='bg-red-100 text-red-700 border-red-300'>Past Due</Badge>
    if (due.getTime() - now.getTime() < 2 * 24 * 60 * 60 * 1000)
      return <Badge className='bg-yellow-100 text-yellow-700 border-yellow-300'>Due Soon</Badge>
    return <Badge className='bg-green-100 text-green-700 border-green-300'>Ongoing</Badge>
  }

  const renderAssignments = (type: 'student' | 'group') => {
    const filtered = assignments.filter((a) => (type === 'student' ? !!a.student : !!a.group))

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
        <div className='flex flex-col items-center justify-center py-16 text-center text-gray-500'>
          <p className='text-sm italic mb-2'>No {type === 'student' ? 'Student' : 'Group'} assignments yet.</p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push(`/teacher-dashboard/${teacherId}/assignments/create`)}
          >
            + Create one now
          </Button>
        </div>
      )
    }

    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6'>
        {filtered.map((assignment) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className='cursor-pointer rounded-2xl border hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-white/80 backdrop-blur-sm'
              onClick={() => router.push(`/teacher-dashboard/${teacherId}/assignments/${assignment.id}`)}
            >
              <CardHeader className='pb-2 flex justify-between items-start'>
                <CardTitle className='text-lg font-semibold line-clamp-1 text-gray-900'>
                  {assignment.quiz.title}
                </CardTitle>
                {getStatusBadge(assignment)}
              </CardHeader>

              <CardContent className='space-y-2'>
                <p className='text-sm text-gray-600'>
                  {type === 'student'
                    ? `👩‍🎓 ${assignment.student?.name || 'Unknown Student'}`
                    : `👥 ${assignment.group?.name || 'Unknown Group'}`}
                </p>

                <p className='text-xs text-gray-500'>
                  📘 {assignment.quiz.subject || 'No subject'} • 🧮 {assignment.quiz.totalPoints} pts
                </p>

                {assignment.dueDate && (
                  <p className='text-xs text-gray-500'>⏰ Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                )}

                <div className='border-t pt-2 text-[11px] text-gray-400 flex justify-between'>
                  <span>Created {timeAgo(assignment.createdAt)}</span>
                  <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>🗂️ All Assignments</h1>
        <Button
          size='sm'
          className='rounded-xl px-4 py-2'
          onClick={() => router.push(`/teacher-dashboard/${teacherId}/assignments/create`)}
        >
          + Assign Quiz
        </Button>
      </div>

      <Tabs defaultValue='student' className='w-full'>
        <div className='flex justify-center mb-6'>
          <TabsList className='grid grid-cols-2 w-[300px]'>
            <TabsTrigger value='student'>Student Assignments</TabsTrigger>
            <TabsTrigger value='group'>Group Assignments</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='student'>{renderAssignments('student')}</TabsContent>
        <TabsContent value='group'>{renderAssignments('group')}</TabsContent>
      </Tabs>
    </div>
  )
}
