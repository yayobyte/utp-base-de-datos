import type { SqlResult } from '@/data'
import type { TallerExercise } from '@/domain/talleres/exercises'

export interface ExerciseCardProps {
  exercise: TallerExercise
  onRun: (exercise: TallerExercise) => Promise<SqlResult>
  onOpenInConsole: (exercise: TallerExercise) => void
}
