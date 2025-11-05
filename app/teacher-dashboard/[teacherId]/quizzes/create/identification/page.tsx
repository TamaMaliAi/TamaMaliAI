'use client'

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTeacherRouteParams } from '../../../hooks/useTeacherRouteParams'

const optionSchema = z.object({
  text: z.string().min(1, 'Answer is required'),
  isCorrect: z.literal(true)
})

const questionSchema = z.object({
  text: z.string().min(1, 'Question is required'),
  points: z.number().min(1, 'At least 1 point'),
  options: z.array(optionSchema).length(1, 'Identification question must have exactly one answer')
})

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question')
})

type QuizFormValues = z.infer<typeof quizSchema>

interface PrefillQuestion {
  text: string
  points: number
  answer: string
}

interface PrefillData {
  type: 'IDENTIFICATION'
  title: string
  description?: string
  questions: PrefillQuestion[]
}

export default function IdentificationQuizForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { teacherId } = useTeacherRouteParams()

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [{ text: '', points: 1, options: [{ text: '', isCorrect: true }] }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions'
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Handle prefill from URL
  useEffect(() => {
    const prefillParam = searchParams.get('prefill')
    if (prefillParam) {
      try {
        const prefillData: PrefillData = JSON.parse(decodeURIComponent(prefillParam))

        form.setValue('title', prefillData.title)
        form.setValue('description', prefillData.description || '')

        // Clear existing questions and add prefilled ones
        form.setValue(
          'questions',
          prefillData.questions.map((q) => ({
            text: q.text,
            points: q.points,
            options: [{ text: q.answer, isCorrect: true as const }]
          }))
        )
      } catch (error) {
        console.error('Failed to parse prefill data:', error)
      }
    }
  }, [searchParams, form])

  const totalPoints = form.watch('questions')?.reduce((acc, q) => acc + q.points, 0) || 0

  const onSubmit = async (data: QuizFormValues) => {
    if (!teacherId) return console.error('Missing teacher ID')

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'IDENTIFICATION',
          totalPoints,
          teacherId,
          questions: data.questions.map((q, i) => ({
            ...q,
            type: 'IDENTIFICATION',
            order: i + 1
          }))
        })
      })

      if (res.ok) router.push(`/teacher-dashboard/${teacherId}/quizzes`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative max-w-5xl mx-auto px-6 py-10'>
      {/* HEADER */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800'>Create Identification Quiz</h1>
          <p className='text-gray-500 text-sm mt-1'>Build questions and define answers below</p>
        </div>
        <div className='bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium'>
          {fields.length} Questions &bull; {totalPoints} Points
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-10'>
        {/* TITLE */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
          <input
            {...form.register('title')}
            placeholder='Ex. Midterm Identification Quiz'
            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
          />
          <p className='text-xs text-red-500 mt-1'>{form.formState.errors.title?.message}</p>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
          <textarea
            {...form.register('description')}
            placeholder='Describe your quiz purpose or coverage'
            rows={3}
            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
          />
        </div>

        {/* QUESTIONS */}
        <div className='space-y-6'>
          <AnimatePresence>
            {fields.map((q, i) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='border border-gray-200 rounded-2xl p-6 shadow-sm bg-white'
              >
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold text-gray-800'>Question {i + 1}</h2>
                  <button
                    type='button'
                    onClick={() => remove(i)}
                    className='text-red-500 hover:text-red-600 text-sm font-medium'
                  >
                    Remove
                  </button>
                </div>

                {/* Question Text */}
                <label className='block text-sm font-medium text-gray-700 mb-1'>Question Text</label>
                <input
                  {...form.register(`questions.${i}.text`)}
                  placeholder='Enter your question here'
                  className='w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                />
                <p className='text-xs text-red-500 mb-2'>{form.formState.errors.questions?.[i]?.text?.message}</p>

                {/* Points */}
                <label className='block text-sm font-medium text-gray-700 mb-1'>Points</label>
                <input
                  type='number'
                  min={1}
                  {...form.register(`questions.${i}.points`, {
                    valueAsNumber: true
                  })}
                  className='w-32 border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                />

                {/* Correct Answer */}
                <label className='block text-sm font-medium text-gray-700 mb-1'>Correct Answer</label>
                <input
                  {...form.register(`questions.${i}.options.0.text`)}
                  placeholder='Enter the correct answer'
                  className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ADD QUESTION BUTTON */}
        <motion.button
          type='button'
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            append({
              text: '',
              points: 1,
              options: [{ text: '', isCorrect: true }]
            })
          }
          className='cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all'
        >
          + Add New Question
        </motion.button>

        {/* FIXED FOOTER */}
        <div className='fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t z-20 border-gray-200 py-4 px-6 flex justify-between items-center'>
          <span className='text-sm text-gray-600'>
            {fields.length} questions &bull; {totalPoints} points
          </span>
          <button
            type='submit'
            disabled={isSubmitting}
            className='bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </form>
    </div>
  )
}
