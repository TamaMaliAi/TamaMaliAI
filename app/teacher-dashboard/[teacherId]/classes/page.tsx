'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherRouteParams } from '../hooks/useTeacherRouteParams'

type Group = {
  id: number
  name: string
  students: {
    student: {
      id: number
      name: string
      email: string
    }
  }[]
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  useEffect(() => {
    const fetchGroups = async () => {
      if (!teacherId) return
      try {
        const res = await fetch(`/api/group?teacherId=${teacherId}`)
        const data = await res.json()

        if (data.success) {
          setGroups(data.groups)
        } else {
          console.error('Error fetching groups:', data.message)
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [teacherId])

  const renderGroups = () => {
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

    if (groups.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center p-12 text-center text-gray-500'>
          <p className='text-sm italic'>No groups found yet.</p>
        </div>
      )
    }

    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6'>
        {groups.map((group) => (
          <Card
            key={group.id}
            className='cursor-pointer rounded-2xl border hover:shadow-lg transition-all duration-200 hover:-translate-y-1'
            onClick={() => router.push(`/teacher-dashboard/${teacherId}/classes/${group.id}`)}
          >
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg font-semibold line-clamp-1'>{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600 mb-3'>
                👥 {group.students.length} Student
                {group.students.length !== 1 ? 's' : ''}
              </p>
              {group.students.slice(0, 3).map((s) => (
                <p key={s.student.id} className='text-xs text-gray-500 truncate'>
                  {s.student.name}
                </p>
              ))}
              {group.students.length > 3 && (
                <p className='text-xs text-gray-400 mt-1 italic'>+{group.students.length - 3} more</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold tracking-tight'>🏫 All Classes</h1>
        <Button
          size='sm'
          className='rounded-xl px-4 py-2'
          onClick={() => router.push(`/teacher-dashboard/${teacherId}/classes/create`)}
        >
          + Create Class
        </Button>
      </div>

      {renderGroups()}
    </div>
  )
}
