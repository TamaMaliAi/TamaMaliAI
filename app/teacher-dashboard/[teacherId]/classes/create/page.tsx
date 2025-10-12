'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import StudentMultiSelect from './components/StudentMultiSelect'

/* ----------------- 🔹 MOCK DATA ----------------- */
const mockUsers = [
  { id: 1, email: 'ella.martinez1@example.com', name: 'Ella Martinez', role: 'STUDENT' },
  { id: 2, email: 'liam.garcia2@example.com', name: 'Liam Garcia', role: 'STUDENT' },
  { id: 3, email: 'sophia.kim3@example.com', name: 'Sophia Kim', role: 'STUDENT' },
  { id: 4, email: 'noah.chen4@example.com', name: 'Noah Chen', role: 'STUDENT' },
  { id: 5, email: 'ava.perez5@example.com', name: 'Ava Perez', role: 'STUDENT' },
  { id: 6, email: 'ethan.nguyen6@example.com', name: 'Ethan Nguyen', role: 'STUDENT' },
  { id: 7, email: 'mia.ramirez7@example.com', name: 'Mia Ramirez', role: 'STUDENT' },
  { id: 8, email: 'oliver.lee8@example.com', name: 'Oliver Lee', role: 'STUDENT' },
  { id: 9, email: 'isabella.lopez9@example.com', name: 'Isabella Lopez', role: 'STUDENT' },
  { id: 10, email: 'lucas.santos10@example.com', name: 'Lucas Santos', role: 'STUDENT' }
]

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
        router.push(`/teacher-dashboard/${teacherId}/groups`)
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
          <StudentMultiSelect students={mockUsers} selectedIds={selectedStudents} onChange={setSelectedStudents} />
        </div>

        {/* Submit */}
        <motion.button
          type='submit'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-medium shadow-md transition-all ${
            loading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg'
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
          disabled={loading}
          className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2 rounded-lg transition-all disabled:opacity-60'
        >
          {loading ? 'Saving...' : 'Save Group'}
        </button>
      </div>
    </div>
  )
}
