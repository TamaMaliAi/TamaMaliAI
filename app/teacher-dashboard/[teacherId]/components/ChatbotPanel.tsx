'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import ChatbotMessages from './ChatbotMessages'

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

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isGenerating: boolean
  onSend: () => void
  onStop: () => void
  onClear: () => void
  onPrefillQuiz: (quizData: QuizData) => void
}

export default function ChatbotPanel({
  onClose,
  messages,
  input,
  setInput,
  isGenerating,
  onSend,
  onStop,
  onClear,
  onPrefillQuiz
}: ChatbotPanelProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating && input.trim()) {
      onSend()
    }
  }

  const chevronLeft = (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M15 18l-6-6 6-6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )

  const stopIcon = (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <rect x='6' y='6' width='12' height='12' rx='2' />
    </svg>
  )

  const clearIcon = (
    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M3 6h18M9 6v12m6-12v12' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className='fixed right-0 top-0 bottom-0 w-[450px] bg-gray-50 border-l border-gray-200 shadow-2xl z-50 flex flex-col'
    >
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-white'>
        <div className='flex items-center gap-3'>
          <Image src='/tamamali.png' alt='TamaMali' width={40} height={40} className='w-10 h-10' />
          <div>
            <h3 className='font-semibold text-gray-800'>TamaMali AI</h3>
            <p className='text-xs text-gray-500'>Quiz Generation Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className='p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600'>
          {chevronLeft}
        </button>
      </div>

      {/* Messages Area */}
      <ChatbotMessages messages={messages} isGenerating={isGenerating} onPrefillQuiz={onPrefillQuiz} />

      {/* Input Area */}
      <div className='p-4 border-t border-gray-200 bg-white'>
        <div className='flex gap-2 mb-2'>
          <input
            className='border border-gray-300 bg-white rounded-lg p-2.5 flex-1 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
            placeholder='Ask me to generate a quiz...'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isGenerating}
          />
          <button
            onClick={onSend}
            disabled={isGenerating || !input.trim()}
            className='px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isGenerating ? 'Sending...' : 'Send'}
          </button>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={onStop}
            disabled={!isGenerating}
            className='flex-1 p-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
          >
            {stopIcon}
            Stop
          </button>
          <button
            onClick={onClear}
            disabled={isGenerating}
            className='flex-1 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
          >
            {clearIcon}
            Clear
          </button>
        </div>
      </div>
    </motion.div>
  )
}
