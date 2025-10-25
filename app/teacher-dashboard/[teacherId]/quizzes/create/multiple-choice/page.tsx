'use client'

import React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useTeacherRouteParams } from '../../../hooks/useTeacherRouteParams'

/* ----------------- 🔥 ZOD SCHEMA ----------------- */
const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean()
})

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  points: z.number().min(1, 'Points must be at least 1'),
  options: z
    .array(optionSchema)
    .min(2, 'Each question must have at least 2 options')
    .refine((opts) => opts.some((o) => o.isCorrect), {
      message: 'At least one option must be marked correct'
    })
})

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required')
})

type QuizFormValues = z.infer<typeof quizSchema>

/* ----------------- 🔥 COMPONENT ----------------- */
export default function MultipleChoiceQuizForm() {
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          text: '',
          points: 1,
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    }
  })

  const {
    fields: questionFields,
    append: addQuestion,
    remove: removeQuestion
  } = useFieldArray({
    control: form.control,
    name: 'questions'
  })

  const totalPoints = form.watch('questions')?.reduce((acc, q) => acc + q.points, 0) || 0

  const onSubmit = async (data: QuizFormValues) => {
    if (!teacherId) {
      console.error('Teacher ID is missing in route params')
      return
    }

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'MULTIPLE_CHOICE',
          totalPoints,
          teacherId,
          questions: data.questions.map((q, index) => ({
            text: q.text,
            type: 'MULTIPLE_CHOICE',
            order: index + 1,
            points: q.points,
            options: q.options
          }))
        })
      })

      if (res.ok) {
        router.push(`/teacher-dashboard/${teacherId}/quizzes`)
      } else {
        console.error('Failed to create quiz', await res.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className='relative max-w-5xl mx-auto px-6 py-10'>
      {/* HEADER */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10'>
        <div>
          <h1 className='text-3xl font-semibold text-gray-800'>Create Multiple Choice Quiz</h1>
          <p className='text-gray-500 text-sm mt-1'>Build questions, add options, and select correct answers</p>
        </div>
        <div className='bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium'>
          {questionFields.length} Questions • {totalPoints} Points
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-10'>
        {/* TITLE */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
          <input
            {...form.register('title')}
            placeholder='Ex. Midterm Multiple Choice Quiz'
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
            {questionFields.map((q, qIndex) => (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='border border-gray-200 rounded-2xl p-6 shadow-sm bg-white'
              >
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='text-lg font-semibold text-gray-800'>Question {qIndex + 1}</h2>
                  <button
                    type='button'
                    onClick={() => removeQuestion(qIndex)}
                    className='text-red-500 hover:text-red-600 text-sm font-medium'
                  >
                    Remove
                  </button>
                </div>

                {/* QUESTION TEXT */}
                <label className='block text-sm font-medium text-gray-700 mb-1'>Question Text</label>
                <input
                  {...form.register(`questions.${qIndex}.text`)}
                  placeholder='Enter your question here'
                  className='w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                />
                <p className='text-xs text-red-500 mb-2'>{form.formState.errors.questions?.[qIndex]?.text?.message}</p>

                {/* POINTS */}
                <label className='block text-sm font-medium text-gray-700 mb-1'>Points</label>
                <input
                  type='number'
                  min={1}
                  {...form.register(`questions.${qIndex}.points`, { valueAsNumber: true })}
                  className='w-32 border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                />

                {/* OPTIONS */}
                <div className='space-y-3'>
                  {form.watch(`questions.${qIndex}.options`)?.map((_, oIndex) => (
                    <div
                      key={oIndex}
                      className='flex flex-col sm:flex-row sm:items-center gap-3 border border-gray-200 rounded-lg p-3'
                    >
                      <div className='flex-1'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Option {oIndex + 1}</label>
                        <input
                          {...form.register(`questions.${qIndex}.options.${oIndex}.text`)}
                          placeholder='Enter answer option'
                          className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800'
                        />
                      </div>

                      <div className='flex items-center gap-2 mt-1 sm:mt-6'>
                        <input
                          type='checkbox'
                          {...form.register(`questions.${qIndex}.options.${oIndex}.isCorrect`)}
                          className='w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500'
                        />
                        <span className='text-sm text-gray-700'>Correct</span>
                        <button
                          type='button'
                          onClick={() => {
                            const opts = form.getValues(`questions.${qIndex}.options`)
                            opts.splice(oIndex, 1)
                            form.setValue(`questions.${qIndex}.options`, opts)
                          }}
                          className='text-red-500 hover:text-red-600 text-sm font-medium'
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* ADD OPTION */}
                  <motion.button
                    type='button'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const opts = form.getValues(`questions.${qIndex}.options`)
                      form.setValue(`questions.${qIndex}.options`, [...opts, { text: '', isCorrect: false }])
                    }}
                    className='w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all'
                  >
                    + Add Option
                  </motion.button>
                </div>
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
            addQuestion({
              text: '',
              points: 1,
              options: [
                { text: '', isCorrect: false },
                { text: '', isCorrect: false }
              ]
            })
          }
          className='cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all'
        >
          + Add New Question
        </motion.button>

        {/* FIXED FOOTER */}
        <div className='fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-4 px-6 flex justify-between items-center'>
          <span className='text-sm text-gray-600'>
            {questionFields.length} questions • {totalPoints} points
          </span>
          <button
            type='submit'
            className='bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2 rounded-lg transition-all cursor-pointer'
          >
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  )
}
