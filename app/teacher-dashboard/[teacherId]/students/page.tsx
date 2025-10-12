'use client'
import React, { useState } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'

const mockUsers = [
  {
    id: 1,
    email: 'ella.martinez1@example.com',
    name: 'Ella Martinez',
    role: 'STUDENT',
    createdAt: new Date('2025-09-10T10:15:31.000Z')
  },
  {
    id: 2,
    email: 'liam.garcia2@example.com',
    name: 'Liam Garcia',
    role: 'STUDENT',
    createdAt: new Date('2025-09-11T08:12:11.000Z')
  },
  {
    id: 3,
    email: 'sophia.kim3@example.com',
    name: 'Sophia Kim',
    role: 'STUDENT',
    createdAt: new Date('2025-09-12T14:45:03.000Z')
  },
  {
    id: 4,
    email: 'noah.chen4@example.com',
    name: 'Noah Chen',
    role: 'STUDENT',
    createdAt: new Date('2025-09-13T11:03:09.000Z')
  },
  {
    id: 5,
    email: 'ava.perez5@example.com',
    name: 'Ava Perez',
    role: 'STUDENT',
    createdAt: new Date('2025-09-14T15:51:44.000Z')
  },
  {
    id: 6,
    email: 'ethan.nguyen6@example.com',
    name: 'Ethan Nguyen',
    role: 'STUDENT',
    createdAt: new Date('2025-09-15T13:25:11.000Z')
  },
  {
    id: 7,
    email: 'mia.ramirez7@example.com',
    name: 'Mia Ramirez',
    role: 'STUDENT',
    createdAt: new Date('2025-09-16T09:54:22.000Z')
  },
  {
    id: 8,
    email: 'oliver.lee8@example.com',
    name: 'Oliver Lee',
    role: 'STUDENT',
    createdAt: new Date('2025-09-17T16:42:19.000Z')
  },
  {
    id: 9,
    email: 'isabella.lopez9@example.com',
    name: 'Isabella Lopez',
    role: 'STUDENT',
    createdAt: new Date('2025-09-18T12:08:03.000Z')
  },
  {
    id: 10,
    email: 'lucas.santos10@example.com',
    name: 'Lucas Santos',
    role: 'STUDENT',
    createdAt: new Date('2025-09-19T18:30:25.000Z')
  },
  {
    id: 11,
    email: 'amelia.davis11@example.com',
    name: 'Amelia Davis',
    role: 'STUDENT',
    createdAt: new Date('2025-09-20T10:23:48.000Z')
  },
  {
    id: 12,
    email: 'benjamin.wilson12@example.com',
    name: 'Benjamin Wilson',
    role: 'STUDENT',
    createdAt: new Date('2025-09-21T11:14:03.000Z')
  },
  {
    id: 13,
    email: 'harper.johnson13@example.com',
    name: 'Harper Johnson',
    role: 'STUDENT',
    createdAt: new Date('2025-09-22T14:07:58.000Z')
  },
  {
    id: 14,
    email: 'elijah.brown14@example.com',
    name: 'Elijah Brown',
    role: 'STUDENT',
    createdAt: new Date('2025-09-23T13:22:44.000Z')
  },
  {
    id: 15,
    email: 'evelyn.taylor15@example.com',
    name: 'Evelyn Taylor',
    role: 'STUDENT',
    createdAt: new Date('2025-09-24T15:59:19.000Z')
  },
  {
    id: 16,
    email: 'henry.white16@example.com',
    name: 'Henry White',
    role: 'STUDENT',
    createdAt: new Date('2025-09-25T09:51:12.000Z')
  },
  {
    id: 17,
    email: 'charlotte.moore17@example.com',
    name: 'Charlotte Moore',
    role: 'STUDENT',
    createdAt: new Date('2025-09-26T14:20:11.000Z')
  },
  {
    id: 18,
    email: 'william.thomas18@example.com',
    name: 'William Thomas',
    role: 'STUDENT',
    createdAt: new Date('2025-09-27T17:38:42.000Z')
  },
  {
    id: 19,
    email: 'scarlett.jackson19@example.com',
    name: 'Scarlett Jackson',
    role: 'STUDENT',
    createdAt: new Date('2025-09-28T19:14:27.000Z')
  },
  {
    id: 20,
    email: 'james.anderson20@example.com',
    name: 'James Anderson',
    role: 'STUDENT',
    createdAt: new Date('2025-09-29T10:31:44.000Z')
  },
  {
    id: 21,
    email: 'aria.murphy21@example.com',
    name: 'Aria Murphy',
    role: 'STUDENT',
    createdAt: new Date('2025-09-30T14:11:09.000Z')
  },
  {
    id: 22,
    email: 'alexander.clark22@example.com',
    name: 'Alexander Clark',
    role: 'STUDENT',
    createdAt: new Date('2025-10-01T13:42:54.000Z')
  },
  {
    id: 23,
    email: 'sofia.robinson23@example.com',
    name: 'Sofia Robinson',
    role: 'STUDENT',
    createdAt: new Date('2025-10-02T15:09:13.000Z')
  },
  {
    id: 24,
    email: 'mason.hall24@example.com',
    name: 'Mason Hall',
    role: 'STUDENT',
    createdAt: new Date('2025-10-03T17:40:32.000Z')
  },
  {
    id: 25,
    email: 'grace.king25@example.com',
    name: 'Grace King',
    role: 'STUDENT',
    createdAt: new Date('2025-10-04T16:22:44.000Z')
  }
]

export default function StudentsPage() {
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

  const filtered = mockUsers.filter((user) => {
    const s = search.toLowerCase()
    return user.name.toLowerCase().includes(s) || user.email.toLowerCase().includes(s) || user.id.toString().includes(s)
  })

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginatedData = filtered.slice(page * pageSize, (page + 1) * pageSize)

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
                          {user.createdAt.toLocaleDateString()}
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
                      No results found.
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
