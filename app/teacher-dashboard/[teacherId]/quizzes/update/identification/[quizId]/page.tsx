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
import { Badge } from '@/components/ui/badge'
import { Trash2, PlusCircle } from 'lucide-react'
import { useTeacherRouteParams } from '@/app/teacher-dashboard/[teacherId]/hooks/useTeacherRouteParams'

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  answer: z.string().min(1, 'Answer is required'),
  points: z.number().min(1, 'Points must be at least 1')
})

const quizSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required')
})

type QuizFormValues = z.infer<typeof quizSchema>
type QuestionFormValues = QuizFormValues['questions'][number]

const DEFAULT_QUESTION: QuestionFormValues = { text: '', answer: '', points: 1 }

interface ApiQuestion {
  text: string
  points: number
  options: { text: string; isCorrect: boolean }[]
}

interface ApiQuiz {
  title: string
  description?: string
  questions: ApiQuestion[]
}

export default function UpdateIdentificationQuizForm() {
  const router = useRouter()
  const { teacherId, quizId } = useTeacherRouteParams()

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [DEFAULT_QUESTION]
    },
    mode: 'onChange'
  })

  const {
    fields: questionFields,
    append: addQuestion,
    remove: removeQuestion
  } = useFieldArray({
    control: form.control,
    name: 'questions'
  })

  React.useEffect(() => {
    if (!quizId) return

    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz?teacherId=${teacherId}&quizId=${quizId}`)
        if (!res.ok) throw new Error('Failed to fetch quiz')
        const { quiz }: { quiz: ApiQuiz } = await res.json()

        form.reset({
          title: quiz.title,
          description: quiz.description ?? '',
          questions: quiz.questions.map(
            (q): QuestionFormValues => ({
              text: q.text,
              points: q.points,
              answer: q.options.find((o) => o.isCorrect)?.text ?? ''
            })
          )
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchQuiz()
  }, [quizId, form, teacherId])

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const res = await fetch(`/api/quiz?id=${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'IDENTIFICATION',
          totalPoints: data.questions.reduce((acc, q) => acc + q.points, 0),
          teacherId: teacherId,
          questions: data.questions.map((q, index) => ({
            text: q.text,
            type: 'IDENTIFICATION',
            order: index + 1,
            points: q.points,
            answer: q.answer
          }))
        })
      })

      if (!res.ok) {
        const error = await res.json()
        console.error('Failed to update quiz:', error)
        return
      }

      router.push(`/teacher-dashboard/${teacherId}/quizzes`)
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  const totalPoints = form.watch('questions')?.reduce((acc, q) => acc + q.points, 0) || 0

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Update Identification Quiz</CardTitle>
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
              </div>

              {/* Add Question */}
              <Button type='button' variant='outline' className='w-full' onClick={() => addQuestion(DEFAULT_QUESTION)}>
                <PlusCircle className='h-4 w-4 mr-1' />
                Add Question
              </Button>

              {/* Footer */}
              <div className='sticky bottom-0 bg-white border-t pt-4 mt-6 flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  {questionFields.length} questions · {totalPoints} points
                </span>
                <Button type='submit'>Update Quiz</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

function QuestionItem({
  qIndex,
  control,
  removeQuestion
}: {
  qIndex: number
  control: Control<QuizFormValues>
  removeQuestion: (index: number) => void
}) {
  return (
    <Card className='border rounded-lg shadow-sm'>
      <CardHeader className='flex flex-row justify-between items-center'>
        <CardTitle className='text-base'>Question {qIndex + 1}</CardTitle>
        <Badge variant='secondary'>Identification</Badge>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Question Text */}
        <FormField
          control={control}
          name={`questions.${qIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder='Enter question text' {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Correct Answer */}
        <FormField
          control={control}
          name={`questions.${qIndex}.answer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correct Answer</FormLabel>
              <FormControl>
                <Input placeholder='Enter the correct answer' {...field} />
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
                <Input type='number' min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remove Question */}
        <Button type='button' variant='destructive' size='sm' onClick={() => removeQuestion(qIndex)}>
          <Trash2 className='h-4 w-4 mr-1' />
          Remove Question
        </Button>
      </CardContent>
    </Card>
  )
}
