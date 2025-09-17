'use client'

import { ReactNode, useState, useCallback } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import ModernButton from './modern-button'
import ModernCard from './modern-card'

interface StepperStep {
  id: string
  title: string
  description?: string
  icon?: ReactNode
  content: ReactNode
  validation?: () => boolean | Promise<boolean>
}

interface ModernStepperFormProps {
  steps: StepperStep[]
  onComplete: () => void | Promise<void>
  onCancel?: () => void
  className?: string
  loading?: boolean
}

export default function ModernStepperForm({ 
  steps, 
  onComplete, 
  onCancel,
  className = "",
  loading = false
}: ModernStepperFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [isValidating, setIsValidating] = useState(false)

  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = useCallback(async () => {
    const step = steps[currentStep]
    
    if (step.validation) {
      setIsValidating(true)
      const isValid = await step.validation()
      setIsValidating(false)
      
      if (!isValid) return
    }

    setCompletedSteps(prev => new Set(prev).add(currentStep))
    
    if (isLastStep) {
      await onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, steps, isLastStep, onComplete])

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }, [isFirstStep])

  const handleStepClick = useCallback((stepIndex: number) => {
    // Só permite navegar para steps já completados ou o próximo
    if (stepIndex <= Math.max(...Array.from(completedSteps)) + 1) {
      setCurrentStep(stepIndex)
    }
  }, [completedSteps])

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) return 'completed'
    if (stepIndex === currentStep) return 'current'
    if (stepIndex < currentStep) return 'completed'
    return 'pending'
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      
      {/* Progress Header */}
      <ModernCard className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {steps[currentStep]?.title}
            </h2>
            {steps[currentStep]?.description && (
              <p className="text-gray-600 mt-1">
                {steps[currentStep].description}
              </p>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {currentStep + 1} de {steps.length}
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isClickable = index <= Math.max(...Array.from(completedSteps)) + 1
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}`}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    <div className="h-5 w-5">{step.icon}</div>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className="ml-3 min-w-0 flex-1">
                  <p className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </ModernCard>

      {/* Step Content */}
      <ModernCard className="mb-8 min-h-[400px]">
        <div className="animate-fade-in">
          {steps[currentStep]?.content}
        </div>
      </ModernCard>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {!isFirstStep && (
            <ModernButton
              variant="secondary"
              onClick={handlePrevious}
              icon={<ChevronLeft className="h-4 w-4" />}
              iconPosition="left"
            >
              Anterior
            </ModernButton>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <ModernButton
              variant="ghost"
              onClick={onCancel}
            >
              Cancelar
            </ModernButton>
          )}
          
          <ModernButton
            onClick={handleNext}
            loading={isValidating || loading}
            icon={isLastStep ? undefined : <ChevronRight className="h-4 w-4" />}
            iconPosition="right"
          >
            {isLastStep ? 'Finalizar' : 'Próximo'}
          </ModernButton>
        </div>
      </div>
    </div>
  )
}

// Componente para campos de formulário com animação
export function FormField({ 
  label, 
  error, 
  required = false,
  children 
}: {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 animate-fade-in">{error}</p>
      )}
    </div>
  )
}

// Input moderno
export function ModernInput({
  className = "",
  error = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={`w-full px-4 py-3 border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
      } ${className}`}
      {...props}
    />
  )
}

// Select moderno
export function ModernSelect({
  className = "",
  error = false,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={`w-full px-4 py-3 border rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error 
          ? 'border-red-300 focus:ring-red-500' 
          : 'border-gray-300 hover:border-gray-400'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
