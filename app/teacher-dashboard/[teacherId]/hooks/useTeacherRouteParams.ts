'use client'

import { useParams } from 'next/navigation'

export const useTeacherRouteParams = () => {
  const params = useParams<{ teacherId?: string; quizId?: string; groupId?: string }>()

  const teacherId = Number(params.teacherId)
  const quizId = Number(params.quizId)
  const groupId = Number(params.groupId)

  return { teacherId, quizId, groupId }
}
