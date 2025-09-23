'use client'

import * as React from 'react'
import { useForm, useFieldArray, Control } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlusCircle, Trash2 } from 'lucide-react'

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

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'MULTIPLE_CHOICE',
          totalPoints: data.questions.reduce((acc, q) => acc + q.points, 0),
          teacherId: 1, // TODO: replace with real teacherId
          questions: data.questions.map((q, index) => ({
            text: q.text,
            type: 'MULTIPLE_CHOICE', // 👈 required by API
            order: index + 1, // 👈 required by API
            points: q.points,
            options: q.options
          }))
        })
      })

      if (res.ok) {
        router.push('/teacher-dashboard/quizzes')
      } else {
        console.error('Failed to create quiz', await res.json())
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Create Multiple Choice Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              {/* Title */}
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter quiz title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Enter quiz description' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Questions */}
              <div className='space-y-6'>
                {questionFields.map((q, qIndex) => (
                  <QuestionItem key={q.id} qIndex={qIndex} control={form.control} removeQuestion={removeQuestion} />
                ))}
                <Button
                  type='button'
                  variant='outline'
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
                >
                  <PlusCircle className='h-4 w-4 mr-1' />
                  Add Question
                </Button>
              </div>

              <Button type='submit' className='w-full'>
                Save Quiz
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

/* ----------------- 🔥 Child Component ----------------- */
function QuestionItem({
  qIndex,
  control,
  removeQuestion
}: {
  qIndex: number
  control: Control<QuizFormValues>
  removeQuestion: (index: number) => void
}) {
  const {
    fields: optionFields,
    append: addOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`
  })

  return (
    <Card className='p-4'>
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold'>Question {qIndex + 1}</h3>
        <Button type='button' variant='ghost' size='icon' onClick={() => removeQuestion(qIndex)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>

      {/* Question text */}
      <FormField
        control={control}
        name={`questions.${qIndex}.text`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question</FormLabel>
            <FormControl>
              <Input placeholder='Enter question text' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Points */}
      <FormField
        control={control}
        name={`questions.${qIndex}.points`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Points</FormLabel>
            <FormControl>
              <Input type='number' {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Options */}
      <div className='mt-4 space-y-2'>
        {optionFields.map((o, oIndex) => (
          <div key={o.id} className='flex items-center gap-2 border rounded-md p-2'>
            <FormField
              control={control}
              name={`questions.${qIndex}.options.${oIndex}.text`}
              render={({ field }) => (
                <FormItem className='flex-1'>
                  <FormLabel>Answer {oIndex + 1}</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter answer option' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`questions.${qIndex}.options.${oIndex}.isCorrect`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct?</FormLabel>
                  <FormControl>
                    <input type='checkbox' checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type='button' variant='ghost' size='icon' onClick={() => removeOption(oIndex)}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
        <Button type='button' variant='secondary' size='sm' onClick={() => addOption({ text: '', isCorrect: false })}>
          <PlusCircle className='h-4 w-4 mr-1' />
          Add Answer
        </Button>
      </div>
    </Card>
  )
}
