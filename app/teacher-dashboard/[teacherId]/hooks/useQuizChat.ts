'use client'
import { useState, useRef } from 'react'

interface Message {
  role: 'user' | 'assistant'
  text: string
  quizData?: QuizData | null
}

interface QuizData {
  type: 'IDENTIFICATION' | 'MULTIPLE_CHOICE'
  title: string
  description?: string
  questions: IdentificationQuestion[] | MultipleChoiceQuestion[]
}

interface IdentificationQuestion {
  text: string
  points: number
  answer: string
}

interface MultipleChoiceQuestion {
  text: string
  points: number
  options: {
    text: string
    isCorrect: boolean
  }[]
}

export function useQuizChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsGenerating(false)
  }

  const clearChat = () => {
    if (!isGenerating) {
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsGenerating(true)

    abortControllerRef.current = new AbortController()
    setMessages((prev) => [...prev, { role: 'assistant', text: '', quizData: null }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
        signal: abortControllerRef.current.signal
      })

      if (abortControllerRef.current.signal.aborted) {
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch response')
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let accumulatedText = ''
      let quizData: QuizData | null = null

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        if (abortControllerRef.current.signal.aborted) {
          reader.cancel()
          return
        }

        const chunk = decoder.decode(value, { stream: true })

        // Check if chunk contains quiz data marker
        if (chunk.includes('__QUIZ_DATA__')) {
          const parts = chunk.split('__QUIZ_DATA__')
          accumulatedText += parts[0]
          if (parts[1]) {
            try {
              quizData = JSON.parse(parts[1]) as QuizData
            } catch (e) {
              if (e instanceof Error) {
                console.error('Failed to parse quiz data:', e.message)
              } else {
                console.error('Failed to parse quiz data')
              }
            }
          }
        } else {
          accumulatedText += chunk
        }

        setMessages((prev) => {
          const newMessages = [...prev]
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              text: accumulatedText,
              quizData: quizData
            }
          }
          return newMessages
        })
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      if (error instanceof Error) {
        console.error('Error:', error.message)
      } else {
        console.error('An unknown error occurred')
      }

      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].role === 'assistant') {
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            text: 'Sorry, something went wrong.'
          }
        }
        return newMessages
      })
    }

    setIsGenerating(false)
    abortControllerRef.current = null
  }

  return {
    messages,
    input,
    setInput,
    isGenerating,
    sendMessage,
    stopGeneration,
    clearChat
  }
}
