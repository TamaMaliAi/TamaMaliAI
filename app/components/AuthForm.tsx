import React from 'react'
import { User, Lock, Mail, LucideIcon } from 'lucide-react'
import { Button } from '@mui/material'
import InputField from './InputField'

interface AuthFormProps {
  title: string
  icon: LucideIcon
  isSignUpMode: boolean
  isLoading: boolean
  formData: {
    username: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: () => void
  onToggleSignUpMode: () => void
  isVisible: boolean
}

export default function AuthForm({
  title,
  icon: Icon,
  isSignUpMode,
  isLoading,
  formData,
  onInputChange,
  onSubmit,
  onToggleSignUpMode,
  isVisible
}: AuthFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        'flex items-center justify-center flex-col px-10 transition-all duration-200 ease-in-out delay-700 overflow-hidden col-start-1 row-start-1 ' +
        (isVisible ? 'opacity-100 z-[51]' : 'opacity-0 z-[1]')
      }
    >
      <div className='flex items-center mb-4 mt-10'>
        <Icon className='text-gray-700 mr-3' size={28} />
        <h2 className='text-2xl text-gray-700 font-semibold'>{isSignUpMode ? `${title} Sign up` : `${title} Login`}</h2>
      </div>

      <div className='w-full max-w-[380px]'>
        {/* Sign up fields */}
        {isSignUpMode && (
          <div className='mb-3'>
            <InputField
              icon={User}
              type='text'
              name='firstName'
              placeholder='First Name'
              value={formData.firstName}
              onChange={onInputChange}
              className='flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 mb-3'
            />
            <InputField
              icon={User}
              type='text'
              name='lastName'
              placeholder='Last Name'
              value={formData.lastName}
              onChange={onInputChange}
              className='flex-1 bg-gray-100 h-[55px] rounded-md flex items-center px-3 mb-3'
            />
            <InputField
              icon={Mail}
              type='email'
              name='email'
              placeholder='Email Address'
              value={formData.email}
              onChange={onInputChange}
            />
          </div>
        )}

        {/* Login field */}
        {!isSignUpMode && (
          <InputField
            icon={User}
            type='text'
            name='username'
            placeholder='Email Address'
            value={formData.username}
            onChange={onInputChange}
          />
        )}

        {/* Password */}
        <InputField
          icon={Lock}
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={onInputChange}
        />

        {/* Confirm Password */}
        {isSignUpMode && (
          <InputField
            icon={Lock}
            type='password'
            name='confirmPassword'
            placeholder='Confirm Password'
            value={formData.confirmPassword}
            onChange={onInputChange}
          />
        )}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        variant='contained'
        sx={{
          width: '100%',
          maxWidth: '380px',
          height: '44px',
          backgroundColor: '#f97316',
          color: 'white',
          fontWeight: 600,
          marginY: 2,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '16px',
          '&:hover': {
            backgroundColor: '#ea580c'
          },
          '&:active': {
            backgroundColor: '#c2410c'
          },
          '&.Mui-disabled': {
            backgroundColor: '#f97316',
            color: 'white',
            opacity: 0.5
          }
        }}
      >
        {isLoading ? 'Loading...' : isSignUpMode ? 'Sign up' : 'Login'}
      </Button>

      <p className='text-gray-600 text-sm mb-4'>
        {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
        <button
          type='button'
          onClick={onToggleSignUpMode}
          className='text-orange-500 hover:text-orange-600 font-semibold ml-2 cursor-pointer'
        >
          {isSignUpMode ? 'Login here' : 'Sign up here'}
        </button>
      </p>
    </form>
  )
}
