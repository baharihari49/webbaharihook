'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  ArrowLeft, Activity, Clock, TrendingUp, AlertCircle, 
  Copy, ExternalLink, Edit, Power, Trash2, Send, RefreshCw,
  CheckCircle, XCircle, BarChart3,
  Calendar, Settings, Eye
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { WebhookForm } from '@/components/webhook-form'
import { WebhookTestDialog } from '@/components/webhook-test-dialog'
import { RequestHistoryViewer } from '@/components/request-history-viewer'
import { WebhookAnalytics } from '@/components/webhook-analytics'

interface Webhook {
  id: string
  name: string
  endpoint: string
  destinationUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    requests: number
  }
}

interface Request {
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

export default function WebhookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [webhook, setWebhook] = useState<Webhook | null>(null)
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'analytics'>('overview')
  const [requestsLoading, setRequestsLoading] = useState(false)
  
  const webhookId = params.id as string

  const fetchWebhook = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`)
      if (response.ok) {
        const data = await response.json()
        setWebhook(data)
        setRequests(data.requests || [])
      } else if (response.status === 404) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching webhook:', error)
    } finally {
      setLoading(false)
    }
  }, [webhookId, router])

  const refreshRequests = async () => {
    setRequestsLoading(true)
    await fetchWebhook()
    setTimeout(() => setRequestsLoading(false), 500)
  }

  useEffect(() => {
    if (session) {
      fetchWebhook()
    }
  }, [session, webhookId, fetchWebhook])

  const getWebhookUrl = (endpoint: string) => {
    if (typeof window !== 'undefined') {
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

  const handleEdit = async (data: Record<string, unknown>) => {
    const response = await fetch(`/api/webhooks/${webhookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      await fetchWebhook()
    }
  }

  const handleToggleActive = async () => {
    if (!webhook) return
    
    const response = await fetch(`/api/webhooks/${webhookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !webhook.isActive }),
    })

    if (response.ok) {
      await fetchWebhook()
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this webhook? This action cannot be undone.')) return

    const response = await fetch(`/api/webhooks/${webhookId}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p>Loading webhook details...</p>
        </div>
      </div>
    )
  }

  if (!webhook) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p>Webhook not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const recentRequests = requests.slice(0, 5)
  const successRate = requests.length > 0 
    ? Math.round((requests.filter(r => r.statusCode && r.statusCode < 400).length / requests.length) * 100)
    : 0
  const avgResponseTime = requests.length > 0
    ? Math.round(requests.reduce((sum, r) => sum + (r.responseTime || 0), 0) / requests.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              {webhook.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-500" />
              )}
              <h1 className="text-2xl font-bold">{webhook.name}</h1>
              <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                {webhook.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Created {new Date(webhook.createdAt).toLocaleDateString()} • {webhook._count.requests} total requests
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setTestDialogOpen(true)}>
            <Send className="mr-2 h-4 w-4" />
            Test
          </Button>
          <Button variant="outline" onClick={() => setEditFormOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={handleToggleActive}
          >
            <Power className="mr-2 h-4 w-4" />
            {webhook.isActive ? 'Disable' : 'Enable'}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{webhook._count.requests}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Successful forwards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Request</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.length > 0 
                ? (() => {
                    const diff = Date.now() - new Date(requests[0].receivedAt).getTime()
                    const minutes = Math.floor(diff / 60000)
                    const hours = Math.floor(minutes / 60)
                    const days = Math.floor(hours / 24)
                    
                    if (days > 0) return `${days}d`
                    if (hours > 0) return `${hours}h`
                    if (minutes > 0) return `${minutes}m`
                    return '<1m'
                  })()
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {requests.length > 0 ? 'ago' : 'No requests yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Eye className="mr-2 h-4 w-4 inline" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'requests'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Activity className="mr-2 h-4 w-4 inline" />
            Request History ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <BarChart3 className="mr-2 h-4 w-4 inline" />
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Webhook Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Public Endpoint</p>
                <div className="flex items-center gap-2">
                  <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs break-all flex-1">
                    {getWebhookUrl(webhook.endpoint)}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyToClipboard(getWebhookUrl(webhook.endpoint))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">Destination URL</p>
                <div className="flex items-center gap-2">
                  <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs break-all flex-1">
                    {webhook.destinationUrl}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
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

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{webhook.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Endpoint ID</p>
                  <p className="font-medium font-mono">{webhook.endpoint}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(webhook.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modified</p>
                  <p className="font-medium">{new Date(webhook.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshRequests}
                disabled={requestsLoading}
              >
                <RefreshCw className={`h-4 w-4 ${requestsLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No requests yet</p>
                  <p className="text-sm">Send a test request to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        {request.statusCode && request.statusCode < 400 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {request.method}
                            </Badge>
                            <span className="text-sm font-medium">
                              {request.statusCode || 'Failed'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.receivedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-medium">{request.responseTime || 0}ms</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab('requests')}>
                    View All Requests ({requests.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'requests' && (
        <RequestHistoryViewer 
          requests={requests} 
          onRefresh={refreshRequests}
          loading={requestsLoading}
        />
      )}

      {activeTab === 'analytics' && (
        <WebhookAnalytics 
          webhook={webhook}
          requests={requests}
        />
      )}

      {/* Edit Form */}
      {webhook && (
        <WebhookForm
          open={editFormOpen}
          onOpenChange={setEditFormOpen}
          onSubmit={handleEdit}
          initialData={{
            name: webhook.name,
            destinationUrl: webhook.destinationUrl,
          }}
        />
      )}

      {/* Test Dialog */}
      {webhook && (
        <WebhookTestDialog
          open={testDialogOpen}
          onOpenChange={setTestDialogOpen}
          webhook={webhook}
        />
      )}
    </div>
  )
}