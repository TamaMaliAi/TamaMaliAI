'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Search } from 'lucide-react'

interface Student {
  id: number
  name: string
  email: string
}

interface Props {
  students: Student[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export default function StudentMultiSelect({ students, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return students.filter(
      (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.email.toLowerCase().includes(query.toLowerCase())
    )
  }, [students, query])

  const toggleStudent = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((sid) => sid !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
      {/* Search bar */}
      <div className='flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50'>
        <Search className='w-4 h-4 text-gray-400 mr-2' />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search student...'
          className='flex-1 bg-transparent outline-none text-sm text-gray-700'
        />
      </div>

      {/* List */}
      <div className='max-h-72 overflow-y-auto'>
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='p-4 text-sm text-gray-500 text-center'
            >
              No students found
            </motion.div>
          ) : (
            filtered.map((student) => {
              const selected = selectedIds.includes(student.id)
              const isHovered = hoveredId === student.id

              return (
                <motion.button
                  key={student.id}
                  type='button'
                  onMouseEnter={() => setHoveredId(student.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => toggleStudent(student.id)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm border-b border-gray-100 transition-colors ${
                    isHovered ? 'bg-gray-50' : 'bg-white'
                  } ${selected ? 'bg-indigo-50' : ''}`}
                >
                  <div>
                    <p className='font-medium text-gray-800'>{student.name}</p>
                    <p className='text-gray-500 text-xs'>{student.email}</p>
                  </div>
                  {selected && <Check className='w-4 h-4 text-indigo-500' />}
                </motion.button>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
