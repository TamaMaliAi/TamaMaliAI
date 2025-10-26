'use client'

import { useParams } from 'next/navigation'

export const useStudentRouteParams = () => {
  const params = useParams<{ studentId?: string; quizId?: string; groupId?: string }>()

  const studentId = Number(params.studentId)
  const quizId = Number(params.quizId)
  const groupId = Number(params.groupId)

  return { studentId, quizId, groupId }
}
