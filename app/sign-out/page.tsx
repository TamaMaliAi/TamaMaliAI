'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const clearAndRedirect = async () => {
      try {
        setProgress(20)

        await axios.post('/api/logout')

        setProgress(60)

        await new Promise((resolve) => setTimeout(resolve, 300))

        setProgress(100)

        
        router.replace('/')
        router.refresh() 
      } catch (error) {
        console.error('Logout error:', error)
        
        setProgress(100)
        router.replace('/')
      }
    }

    clearAndRedirect()
  }, [router])

  return (
    <div className='flex items-center justify-center h-screen bg-gradient-to-b from-orange-50 to-white'>
      <div className='flex flex-col items-center gap-4 w-[300px]'>
        <div className='w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center shadow-md'>
          <span className='text-white font-bold text-lg'>T</span>
        </div>
        <Progress value={progress} className='w-full' />
        <span className='text-sm text-slate-600 font-medium'>
          {progress < 100 ? 'Signing you out...' : 'Redirecting...'}
        </span>
      </div>
    </div>
  )
}
