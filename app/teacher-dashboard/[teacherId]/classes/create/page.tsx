'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import StudentMultiSelect from './components/StudentMultiSelect'

/* ----------------- 🔹 TYPES ----------------- */
interface Student {
  id: number
  email: string
  name: string
  role: string
}

/* ----------------- 🔹 VALIDATION ----------------- */
const groupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  studentIds: z.array(z.number()).optional()
})

type GroupFormValues = z.infer<typeof groupSchema>

/* ----------------- 🔹 PAGE ----------------- */
export default function CreateGroupPage() {
  const router = useRouter()
  const params = useParams()
  const teacherId = Number(params.teacherId)

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      studentIds: []
    }
  })

  const [loading, setLoading] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [fetchingStudents, setFetchingStudents] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setFetchingStudents(true)
        setFetchError(null)

        const res = await fetch('/api/students')
        const data = await res.json()

        if (res.ok && data.students) {
          setStudents(data.students)
        } else {
          setFetchError(data.error || 'Failed to fetch students')
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setFetchError('Failed to load students. Please try again.')
      } finally {
        setFetchingStudents(false)
      }
    }

    fetchStudents()
  }, [])

  const onSubmit = async (data: GroupFormValues) => {
    if (!teacherId) return alert('Missing teacher ID')

    setLoading(true)
    try {
      const res = await fetch('/api/group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          teacherId,
          studentIds: selectedStudents
        })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        alert('✅ Group created successfully!')
        router.push(`/teacher-dashboard/${teacherId}/classes`)
      } else {
        alert(`❌ ${result.message || 'Failed to create group'}`)
      }
    } catch (error) {
      console.error('Create group error:', error)
      alert('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative max-w-5xl mx-auto px-6 py-10'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800'>Create New Group</h1>
          <p className='text-gray-500 text-sm mt-1'>Name the group and select students to include</p>
        </div>
        <div className='bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium'>
          {selectedStudents.length} selected
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* Group Name */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Group Name</label>
          <input
            {...form.register('name')}
            placeholder='e.g. BSCA 2A – Section 1'
            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
          />
          {form.formState.errors.name && (
            <p className='text-xs text-red-500 mt-1'>{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Student Selector */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Select Students</label>

          {fetchingStudents ? (
            <div className='flex items-center justify-center py-12 border border-gray-200 rounded-lg'>
              <div className='text-center'>
                <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-3'></div>
                <p className='text-sm text-gray-500'>Loading students...</p>
              </div>
            </div>
          ) : fetchError ? (
            <div className='py-12 border border-red-200 rounded-lg bg-red-50 text-center'>
              <p className='text-sm text-red-600 mb-3'>{fetchError}</p>
              <button
                type='button'
                onClick={() => window.location.reload()}
                className='text-sm text-indigo-600 hover:text-indigo-700 font-medium'
              >
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className='py-12 border border-gray-200 rounded-lg bg-gray-50 text-center'>
              <p className='text-sm text-gray-500'>No students available</p>
            </div>
          ) : (
            <StudentMultiSelect students={students} selectedIds={selectedStudents} onChange={setSelectedStudents} />
          )}
        </div>

        {/* Submit */}
        <motion.button
          type='submit'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading || fetchingStudents}
          className={`w-full py-3 rounded-xl font-medium shadow-md transition-all ${
            loading || fetchingStudents
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
          }`}
        >
          {loading ? 'Creating Group...' : 'Create Group'}
        </motion.button>
      </form>

      {/* Fixed Footer */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-4 px-6 flex justify-between items-center'>
        <span className='text-sm text-gray-600'>
          {selectedStudents.length} student{selectedStudents.length !== 1 && 's'} selected
        </span>
        <button
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading || fetchingStudents}
          className='bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all disabled:opacity-60'
        >
          {loading ? 'Saving...' : 'Save Group'}
        </button>
      </div>
    </div>
  )
}
