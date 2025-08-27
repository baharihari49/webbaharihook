'use client'

import { useState } from 'react'
import { Send, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface WebhookWithDestinations {
  id: string
  name: string
  destinationUrls?: string[] | null
  destinationUrl?: string | null // For backward compatibility
}

interface WebhookRequest {
  id: string
  method: string
  body: string
  receivedAt: string
}

interface ResendResult {
  destinationUrl: string
  statusCode: number
  responseTime: number | null
  error: string | null
  success: boolean
  requestId: string
}

interface ResendDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook: WebhookWithDestinations
  request: WebhookRequest
  onResendComplete?: () => void
}

export function ResendDialog({ 
  open, 
  onOpenChange, 
  webhook, 
  request, 
  onResendComplete 
}: ResendDialogProps) {
  const [selectedUrls, setSelectedUrls] = useState<string[]>([])
  const [resending, setResending] = useState(false)
  const [results, setResults] = useState<ResendResult[]>([])
  const [showResults, setShowResults] = useState(false)

  // Get all destination URLs (handle both new and old format)
  const allDestinationUrls = (webhook.destinationUrls && webhook.destinationUrls.length > 0)
    ? webhook.destinationUrls
    : webhook.destinationUrl ? [webhook.destinationUrl] : []

  const handleUrlToggle = (url: string) => {
    setSelectedUrls(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    )
  }

  const handleSelectAll = () => {
    setSelectedUrls(
      selectedUrls.length === allDestinationUrls.length 
        ? [] 
        : [...allDestinationUrls]
    )
  }

  const handleResend = async () => {
    if (selectedUrls.length === 0) return

    setResending(true)
    setShowResults(false)

    try {
      const response = await fetch(`/api/webhooks/${webhook.id}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          destinationUrls: selectedUrls,
          resendAll: false
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
        setShowResults(true)
        onResendComplete?.()
      } else {
        console.error('Resend failed:', data.error)
      }
    } catch (error) {
      console.error('Error resending webhook:', error)
    } finally {
      setResending(false)
    }
  }

  const handleResendAll = async () => {
    setResending(true)
    setShowResults(false)

    try {
      const response = await fetch(`/api/webhooks/${webhook.id}/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          resendAll: true
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results || [])
        setShowResults(true)
        onResendComplete?.()
      } else {
        console.error('Resend failed:', data.error)
      }
    } catch (error) {
      console.error('Error resending webhook:', error)
    } finally {
      setResending(false)
    }
  }

  const handleClose = () => {
    setSelectedUrls([])
    setResults([])
    setShowResults(false)
    onOpenChange(false)
  }

  if (showResults) {
    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Resend Results
            </DialogTitle>
            <DialogDescription>
              Results for resending webhook request to {totalCount} destination{totalCount !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Summary:</strong> {successCount}/{totalCount} destinations succeeded
              </AlertDescription>
            </Alert>

            {/* Results */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {result.destinationUrl}
                          </code>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={result.success ? 'default' : 'destructive'}>
                            {result.statusCode}
                          </Badge>
                          {result.responseTime !== null && (
                            <span className="text-muted-foreground">
                              {result.responseTime}ms
                            </span>
                          )}
                        </div>

                        {result.error && (
                          <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Resend Webhook
          </DialogTitle>
          <DialogDescription>
            Choose which destination URLs to resend this webhook request to
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <p><strong>Method:</strong> {request.method}</p>
              <p><strong>Received:</strong> {new Date(request.receivedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Destination URLs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Destination URLs</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedUrls.length === allDestinationUrls.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {allDestinationUrls.map((url, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                    <Checkbox
                      checked={selectedUrls.includes(url)}
                      onCheckedChange={() => handleUrlToggle(url)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <code className="text-xs font-mono break-all">
                        {url}
                      </code>
                      {index === 0 && allDestinationUrls.length > 1 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Separator />

        <DialogFooter className="gap-2">
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleResendAll}
            disabled={resending}
            variant="secondary"
          >
            {resending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Resend to All
          </Button>
          <Button
            onClick={handleResend}
            disabled={resending || selectedUrls.length === 0}
          >
            {resending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Resend Selected ({selectedUrls.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}