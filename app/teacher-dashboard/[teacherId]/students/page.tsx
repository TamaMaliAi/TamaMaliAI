'use client'
import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react'
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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showColumns, setShowColumns] = useState({
    name: true,
    email: true,
    role: true,
    createdAt: true
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const pageSize = 10

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

  const filtered = students.filter((user) => {
    const s = search.toLowerCase()
    return user.name.toLowerCase().includes(s) || user.email.toLowerCase().includes(s) || user.id.toString().includes(s)
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedData = filtered.slice(page * pageSize, (page + 1) * pageSize)

  if (loading) {
    return (
      <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
          <p className='text-gray-500'>Loading students...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full min-h-screen bg-gray-50 flex items-center justify-center p-6'>
        <div className='max-w-md w-full bg-white rounded-lg border border-red-200 p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-red-600 mb-2'>Error Loading Students</h2>
          <p className='text-gray-700 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-gray-900'>Students</h1>
            <p className='text-gray-600 mt-1'>Manage student accounts and information</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='relative flex-1 max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search students...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className='w-full pl-9 pr-9 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          <div className='relative'>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className='px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium'
            >
              Columns <ChevronDown className='h-4 w-4' />
            </button>
            {dropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10'>
                {(Object.keys(showColumns) as Array<keyof typeof showColumns>).map((col) => (
                  <label key={col} className='flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={showColumns[col]}
                      onChange={(e) => setShowColumns({ ...showColumns, [col]: e.target.checked })}
                      className='mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-sm capitalize'>{col}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  {showColumns.name && (
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Name
                    </th>
                  )}
                  {showColumns.email && (
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Email
                    </th>
                  )}
                  {/* {showColumns.role && (
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                  )} */}
                  {showColumns.createdAt && (
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created At
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {paginatedData.length > 0 ? (
                  paginatedData.map((user) => (
                    <tr key={user.id} className='hover:bg-gray-50'>
                      {showColumns.name && (
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{user.name}</td>
                      )}
                      {showColumns.email && (
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>{user.email}</td>
                      )}
                      {/* {showColumns.role && (
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {user.role}
                          </span>
                        </td>
                      )} */}
                      {showColumns.createdAt && (
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={Object.values(showColumns).filter(Boolean).length}
                      className='px-6 py-12 text-center text-sm text-gray-500'
                    >
                      {search ? 'No results found.' : 'No students available.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-sm text-gray-600'>{filtered.length} student(s) total</div>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className='px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1'
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </button>
            <div className='text-sm font-medium text-gray-700'>
              Page {page + 1} of {totalPages || 1}
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className='px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1'
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
