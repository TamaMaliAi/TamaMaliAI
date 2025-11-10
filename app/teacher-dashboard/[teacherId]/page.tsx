'use client'

import { useState, useEffect, useMemo } from 'react'
import moment from 'moment'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowUpRight, Users, CalendarDays, UserPlus, Loader2 } from 'lucide-react'
import { Group, QuizAssignment, QuizAttempt } from '@prisma/client'

interface Student {
  id: number
  email: string
  name: string
  role: string
  createdAt: string
  updatedAt: string
  studentGroups: Group[]
  assignedQuizzes: QuizAssignment[]
  attempts: QuizAttempt[]
}

export default function TeacherDashboardHome() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/students')

        if (!response.ok) {
          throw new Error('Failed to fetch students')
        }

        const data = await response.json()
        setStudents(data.students || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching students:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // ✅ Compute analytics using moment
  const analytics = useMemo(() => {
    if (students.length === 0) {
      return {
        totalStudents: 0,
        newThisWeek: 0,
        growthRate: 0,
        chartData: [],
        recentSignups: []
      }
    }

    const usersByDate = students.reduce<Record<string, number>>((acc, user) => {
      const date = moment(user.createdAt).format('YYYY-MM-DD')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    const chartData = Object.entries(usersByDate)
      .map(([date, count]) => ({
        date,
        count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const totalStudents = students.length
    const oneWeekAgo = moment().subtract(7, 'days')
    const twoWeeksAgo = moment().subtract(14, 'days')

    const newThisWeek = students.filter((u) => moment(u.createdAt).isAfter(oneWeekAgo)).length
    const prevWeekCount = students.filter((u) => {
      const createdAt = moment(u.createdAt)
      return createdAt.isBetween(twoWeeksAgo, oneWeekAgo)
    }).length

    const growthRate = prevWeekCount > 0 ? ((newThisWeek - prevWeekCount) / prevWeekCount) * 100 : 100

    const recentSignups = [...students]
      .sort((a, b) => moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf())
      .slice(0, 5)

    return { totalStudents, newThisWeek, growthRate, chartData, recentSignups }
  }, [students])

  if (loading) {
    return (
      <div className='p-6 flex items-center justify-center h-96'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
          <p className='text-gray-500'>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-6'>
        <Card className='shadow-md border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <p className='text-red-600 font-medium'>Error loading data: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className='mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='p-6 space-y-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center'>
        <h1 className='text-3xl font-bold tracking-tight'>📊 Analytics</h1>
        <p className='text-gray-500'>Updated automatically based on student registrations</p>
      </div>

      {/* Stats Grid */}
      <div className='grid gap-4 md:grid-cols-3'>
        {/* Total Students */}
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

        {/* New This Week */}
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

        {/* Growth Rate */}
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
          {analytics.chartData.length > 0 ? (
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type='monotone' dataKey='count' stroke='#2563eb' strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className='h-[300px] flex items-center justify-center text-gray-500'>
              No registration data available
            </div>
          )}
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
          {analytics.recentSignups.length > 0 ? (
            analytics.recentSignups.map((user) => (
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
                <p className='text-sm text-gray-400'>{moment(user.createdAt).format('MMM D')}</p>
              </motion.div>
            ))
          ) : (
            <p className='text-gray-500 text-center py-4'>No recent sign-ups</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
