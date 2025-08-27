'use client'

import { useState } from 'react'
import { Copy, ExternalLink, RefreshCw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RequestHistory } from './request-history'

interface Webhook {
  id: string
  name: string
  endpoint: string
  destinationUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  requests: Request[]
}

interface Request {
  id: string
  method: string
  headers: string
  body: string
  query: string
  responseStatus: number | null
  responseBody: string | null
  error: string | null
  receivedAt: string
  forwardedAt: string | null
}

interface WebhookDetailProps {
  webhook: Webhook
  onRefresh: () => void
}

export function WebhookDetail({ webhook, onRefresh }: WebhookDetailProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const getWebhookUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
      // Use HTTPS protocol for localhost
      const protocol = window.location.protocol === 'http:' && window.location.hostname === 'localhost' 
        ? 'https:' 
        : window.location.protocol
      return `${protocol}//${window.location.host}/api/w/${endpoint}`
    }
    return `/api/w/${endpoint}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredRequests = webhook.requests?.filter((request) => {
    const matchesSearch = !searchTerm || 
      request.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.error && request.error.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesMethod = methodFilter === 'all' || request.method === methodFilter

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'success' && request.responseStatus && request.responseStatus >= 200 && request.responseStatus < 300) ||
      (statusFilter === 'error' && (!request.responseStatus || request.responseStatus >= 400 || request.error))

    return matchesSearch && matchesMethod && matchesStatus
  }) || []

  const successCount = webhook.requests?.filter(r => 
    r.responseStatus && r.responseStatus >= 200 && r.responseStatus < 300
  ).length || 0
  
  const errorCount = webhook.requests?.filter(r => 
    !r.responseStatus || r.responseStatus >= 400 || r.error
  ).length || 0

  const totalRequests = webhook.requests?.length || 0

  return (
    <div className="space-y-6">
      {/* Webhook Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Webhook Info</span>
              <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                {webhook.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Public Endpoint</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs break-all">
                  {getWebhookUrl(webhook.endpoint)}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(getWebhookUrl(webhook.endpoint))}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Destination URL</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs break-all">
                  {webhook.destinationUrl}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  asChild
                >
                  <a
                    href={webhook.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Request History</CardTitle>
              <CardDescription>
                Monitor all incoming webhook requests and their responses
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RequestHistory requests={filteredRequests} />
        </CardContent>
      </Card>
    </div>
  )
}