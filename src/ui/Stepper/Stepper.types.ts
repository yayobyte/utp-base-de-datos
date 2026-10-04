export interface StepperStep {
  id: string
  label: string
  description?: string
}

export interface StepperProps {
  steps: StepperStep[]
  current: number
  onSelect?: (index: number) => void
}
