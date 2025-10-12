'use client'

import { SetStateAction, useState } from 'react'
import { GraduationCap, BookOpen } from 'lucide-react'
import Message from './components/Message'
import AuthForm from './components/AuthForm'
import InfoPanel from './components/InfoPanel'
import BackgroundCircle from './components/BackgroundCircle'
import Logo from './components/Logo'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const [isTeacherMode, setIsTeacherMode] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })
  const [message, setMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const showMessage = (msg: SetStateAction<string>) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const userType = isTeacherMode ? 'TEACHER' : 'STUDENT'

    try {
      if (isSignUpMode) {
        // ✅ Sign Up
        if (formData.password !== formData.confirmPassword) {
          showMessage('Passwords do not match')
          setIsLoading(false)
          return
        }

        const { data } = await axios.post('/api/register', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: userType
        })

        if (data.success) {
          showMessage('Account created! Please log in.')
          setIsSignUpMode(false)
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            firstName: '',
            lastName: ''
          })
        } else {
          showMessage(data.message)
        }
      } else {
        const response = await axios.post('/api/login', {
          username: formData.username,
          password: formData.password,
          role: userType
        })

        const data = response.data
        console.log('USER DATA:', data)

        if (data.success) {
          const { user } = data
          if (user.role === 'TEACHER') {
            window.location.href = `/teacher-dashboard/${user.id}`
          } else {
            window.location.href = `/student-dashboard/${user.id}`
          }
        } else {
          showMessage(data.message)
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        showMessage(error.response?.data?.message || 'Server error occurred.')
      } else {
        showMessage('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSignUpMode = () => {
    setIsSignUpMode(!isSignUpMode)
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    })
    setMessage('')
  }

  return (
    <div className='relative w-full min-h-screen bg-white overflow-hidden'>
      <Message message={message} isVisible={!!message} />
      <BackgroundCircle isTeacherMode={isTeacherMode} />
      <Logo isTeacherMode={isTeacherMode} />

      {/* Forms container */}
      <div className='absolute w-full h-full top-0 left-0'>
        <div
          className={
            'absolute top-1/2 -translate-y-1/2 w-1/2 transition-all duration-1000 ease-in-out delay-700 grid grid-cols-1 z-[50] ' +
            (isTeacherMode ? 'left-[25%] -translate-x-1/2' : 'left-[75%] -translate-x-1/2')
          }
        >
          <AuthForm
            title='Student'
            icon={GraduationCap}
            isSignUpMode={isSignUpMode}
            isLoading={isLoading}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onToggleSignUpMode={toggleSignUpMode}
            isVisible={!isTeacherMode}
          />

          <AuthForm
            title='Teacher'
            icon={BookOpen}
            isSignUpMode={isSignUpMode}
            isLoading={isLoading}
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onToggleSignUpMode={toggleSignUpMode}
            isVisible={isTeacherMode}
          />
        </div>
      </div>

      {/* Panels */}
      <div className='absolute h-full w-full top-0 left-0 grid grid-cols-2 z-[7]'>
        <InfoPanel
          icon={GraduationCap}
          title='Student Portal'
          description='Access your courses, assignments, and track your academic progress.'
          buttonText='Teacher Login'
          imageUrl='/student-o.png'
          imageAlt='Student illustration'
          isLeft={true}
          isActive={isTeacherMode}
          onButtonClick={() => setIsTeacherMode(true)}
        />

        <InfoPanel
          icon={BookOpen}
          title='Teacher Portal'
          description='Manage your classes, create assignments, and monitor student performance.'
          buttonText='Student Login'
          imageUrl='/teacher-o.png'
          imageAlt='Teacher illustration'
          isLeft={false}
          isActive={isTeacherMode}
          onButtonClick={() => setIsTeacherMode(false)}
        />
      </div>
    </div>
  )
}
