'use client'

import React, { useEffect, useState } from 'react'
import { Search, ChevronLeft, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTeacherRouteParams } from '../../hooks/useTeacherRouteParams'

type Student = {
  id: number
  name: string
  email: string
}

type Group = {
  id: number
  name: string
  students: { student: Student }[]
}

export default function GroupDataPage() {
  const [group, setGroup] = useState<Group | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  // Get groupId from URL
  const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/') : []
  const groupId = pathParts[pathParts.length - 1]

  // Fetch the specific group
  useEffect(() => {
    const fetchGroup = async () => {
      if (!teacherId || !groupId) return
      try {
        const res = await fetch(`/api/group?id=${groupId}&teacherId=${teacherId}`)

        const data = await res.json()
        if (data.success) {
          setGroup(data.group)
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [teacherId, groupId])

  const filteredStudents = group
    ? group.students.filter((s) => s.student.name.toLowerCase().includes(search.toLowerCase()))
    : []

  return (
    <div className='w-full min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        {/* Back Button + Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.back()}
              className='flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium'
            >
              <ChevronLeft className='h-4 w-4' />
              Back
            </button>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900'>
                {loading ? 'Loading group...' : group?.name || 'Group Not Found'}
              </h1>
              <p className='text-gray-600 mt-1'>List of all students under this group</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search students...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Table */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Student Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {loading ? (
                <tr>
                  <td colSpan={2} className='px-6 py-12 text-center text-gray-400 text-sm'>
                    Loading students...
                  </td>
                </tr>
              ) : !group ? (
                <tr>
                  <td colSpan={2} className='px-6 py-12 text-center text-gray-500 text-sm'>
                    Group not found.
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(({ student }) => (
                  <tr key={student.id} className='hover:bg-gray-50 transition-colors'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{student.name}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{student.email}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className='px-6 py-12 text-center text-sm text-gray-500 italic'>
                    No students found in this group.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {!loading && group && (
          <div className='text-sm text-gray-600'>
            Total Students: <span className='font-medium text-gray-900'>{group.students.length}</span>
          </div>
        )}
      </div>
    </div>
  )
}
