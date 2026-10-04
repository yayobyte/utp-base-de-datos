import type { HealthReport } from '@/data'

export interface BuildInfo {
  commit: string
  branch: string
  environment: string
  builtAt: string
}

export interface StatusPageProps {
  build?: BuildInfo
}

export interface HealthCardProps {
  report: HealthReport
}
