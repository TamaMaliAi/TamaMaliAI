'use client'

import { useMemo } from 'react'
import { mockUsers } from './hooks/students'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowUpRight, Users, CalendarDays, UserPlus } from 'lucide-react'

export default function TeacherDashboardHome() {
  // Compute analytics
  const analytics = useMemo(() => {
    const usersByDate = mockUsers.reduce<Record<string, number>>((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const chartData = Object.entries(usersByDate).map(([date, count]) => ({
      date,
      count
    }))

    const totalStudents = mockUsers.length
    const now = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(now.getDate() - 7)

    const newThisWeek = mockUsers.filter((u) => u.createdAt >= oneWeekAgo).length
    const prevWeekCount = mockUsers.filter(
      (u) => u.createdAt < oneWeekAgo && u.createdAt >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length

    const growthRate = prevWeekCount > 0 ? ((newThisWeek - prevWeekCount) / prevWeekCount) * 100 : 100

    const recentSignups = mockUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5)

    return { totalStudents, newThisWeek, growthRate, chartData, recentSignups }
  }, [])

  return (
    <div className='p-6 space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>📊 Analytics</h1>
        <p className='text-gray-500'>Updated automatically based on student registrations</p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-3'>
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring' }}>
          <Card className='shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>Total Students</CardTitle>
              <Users className='h-5 w-5 text-blue-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{analytics.totalStudents}</div>
              <p className='text-sm text-gray-500'>Overall registered students</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring' }}>
          <Card className='shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>New This Week</CardTitle>
              <UserPlus className='h-5 w-5 text-green-600' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{analytics.newThisWeek}</div>
              <p className='text-sm text-gray-500'>Students joined in the last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring' }}>
          <Card className='shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-gray-500'>Growth Rate</CardTitle>
              <ArrowUpRight className='h-5 w-5 text-indigo-600' />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.growthRate.toFixed(1)}%
              </div>
              <p className='text-sm text-gray-500'>Week-over-week growth</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Line Chart */}
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <CalendarDays className='h-5 w-5 text-blue-600' /> Student Registrations Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={analytics.chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type='monotone' dataKey='count' stroke='#2563eb' strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Signups */}
      <Card className='shadow-md'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <UserPlus className='h-5 w-5 text-green-600' /> Recent Sign-ups
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {analytics.recentSignups.map((user) => (
            <motion.div
              key={user.id}
              className='flex justify-between items-center border-b pb-2 last:border-none'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <p className='font-medium'>{user.name}</p>
                <p className='text-sm text-gray-500'>{user.email}</p>
              </div>
              <p className='text-sm text-gray-400'>
                {user.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
