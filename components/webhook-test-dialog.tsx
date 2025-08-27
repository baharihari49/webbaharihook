'use client'

import { useState } from 'react'
import { Send, Code, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Webhook {
  id: string
  name: string
  endpoint: string
  destinationUrls: string[]
  destinationUrl?: string // For backward compatibility
  isActive: boolean
}

interface WebhookTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  webhook: Webhook
}

interface TestResult {
  success: boolean
  statusCode?: number
  responseTime?: number
  error?: string
  response?: Record<string, unknown>
}

export function WebhookTestDialog({ open, onOpenChange, webhook }: WebhookTestDialogProps) {
  const [method, setMethod] = useState('POST')
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json",\n  "X-Test-Webhook": "true"\n}')
  const [body, setBody] = useState('{\n  "test": true,\n  "message": "Hello from webhook test",\n  "timestamp": "' + new Date().toISOString() + '"\n}')
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const getWebhookUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'http:' && window.location.hostname === 'localhost' 
        ? 'https:' 
        : window.location.protocol
      return `${protocol}//${window.location.host}/api/w/${endpoint}`
    }
    return `/api/w/${endpoint}`
  }

  const handleTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    const startTime = Date.now()

    try {
      let parsedHeaders = {}
      try {
        parsedHeaders = JSON.parse(headers)
      } catch {
        parsedHeaders = { 'Content-Type': 'application/json' }
      }

      let parsedBody
      try {
        parsedBody = method === 'GET' ? undefined : JSON.parse(body)
      } catch {
        parsedBody = method === 'GET' ? undefined : body
      }

      const response = await fetch(getWebhookUrl(webhook.endpoint), {
        method,
        headers: parsedHeaders,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined,
      })

      const responseTime = Date.now() - startTime
      let responseData

      try {
        responseData = await response.json()
      } catch {
        responseData = await response.text()
      }

      setTestResult({
        success: response.ok,
        statusCode: response.status,
        responseTime,
        response: responseData,
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const presetTests = [
    {
      name: 'Simple POST',
      method: 'POST',
      headers: '{\n  "Content-Type": "application/json"\n}',
      body: '{\n  "message": "Hello World"\n}'
    },
    {
      name: 'GitHub Webhook',
      method: 'POST',
      headers: '{\n  "Content-Type": "application/json",\n  "X-GitHub-Event": "push",\n  "X-GitHub-Delivery": "test-delivery"\n}',
      body: '{\n  "ref": "refs/heads/main",\n  "repository": {\n    "name": "test-repo",\n    "full_name": "user/test-repo"\n  },\n  "pusher": {\n    "name": "test-user"\n  }\n}'
    },
    {
      name: 'Stripe Webhook',
      method: 'POST',
      headers: '{\n  "Content-Type": "application/json",\n  "Stripe-Signature": "test-signature"\n}',
      body: '{\n  "id": "evt_test_webhook",\n  "object": "event",\n  "type": "payment_intent.succeeded",\n  "data": {\n    "object": {\n      "id": "pi_test_payment",\n      "amount": 2000,\n      "currency": "usd"\n    }\n  }\n}'
    }
  ]

  const loadPreset = (preset: typeof presetTests[0]) => {
    setMethod(preset.method)
    setHeaders(preset.headers)
    setBody(preset.body)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Webhook: {webhook.name}
          </DialogTitle>
          <DialogDescription>
            Send test requests to your webhook endpoint and see the results
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="request" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                    <Label>Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>URL</Label>
                    <Input 
                      value={getWebhookUrl(webhook.endpoint)} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label>Headers (JSON format)</Label>
                  <Textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="font-mono text-sm"
                    rows={6}
                  />
                </div>

                {method !== 'GET' && (
                  <div>
                    <Label>Body (JSON format)</Label>
                    <Textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="font-mono text-sm"
                      rows={8}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleTest} 
                  disabled={isLoading || !webhook.isActive}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Test Request'}
                </Button>

                {!webhook.isActive && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
                    ⚠️ This webhook is currently inactive. Activate it to receive test requests.
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-3 pr-4">
                <p className="text-sm text-muted-foreground">
                  Choose from common webhook patterns to quickly test your endpoint
                </p>
                {presetTests.map((preset, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer" onClick={() => loadPreset(preset)}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{preset.name}</h4>
                      <Badge variant="outline">{preset.method}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {preset.name === 'Simple POST' && 'Basic POST request with JSON payload'}
                      {preset.name === 'GitHub Webhook' && 'Simulates a GitHub push event webhook'}
                      {preset.name === 'Stripe Webhook' && 'Simulates a Stripe payment success webhook'}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="result" className="space-y-4 mt-4">
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {!testResult && (
                  <div className="text-center text-muted-foreground py-8">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test results yet. Send a test request to see the response.</p>
                  </div>
                )}

                {testResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {testResult.success ? 'Test Successful' : 'Test Failed'}
                      </span>
                      {testResult.statusCode && (
                        <Badge variant={testResult.success ? 'default' : 'destructive'}>
                          {testResult.statusCode}
                        </Badge>
                      )}
                      {testResult.responseTime && (
                        <Badge variant="outline">
                          {testResult.responseTime}ms
                        </Badge>
                      )}
                    </div>

                    {testResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">Error</h4>
                        <pre className="text-sm text-red-700 whitespace-pre-wrap">{testResult.error}</pre>
                      </div>
                    )}

                    {testResult.response && (
                      <div className="bg-muted rounded-lg p-4">
                        <h4 className="font-medium mb-2">Response</h4>
                        <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                          {typeof testResult.response === 'string' 
                            ? testResult.response 
                            : JSON.stringify(testResult.response, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}