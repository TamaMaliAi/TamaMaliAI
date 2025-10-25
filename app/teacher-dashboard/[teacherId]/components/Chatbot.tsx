'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTeacherRouteParams } from '../hooks/useTeacherRouteParams'
import ReactMarkdown from 'react-markdown'

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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const { teacherId } = useTeacherRouteParams()

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage: Message = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      const response = await axios.post('/api/chat', {
        message: input
      })

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.data.response,
          quizData: response.data.quizData || null
        }
      ])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePrefillQuiz = (quizData: QuizData) => {
    if (!teacherId) return

    // Encode quiz data and navigate to form
    const encodedData = encodeURIComponent(JSON.stringify(quizData))

    if (quizData.type === 'IDENTIFICATION') {
      router.push(`/teacher-dashboard/${teacherId}/quizzes/create/identification?prefill=${encodedData}`)
    } else if (quizData.type === 'MULTIPLE_CHOICE') {
      router.push(`/teacher-dashboard/${teacherId}/quizzes/create/multiple-choice?prefill=${encodedData}`)
    }
  }

  const handleStop = () => {
    setIsGenerating(false)
  }

  const handleClear = () => {
    setMessages([])
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleSend()
    }
  }

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

  const chevronLeft = (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M15 18l-6-6 6-6' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )

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
          <>
            {/* Chat Panel */}
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
                <button
                  onClick={() => setIsOpen(false)}
                  className='p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600'
                >
                  {chevronLeft}
                </button>
              </div>

              {/* Messages Area */}
              <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
                {messages.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-full text-center px-4'>
                    <Image
                      src='/tamamali.png'
                      alt='TamaMali'
                      width={100}
                      height={100}
                      className='w-24 h-24 mb-4 opacity-30'
                    />
                    <p className='text-gray-500 text-sm mb-4'>Hi! How can I help you today?</p>
                    <div className='text-left w-full bg-white border border-gray-200 rounded-lg p-4'>
                      <p className='text-xs text-gray-600 font-semibold mb-2'>💡 Try asking:</p>
                      <ul className='text-xs text-gray-500 space-y-1.5'>
                        <li>&bull;&nbsp;&nbsp;Create a quiz about World War 2 with 5 questions</li>
                        <li>&bull;&nbsp;&nbsp;Generate 3 identification questions about photosynthesis</li>
                        <li>&bull;&nbsp;&nbsp;Make a multiple choice quiz on Philippine history</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={index} className='space-y-2'>
                      <div
                        className={`flex-1 p-3 rounded-lg border max-w-[85%] ${
                          message.role === 'user' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className='text-sm text-gray-800 prose prose-sm max-w-none'>
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                              strong: ({ children }) => (
                                <strong className='font-semibold text-gray-900'>{children}</strong>
                              ),
                              ul: ({ children }) => (
                                <ul className='list-disc list-inside space-y-1 my-2'>{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className='list-decimal list-inside space-y-1 my-2'>{children}</ol>
                              ),
                              li: ({ children }) => <li className='ml-2'>{children}</li>,
                              code: ({ children }) => (
                                <code className='bg-gray-100 px-1 py-0.5 rounded text-xs'>{children}</code>
                              ),
                              pre: ({ children }) => <pre className='hidden'>{children}</pre>
                            }}
                          >
                            {message.text}
                          </ReactMarkdown>
                          {isGenerating && index === messages.length - 1 && message.role === 'assistant' && (
                            <span className='inline-block w-1.5 h-4 bg-gray-800 ml-1 animate-pulse' />
                          )}
                        </div>
                      </div>

                      {/* Create Quiz Button - Only show for assistant messages with quiz data */}
                      {message.role === 'assistant' && message.quizData && (
                        <div className='flex justify-end pr-11'>
                          <button
                            onClick={() => handlePrefillQuiz(message.quizData!)}
                            className='px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md'
                          >
                            Create Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

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
                    onClick={handleSend}
                    disabled={isGenerating || !input.trim()}
                    className='px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isGenerating ? 'Sending...' : 'Send'}
                  </button>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={handleStop}
                    disabled={!isGenerating}
                    className='flex-1 p-2 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
                  >
                    {stopIcon}
                    Stop
                  </button>
                  <button
                    onClick={handleClear}
                    disabled={isGenerating}
                    className='flex-1 p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5'
                  >
                    {clearIcon}
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
