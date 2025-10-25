'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

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

      setMessages((prev) => [...prev, { role: 'assistant', text: response.data.response }])
    } catch (error) {
      console.error('Error:', error)
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }])
    } finally {
      setIsGenerating(false)
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
        className='fixed right-0 top-0 bottom-0 w-16 bg-white/80 border-l border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors'
        onClick={() => setIsOpen(true)}
        whileHover={{ width: 70 }}
      >
        <Image src='/tamamali.png' alt='TamaMali AI' width={50} height={50} className='w-20 h-22' />
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
                    <p className='text-xs text-gray-500'>Always here to help</p>
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
                  <div className='flex flex-col items-center justify-center h-full text-center'>
                    <Image
                      src='/tamamali.png'
                      alt='TamaMali'
                      width={100}
                      height={100}
                      className='w-24 h-24 mb-4 opacity-30'
                    />
                    <p className='text-gray-500 text-sm'>Hi! How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className='flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                        <span className='text-xs font-semibold text-gray-600'>
                          {message.role === 'user' ? 'U' : 'AI'}
                        </span>
                      </div>
                      <div
                        className={`flex-1 p-3 rounded-lg border max-w-[80%] ${
                          message.role === 'user' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <p className='text-sm text-gray-800 whitespace-pre-wrap'>
                          {message.text}
                          {isGenerating && index === messages.length - 1 && message.role === 'assistant' && (
                            <span className='inline-block w-1.5 h-4 bg-gray-800 ml-1 animate-pulse' />
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className='p-4 border-t border-gray-200 bg-white'>
                <div className='flex gap-2 mb-2'>
                  <input
                    className='border border-gray-300 bg-white rounded-lg p-2.5 flex-1 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
                    placeholder='Type your message...'
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
