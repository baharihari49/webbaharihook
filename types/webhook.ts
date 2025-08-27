// Shared webhook interfaces to avoid conflicts

export interface WebhookBase {
  id: string
  name: string
  endpoint: string
  destinationUrls: string[]
  destinationUrl?: string // For backward compatibility
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WebhookWithCount extends WebhookBase {
  _count?: {
    requests: number
  }
}

export interface WebhookRequest {
  id: string
  method: string
  headers: Record<string, unknown>
  body: string
  statusCode: number | null
  responseBody: string | null
  receivedAt: string
  forwardedAt: string | null
  responseTime: number | null
}

export interface WebhookTestResult {
  success: boolean
  statusCode?: number
  responseTime?: number
  error?: string
  response?: Record<string, unknown>
}