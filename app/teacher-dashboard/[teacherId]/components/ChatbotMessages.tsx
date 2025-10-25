'use client'
import Image from 'next/image'
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

interface ChatbotMessagesProps {
  messages: Message[]
  isGenerating: boolean
  onPrefillQuiz: (quizData: QuizData) => void
}

export default function ChatbotMessages({ messages, isGenerating, onPrefillQuiz }: ChatbotMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
        <div className='flex flex-col items-center justify-center h-full text-center px-4'>
          <Image src='/tamamali.png' alt='TamaMali' width={100} height={100} className='w-24 h-24 mb-4 opacity-30' />
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
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
      {messages.map((message, index) => {
        const { role, text, quizData } = message
        const isLast = index === messages.length - 1

        return (
          <div key={index} className='space-y-2'>
            <div className={`flex items-start gap-3 ${role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar/Icon */}
              <div className='flex-shrink-0'>
                {role === 'user' ? (
                  <div className='w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center'>
                    <span className='text-white text-sm font-semibold'>U</span>
                  </div>
                ) : (
                  <Image
                    src='/tamamali.png'
                    alt='TamaMali AI'
                    width={32}
                    height={32}
                    className='w-8 h-8 rounded-full'
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 p-3 rounded-lg border max-w-[85%] ${
                  role === 'user' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className='text-sm text-gray-800 prose prose-sm max-w-none'>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                      strong: ({ children }) => <strong className='font-semibold text-gray-900'>{children}</strong>,
                      ul: ({ children }) => <ul className='list-disc list-inside space-y-1 my-2'>{children}</ul>,
                      ol: ({ children }) => <ol className='list-decimal list-inside space-y-1 my-2'>{children}</ol>,
                      li: ({ children }) => <li className='ml-2'>{children}</li>,
                      code: ({ children }) => (
                        <code className='bg-gray-100 px-1 py-0.5 rounded text-xs'>{children}</code>
                      ),
                      pre: ({ children }) => <pre className='hidden'>{children}</pre>
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                  {isGenerating && isLast && role === 'assistant' && (
                    <span className='inline-block w-1.5 h-4 bg-gray-800 ml-1 animate-pulse' />
                  )}
                </div>
              </div>
            </div>

            {/* Create Quiz Button - Only show for assistant messages with quiz data */}
            {role === 'assistant' && quizData && (
              <div className='flex justify-end pr-11'>
                <button
                  onClick={() => onPrefillQuiz(quizData)}
                  className='px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-all shadow-sm hover:shadow-md'
                >
                  Create Quiz
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
