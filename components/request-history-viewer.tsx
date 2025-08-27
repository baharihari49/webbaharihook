'use client'

import { useState, useMemo } from 'react'
import { 
  Search, Download, Eye, RefreshCw, Calendar,
  CheckCircle, XCircle, Clock, Globe, Code, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

interface RequestHistoryViewerProps {
  requests: Request[]
  onRefresh: () => void
  loading?: boolean
}

export function RequestHistoryViewer({ requests, onRefresh, loading }: RequestHistoryViewerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [sortBy, setSortBy] = useState<'receivedAt' | 'responseTime' | 'statusCode'>('receivedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter(request => {
        const matchesSearch = request.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (request.statusCode?.toString().includes(searchTerm)) ||
                             new Date(request.receivedAt).toLocaleString().toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || 
                             (statusFilter === 'success' && request.statusCode && request.statusCode < 400) ||
                             (statusFilter === 'error' && (!request.statusCode || request.statusCode >= 400))
                             
        const matchesMethod = methodFilter === 'all' || request.method === methodFilter
        
        return matchesSearch && matchesStatus && matchesMethod
      })
      .sort((a, b) => {
        let comparison = 0
        
        switch (sortBy) {
          case 'receivedAt':
            comparison = new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
            break
          case 'responseTime':
            comparison = (a.responseTime || 0) - (b.responseTime || 0)
            break
          case 'statusCode':
            comparison = (a.statusCode || 0) - (b.statusCode || 0)
            break
        }
        
        return sortOrder === 'asc' ? comparison : -comparison
      })
  }, [requests, searchTerm, statusFilter, methodFilter, sortBy, sortOrder])

  const uniqueMethods = Array.from(new Set(requests.map(r => r.method)))
  
  const exportRequests = () => {
    const dataStr = JSON.stringify(filteredAndSortedRequests, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `webhook-requests-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const getStatusIcon = (request: Request) => {
    if (!request.statusCode) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (request.statusCode < 400) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />
  }

  const getStatusBadgeVariant = (statusCode: number | null) => {
    if (!statusCode) return 'destructive'
    if (statusCode < 400) return 'default'
    return 'destructive'
  }

  const formatHeaders = (headers: Record<string, unknown>) => {
    if (!headers || typeof headers !== 'object') return 'No headers'
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n')
  }

  const formatJsonBody = (body: string) => {
    try {
      return JSON.stringify(JSON.parse(body), null, 2)
    } catch {
      return body
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4 items-center flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
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

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {uniqueMethods.map(method => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportRequests}
            disabled={filteredAndSortedRequests.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedRequests.length} of {requests.length} requests
        </span>
        <div className="flex gap-4 items-center">
          <span>Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'receivedAt' | 'statusCode' | 'responseTime')}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receivedAt">Date</SelectItem>
              <SelectItem value="responseTime">Response Time</SelectItem>
              <SelectItem value="statusCode">Status Code</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-2"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Request List */}
      <Card>
        <CardContent className="p-0">
          {filteredAndSortedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No requests found</p>
              <p className="text-sm">
                {requests.length === 0 
                  ? 'No webhook requests have been received yet'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAndSortedRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(request)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {request.method}
                          </Badge>
                          <Badge 
                            variant={getStatusBadgeVariant(request.statusCode)}
                            className="text-xs"
                          >
                            {request.statusCode || 'Failed'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(request.receivedAt).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {request.responseTime || 0}ms
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {selectedRequest.method} request received at {new Date(selectedRequest.receivedAt).toLocaleString()}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <Tabs defaultValue="overview" className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Request Body</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Request Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <Badge variant="outline">{selectedRequest.method}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedRequest.statusCode)}>
                          {selectedRequest.statusCode || 'Failed'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="font-mono">{selectedRequest.responseTime || 0}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Received:</span>
                        <span className="font-mono text-xs">
                          {new Date(selectedRequest.receivedAt).toISOString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Forward Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Forwarded:</span>
                        <span>{selectedRequest.forwardedAt ? '✓ Yes' : '✗ No'}</span>
                      </div>
                      {selectedRequest.forwardedAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Forwarded At:</span>
                          <span className="font-mono text-xs">
                            {new Date(selectedRequest.forwardedAt).toISOString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="headers" className="mt-4">
                <ScrollArea className="h-96">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {formatHeaders(selectedRequest.headers)}
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="body" className="mt-4">
                <ScrollArea className="h-96">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                    {selectedRequest.body 
                      ? formatJsonBody(selectedRequest.body)
                      : 'No request body'
                    }
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="response" className="mt-4">
                <ScrollArea className="h-96">
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap font-mono">
                    {selectedRequest.responseBody 
                      ? formatJsonBody(selectedRequest.responseBody)
                      : selectedRequest.statusCode 
                        ? 'No response body'
                        : 'Request failed - no response received'
                    }
                  </pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}