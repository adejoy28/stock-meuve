// errorHandler.ts — Centralized error handling for API calls
// Provides consistent error messages and handling across the application

export interface ApiError {
  status?: number
  message: string
  details?: any
}

export class ApiErrorHandler {
  static handleError(error: any): ApiError {
    // Network error
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return {
          message: 'Request timeout. Please try again.',
          status: 408
        }
      }
      return {
        message: 'Cannot reach server — check your connection',
        status: 0
      }
    }

    const { status, data } = error.response

    // 422 Validation errors
    if (status === 422) {
      const validationErrors = data?.errors || data?.data?.errors || {}
      const errorMessages = Object.values(validationErrors).flat() as string[]
      
      return {
        status: 422,
        message: errorMessages.join(', ') || 'Validation failed. Please check your input.',
        details: validationErrors
      }
    }

    // 409 Conflict errors
    if (status === 409) {
      return {
        status: 409,
        message: data?.message || 'This action conflicts with existing data.',
        details: data
      }
    }

    // 403 Forbidden
    if (status === 403) {
      return {
        status: 403,
        message: 'You do not have permission to perform this action.',
        details: data
      }
    }

    // 404 Not Found
    if (status === 404) {
      return {
        status: 404,
        message: 'The requested resource was not found.',
        details: data
      }
    }

    // 500 Server errors
    if (status >= 500) {
      return {
        status: 500,
        message: 'Something went wrong, please try again.',
        details: data
      }
    }

    // Default error
    return {
      status: status || 0,
      message: data?.message || error.message || 'An unexpected error occurred.',
      details: data
    }
  }

  static getFieldError(error: ApiError, fieldName: string): string | null {
    if (error.status === 422 && error.details) {
      const fieldErrors = error.details as Record<string, string[]>
      return fieldErrors[fieldName]?.[0] || null
    }
    return null
  }

  static isValidationError(error: ApiError): boolean {
    return error.status === 422
  }

  static isConflictError(error: ApiError): boolean {
    return error.status === 409
  }

  static isNetworkError(error: ApiError): boolean {
    return error.status === 0
  }

  static isServerError(error: ApiError): boolean {
    return (error.status || 0) >= 500
  }
}

// Hook for handling API errors in React components
export function useApiErrorHandler() {
  const handleError = (error: any, onError?: (error: ApiError) => void) => {
    const apiError = ApiErrorHandler.handleError(error)
    
    if (onError) {
      onError(apiError)
    }
    
    // Log to console for debugging
    console.error('API Error:', apiError)
    
    return apiError
  }

  return { handleError }
}
