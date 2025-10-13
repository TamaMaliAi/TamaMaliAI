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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Trash2, PlusCircle } from 'lucide-react'

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

export default function IdentificationQuizForm() {
  const router = useRouter()

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [{ text: '', answer: '', points: 1 }]
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
          type: 'IDENTIFICATION',
          totalPoints: data.questions.reduce((acc, q) => acc + q.points, 0),
          teacherId: 1,
          questions: data.questions.map((q, index) => ({
            text: q.text,
            type: 'IDENTIFICATION',
            order: index + 1,
            points: q.points,
            answer: q.answer
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

  const totalPoints = form.watch('questions')?.reduce((acc, q) => acc + q.points, 0) || 0

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Create Identification Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
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

              <Accordion type='single' collapsible className='space-y-4'>
                {questionFields.map((q, qIndex) => (
                  <QuestionItem key={q.id} qIndex={qIndex} control={form.control} removeQuestion={removeQuestion} />
                ))}
              </Accordion>

              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => addQuestion({ text: '', answer: '', points: 1 })}
              >
                <PlusCircle className='h-4 w-4 mr-1' />
                Add Question
              </Button>

              <div className='sticky bottom-0 bg-white border-t pt-4 mt-6 flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  {questionFields.length} questions · {totalPoints} points
                </span>
                <Button type='submit'>Save Quiz</Button>
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
    <AccordionItem value={`q-${qIndex}`} className='border rounded-lg shadow-sm'>
      <AccordionTrigger>
        <div className='flex justify-between items-center w-full'>
          <span className='font-semibold'>Question {qIndex + 1}</span>
          <Badge variant='secondary'>Identification</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className='space-y-4 p-4'>
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

        {/* Correct answer */}
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

        <Button type='button' variant='destructive' size='sm' onClick={() => removeQuestion(qIndex)}>
          <Trash2 className='h-4 w-4 mr-1' /> Remove Question
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}
