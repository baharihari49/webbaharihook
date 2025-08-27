'use client'

import React, { useState } from 'react'
import { 
  Copy, ExternalLink, MoreVertical, Plus, Trash2, Edit, Power, Eye, 
  Activity, BarChart3, Search, Filter, RefreshCw, Send, Clock,
  AlertCircle, CheckCircle, XCircle, TrendingUp, Globe
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WebhookForm } from './webhook-form'
import { WebhookTestDialog } from './webhook-test-dialog'

interface Webhook {
  id: string
  name: string
  endpoint: string
  destinationUrls?: string[] | null
  destinationUrl?: string | null  // For backward compatibility
  description?: string | null
  timeout?: number
  retryAttempts?: number
  customHeaders?: Record<string, unknown> | null
  isActive: boolean
  createdAt: string
  updatedAt?: string
  lastRequestAt?: string
  _count?: {
    requests: number
  }
  recentRequests?: {
    id: string
    method: string
    statusCode: number | null
    receivedAt: string
  }[]
}

interface WebhookListProps {
  webhooks: Webhook[]
  onRefresh: () => void
  initialAction?: string | null
}

export function WebhookList({ webhooks, onRefresh, initialAction }: WebhookListProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
  const [testingWebhook, setTestingWebhook] = useState<Webhook | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Handle initial actions from sidebar
  React.useEffect(() => {
    if (initialAction === 'create') {
      setFormOpen(true)
    } else if (initialAction === 'test' && (Array.isArray(webhooks) ? webhooks : []).length > 0) {
      setTestingWebhook((Array.isArray(webhooks) ? webhooks : [])[0])
    }
  }, [initialAction, webhooks])

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

  const handleCreate = async (data: { name: string; destinationUrls: string[]; description?: string; timeout?: number; retryAttempts?: number; isActive?: boolean; customHeaders?: Record<string, string> }) => {
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      onRefresh()
    }
  }

  const handleEdit = async (data: { name: string; destinationUrls: string[]; description?: string; timeout?: number; retryAttempts?: number; isActive?: boolean; customHeaders?: Record<string, string> }) => {
    if (!editingWebhook) return

    const response = await fetch(`/api/webhooks/${editingWebhook.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      setEditingWebhook(null)
      onRefresh()
    }
  }

  const handleToggleActive = async (webhook: Webhook) => {
    const response = await fetch(`/api/webhooks/${webhook.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !webhook.isActive }),
    })

    if (response.ok) {
      onRefresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return

    const response = await fetch(`/api/webhooks/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      onRefresh()
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const filteredAndSortedWebhooks = (Array.isArray(webhooks) ? webhooks : [])
    .filter(webhook => {
      const matchesSearch = webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           webhook.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && webhook.isActive) ||
                           (statusFilter === 'inactive' && !webhook.isActive)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'requests':
          return (b._count?.requests || 0) - (a._count?.requests || 0)
        case 'lastActivity':
          return new Date(b.lastRequestAt || b.createdAt).getTime() - new Date(a.lastRequestAt || a.createdAt).getTime()
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  const getStatusIcon = (webhook: Webhook) => {
    if (!webhook.isActive) return <XCircle className="h-4 w-4 text-gray-500" />
    if ((webhook._count?.requests || 0) > 0) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const getLastActivity = (webhook: Webhook) => {
    if (webhook.lastRequestAt) {
      const diff = Date.now() - new Date(webhook.lastRequestAt).getTime()
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      
      if (days > 0) return `${days}d ago`
      if (hours > 0) return `${hours}h ago`
      if (minutes > 0) return `${minutes}m ago`
      return 'Just now'
    }
    return 'No activity'
  }

  return (
    <>
      {/* Header with Stats */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Webhooks</h2>
          <p className="text-muted-foreground">
            Create and manage your webhook endpoints
          </p>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{(Array.isArray(webhooks) ? webhooks : []).length}</span>
              <span className="text-muted-foreground">Total</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{(Array.isArray(webhooks) ? webhooks : []).filter(w => w.isActive).length}</span>
              <span className="text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{(Array.isArray(webhooks) ? webhooks : []).reduce((sum, w) => sum + (w._count?.requests || 0), 0)}</span>
              <span className="text-muted-foreground">Total Requests</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Webhook
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search webhooks by name or endpoint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <BarChart3 className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="requests">Request Count</SelectItem>
            <SelectItem value="lastActivity">Last Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedWebhooks.map((webhook) => (
          <Card key={webhook.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(webhook)}
                    <CardTitle className="text-base font-semibold truncate">
                      {webhook.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Globe className="mr-1 h-3 w-3" />
                      {webhook.endpoint}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/webhook/${webhook.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTestingWebhook(webhook)}>
                      <Send className="mr-2 h-4 w-4" />
                      Test Webhook
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingWebhook(webhook)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(webhook)}>
                      <Power className="mr-2 h-4 w-4" />
                      {webhook.isActive ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">PUBLIC ENDPOINT</p>
                  <div className="flex items-center gap-2">
                    <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs break-all flex-1">
                      {getWebhookUrl(webhook.endpoint)}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={() => copyToClipboard(getWebhookUrl(webhook.endpoint))}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">DESTINATION URLS</p>
                  {(webhook.destinationUrls || (webhook.destinationUrl ? [webhook.destinationUrl] : [])).filter(Boolean).map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="relative rounded bg-muted px-2 py-1 font-mono text-xs break-all flex-1">
                        {url}
                        {index === 0 && webhook.destinationUrls && webhook.destinationUrls.length > 1 && (
                          <span className="ml-1 text-blue-600 font-semibold">(Primary)</span>
                        )}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        asChild
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>Requests</span>
                    </div>
                    <p className="font-semibold">{webhook._count?.requests || 0}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Last Activity</span>
                    </div>
                    <p className="font-medium text-xs">{getLastActivity(webhook)}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/webhook/${webhook.id}`}>
                      <Eye className="mr-2 h-3 w-3" />
                      Monitor
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setTestingWebhook(webhook)}
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Test
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedWebhooks.length === 0 && (
        <Card className="text-center py-8">
          <CardHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>
              {searchTerm || statusFilter !== 'all' ? 'No matching webhooks' : 'No webhooks yet'}
            </CardTitle>
            <CardDescription>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first webhook to start receiving requests'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Webhook
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <WebhookForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
      />

      {editingWebhook && (
        <WebhookForm
          open={!!editingWebhook}
          onOpenChange={(open) => !open && setEditingWebhook(null)}
          onSubmit={handleEdit}
          initialData={{
            name: editingWebhook.name,
            destinationUrls: editingWebhook.destinationUrls || (editingWebhook.destinationUrl ? [editingWebhook.destinationUrl] : []),
          }}
        />
      )}

      {testingWebhook && (
        <WebhookTestDialog
          open={!!testingWebhook}
          onOpenChange={(open) => !open && setTestingWebhook(null)}
          webhook={testingWebhook}
        />
      )}
    </>
  )
}