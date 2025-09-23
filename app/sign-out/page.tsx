'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoadingProgress() {
  const [progress, setProgress] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const clearAndRedirect = async () => {
      setProgress(10)
      document.cookie = 'token=; Max-Age=0; path=/;'
      setProgress(50)
      await new Promise((resolve) => setTimeout(resolve, 300))
      setProgress(100)
      router.replace('/')
    }

    clearAndRedirect()
  }, [router])

  return (
    <div className='flex items-center justify-center h-screen'>
      <div className='flex flex-col items-center gap-2 w-[300px]'>
        <Progress value={progress} className='w-full' />
        <span className='text-sm text-muted-foreground'>
          {progress < 100 ? 'Clearing session...' : 'Redirecting...'}
        </span>
      </div>
    </div>
  )
}
