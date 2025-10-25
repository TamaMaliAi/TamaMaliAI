'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTeacherRouteParams } from '../hooks/useTeacherRouteParams'
import { useQuizChat } from '../hooks/useQuizChat'
import ChatbotPanel from './ChatbotPanel'

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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  const { messages, input, setInput, isGenerating, sendMessage, stopGeneration, clearChat } = useQuizChat()

  const handlePrefillQuiz = (quizData: QuizData) => {
    if (!teacherId) return

    const encodedData = encodeURIComponent(JSON.stringify(quizData))

    if (quizData.type === 'IDENTIFICATION') {
      router.push(`/teacher-dashboard/${teacherId}/quizzes/create/identification?prefill=${encodedData}`)
    } else if (quizData.type === 'MULTIPLE_CHOICE') {
      router.push(`/teacher-dashboard/${teacherId}/quizzes/create/multiple-choice?prefill=${encodedData}`)
    }
  }

  return (
    <>
      {/* Side Tab - Always visible */}
      <motion.div
        className='fixed right-0 top-0 bottom-0 w-16 bg-white/80 border-l border-gray-200 z-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors'
        onClick={() => setIsOpen(true)}
        whileHover={{ x: -4, boxShadow: '-4px 0 16px rgba(249, 115, 22, 0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        <Image src='/tamamali.png' alt='TamaMali AI' width={50} height={50} className='w-12 h-12' />
      </motion.div>

      {/* Chat Panel - Slides from right */}
      <AnimatePresence>
        {isOpen && (
          <ChatbotPanel
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            messages={messages}
            input={input}
            setInput={setInput}
            isGenerating={isGenerating}
            onSend={sendMessage}
            onStop={stopGeneration}
            onClear={clearChat}
            onPrefillQuiz={handlePrefillQuiz}
          />
        )}
      </AnimatePresence>
    </>
  )
}
