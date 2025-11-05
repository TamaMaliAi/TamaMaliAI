'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useTeacherRouteParams } from '../../hooks/useTeacherRouteParams'
import { CheckCircle, Users, User, BookOpen, ArrowLeft } from 'lucide-react'

/* ----------------- 🔹 ZOD SCHEMA ----------------- */
const assignSchema = z
  .object({
    quizId: z.number().min(1, 'Please select a quiz'),
    assignTo: z.enum(['STUDENT', 'GROUP']),
    studentId: z.number().optional(),
    groupId: z.number().optional()
  })
  .refine(
    (data) => {
      if (data.assignTo === 'STUDENT') return data.studentId && data.studentId > 0
      if (data.assignTo === 'GROUP') return data.groupId && data.groupId > 0
      return false
    },
    {
      message: 'Please select a student or group',
      path: ['studentId'] // This will be overridden by checking assignTo
    }
  )
  .superRefine((data, ctx) => {
    // Add specific errors for each field
    if (data.assignTo === 'STUDENT' && (!data.studentId || data.studentId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a student',
        path: ['studentId']
      })
    }
    if (data.assignTo === 'GROUP' && (!data.groupId || data.groupId <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select a group',
        path: ['groupId']
      })
    }
  })

type AssignFormValues = z.infer<typeof assignSchema>

/* ----------------- 🔹 API TYPES ----------------- */
type Quiz = { id: number; title: string }
type Group = { id: number; name: string }
type Student = { id: number; name: string }
type QuizResponse = { success: boolean; quizzes: Quiz[] }
type GroupResponse = { success: boolean; groups: Group[] }
type StudentResponse = { students: Student[] }
type AssignmentResponse = { success: boolean; message: string }

/* ----------------- 🔹 COMPONENT ----------------- */
export default function AssignQuizPage() {
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const form = useForm<AssignFormValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      assignTo: 'STUDENT',
      studentId: undefined,
      groupId: undefined
    }
  })

  const assignTo = form.watch('assignTo')

  /* ----------------- 📦 FETCH ----------------- */
  useEffect(() => {
    async function fetchData() {
      if (!teacherId) return
      try {
        const quizRes = await fetch(`/api/quiz?teacherId=${teacherId}`)
        const quizData = (await quizRes.json()) as QuizResponse
        if (quizData.success) setQuizzes(quizData.quizzes)

        const groupRes = await fetch(`/api/group?teacherId=${teacherId}`)
        const groupData = (await groupRes.json()) as GroupResponse
        if (groupData.success) setGroups(groupData.groups)

        const studentRes = await fetch('/api/students')
        const studentData = (await studentRes.json()) as StudentResponse
        if (studentData.students) setStudents(studentData.students)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    fetchData()
  }, [teacherId])

  // Clear the unused field when switching assignment type
  useEffect(() => {
    if (assignTo === 'STUDENT') {
      form.setValue('groupId', undefined)
      form.clearErrors('groupId')
    } else if (assignTo === 'GROUP') {
      form.setValue('studentId', undefined)
      form.clearErrors('studentId')
    }
  }, [assignTo, form])

  /* ----------------- 🚀 SUBMIT ----------------- */
  const onSubmit = async (data: AssignFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/assignment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: data.quizId,
          studentId: data.assignTo === 'STUDENT' ? data.studentId : undefined,
          groupId: data.assignTo === 'GROUP' ? data.groupId : undefined
        })
      })
      const result = (await res.json()) as AssignmentResponse
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => router.push(`/teacher-dashboard/${teacherId}/assignments`), 1500)
      } else alert(result.message || 'Failed to assign quiz')
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  /* ----------------- 🎨 UI ----------------- */
  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 py-10'>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className='flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition'
      >
        <ArrowLeft className='w-5 h-5' />
        <span className='font-medium'>Back to Quizzes</span>
      </motion.button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden'
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className='p-8 space-y-8'>
          {/* Quiz Selection */}
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-sm font-semibold text-gray-800'>
              <BookOpen className='w-4 h-4 text-gray-500' />
              Select Quiz
            </label>
            <div className='relative'>
              <select
                {...form.register('quizId', { valueAsNumber: true })}
                className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition'
              >
                <option value=''>Choose a quiz...</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
              <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>▼</div>
            </div>
            {form.formState.errors.quizId && (
              <p className='text-sm text-red-500'>{form.formState.errors.quizId.message}</p>
            )}
          </div>

          {/* Assign To */}
          <div className='border-t border-gray-200 pt-6'>
            <p className='text-sm font-semibold text-gray-600 mb-3 uppercase'>Assign To</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <motion.label
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer rounded-xl border p-5 flex gap-3 transition-all ${
                  assignTo === 'STUDENT' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input type='radio' value='STUDENT' {...form.register('assignTo')} className='sr-only' />
                <User className='w-5 h-5 text-gray-600 mt-0.5' />
                <div>
                  <p className='font-semibold text-gray-800'>Individual Student</p>
                  <p className='text-sm text-gray-500'>Assign to one student</p>
                </div>
                {assignTo === 'STUDENT' && <CheckCircle className='w-5 h-5 text-gray-500 ml-auto' />}
              </motion.label>

              <motion.label
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`cursor-pointer rounded-xl border p-5 flex gap-3 transition-all ${
                  assignTo === 'GROUP' ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input type='radio' value='GROUP' {...form.register('assignTo')} className='sr-only' />
                <Users className='w-5 h-5 text-gray-600 mt-0.5' />
                <div>
                  <p className='font-semibold text-gray-800'>Group</p>
                  <p className='text-sm text-gray-500'>Assign to multiple students</p>
                </div>
                {assignTo === 'GROUP' && <CheckCircle className='w-5 h-5 text-gray-500 ml-auto' />}
              </motion.label>
            </div>
          </div>

          {/* Student / Group Selector */}
          <AnimatePresence mode='wait'>
            {assignTo === 'STUDENT' && (
              <motion.div
                key='student'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className='space-y-2'
              >
                <label className='text-sm font-semibold text-gray-700'>Select Student</label>
                <select
                  {...form.register('studentId', { valueAsNumber: true })}
                  className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition'
                >
                  <option value=''>Choose a student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.studentId && (
                  <p className='text-sm text-red-500'>{form.formState.errors.studentId.message}</p>
                )}
              </motion.div>
            )}

            {assignTo === 'GROUP' && (
              <motion.div
                key='group'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className='space-y-2'
              >
                <label className='text-sm font-semibold text-gray-700'>Select Group</label>
                <select
                  {...form.register('groupId', { valueAsNumber: true })}
                  className='w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pr-10 text-gray-800 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 outline-none transition'
                >
                  <option value=''>Choose a group...</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.groupId && (
                  <p className='text-sm text-red-500'>{form.formState.errors.groupId.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type='submit'
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            disabled={loading}
            className={`w-full rounded-lg py-3 font-medium text-white transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:opacity-90'
            }`}
            style={{ backgroundColor: loading ? undefined : '#fe6100' }}
          >
            {loading ? 'Assigning Quiz...' : 'Assign Quiz'}
          </motion.button>
        </form>
      </motion.div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className='bg-white rounded-2xl p-8 text-center shadow-lg'
            >
              <div className='w-14 h-14 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-1'>Quiz Assigned</h3>
              <p className='text-gray-500'>Redirecting back to quizzes...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
