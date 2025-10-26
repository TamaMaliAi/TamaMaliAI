'use client'

import * as React from 'react'
import { useForm, useFieldArray, Control } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { PlusCircle, Trash2 } from 'lucide-react'

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
type QuestionFormValues = QuizFormValues['questions'][number]
type OptionFormValues = QuestionFormValues['options'][number]

const DEFAULT_OPTION: OptionFormValues = { text: '', isCorrect: false }
const DEFAULT_QUESTION: QuestionFormValues = {
  text: '',
  points: 1,
  options: [DEFAULT_OPTION, DEFAULT_OPTION]
}

export default function UpdateMultipleChoiceQuizForm() {
  const router = useRouter()
  const { quizId } = useParams() as { quizId: string }

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
        const res = await fetch(`/api/quiz?id=${quizId}`)
        if (!res.ok) throw new Error('Failed to fetch quiz')
        const { quiz }: { quiz: QuizFormValues } = await res.json()

        form.reset({
          title: quiz.title,
          description: quiz.description ?? '',
          questions: quiz.questions.map(
            (q): QuestionFormValues => ({
              text: q.text,
              points: q.points,
              options: q.options.map(
                (o): OptionFormValues => ({
                  text: o.text,
                  isCorrect: o.isCorrect
                })
              )
            })
          )
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchQuiz()
  }, [quizId, form])

  const onSubmit = async (data: QuizFormValues) => {
    try {
      const res = await fetch(`/api/quiz?id=${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          type: 'MULTIPLE_CHOICE',
          totalPoints: data.questions.reduce((acc, q) => acc + q.points, 0),
          teacherId: 1, // TODO: replace with real teacherId
          questions: data.questions.map((q, index) => ({
            text: q.text,
            type: 'MULTIPLE_CHOICE',
            order: index + 1,
            points: q.points,
            options: q.options
          }))
        })
      })

      if (!res.ok) {
        const error = await res.json()
        console.error('Failed to update quiz:', error)
        return
      }

      router.push('/teacher-dashboard/quizzes')
    } catch (err) {
      console.error('Unexpected error:', err)
    }
  }

  const totalPoints = form.watch('questions')?.reduce((acc, q) => acc + q.points, 0) || 0

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Update Multiple Choice Quiz</CardTitle>
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

              <Button type='button' variant='outline' className='w-full' onClick={() => addQuestion(DEFAULT_QUESTION)}>
                <PlusCircle className='h-4 w-4 mr-1' />
                Add Question
              </Button>

              <div className='sticky bottom-0 bg-white border-t pt-4 mt-6 flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>
                  {questionFields.length} questions · {totalPoints} points
                </span>
                <Button type='submit' className='bg-orange-600 hover:bg-orange-700'>
                  Update Quiz
                </Button>{' '}
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
  const {
    fields: optionFields,
    append: addOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: `questions.${qIndex}.options`
  })

  return (
    <AccordionItem value={`q-${qIndex}`} className='border rounded-lg shadow-sm'>
      <AccordionTrigger>
        <div className='flex justify-between items-center w-full'>
          <span className='font-semibold'>Question {qIndex + 1}</span>
          <Badge variant='secondary'>{optionFields.length} options</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className='space-y-4 p-4'>
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

        <div className='space-y-3'>
          {optionFields.map((o, oIndex) => (
            <div key={o.id} className='flex items-center gap-3 border rounded-md p-3'>
              <FormField
                control={control}
                name={`questions.${qIndex}.options.${oIndex}.text`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    <FormLabel className='text-sm'>Answer {oIndex + 1}</FormLabel>
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
                  <FormItem className='flex items-center gap-2'>
                    <FormLabel className='text-sm'>Correct</FormLabel>
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type='button' variant='ghost' size='icon' onClick={() => removeOption(oIndex)}>
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
          <Button type='button' variant='secondary' size='sm' onClick={() => addOption(DEFAULT_OPTION)}>
            <PlusCircle className='h-4 w-4 mr-1' />
            Add Answer
          </Button>
        </div>

        <Button type='button' variant='destructive' size='sm' onClick={() => removeQuestion(qIndex)}>
          <Trash2 className='h-4 w-4 mr-1' />
          Remove Question
        </Button>
      </AccordionContent>
    </AccordionItem>
  )
}
