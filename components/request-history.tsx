'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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

interface RequestHistoryProps {
  requests: Request[]
}

export function RequestHistory({ requests }: RequestHistoryProps) {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())

  const toggleExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedRequests(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString
    }
  }

  const getStatusColor = (status: number | null, error: string | null) => {
    if (error) return 'destructive'
    if (!status) return 'secondary'
    if (status >= 200 && status < 300) return 'default'
    if (status >= 400) return 'destructive'
    return 'secondary'
  }

  const getStatusIcon = (status: number | null, error: string | null) => {
    if (error) return <AlertCircle className="h-4 w-4" />
    if (!status) return <Clock className="h-4 w-4" />
    if (status >= 200 && status < 300) return <CheckCircle className="h-4 w-4" />
    if (status >= 400) return <AlertCircle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No requests yet</h3>
        <p className="text-muted-foreground">
          Webhook requests will appear here once they start coming in
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((request) => {
        const isExpanded = expandedRequests.has(request.id)
        const headers = formatJson(request.headers)
        const query = formatJson(request.query)
        
        return (
          <div key={request.id} className="border rounded-lg">
            <Collapsible>
              <CollapsibleTrigger
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpanded(request.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.responseStatus, request.error)}
                      <Badge variant="outline" className="font-mono">
                        {request.method}
                      </Badge>
                      <Badge 
                        variant={getStatusColor(request.responseStatus, request.error)}
                      >
                        {request.error ? 'Error' : request.responseStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(request.receivedAt), { addSuffix: true })}
                  </div>
                </div>
                
                {request.error && (
                  <div className="mt-2 text-sm text-destructive">
                    Error: {request.error}
                  </div>
                )}
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="border-t p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Request Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Request Details</h4>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium">Headers</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(headers)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                          {headers}
                        </pre>
                      </div>

                      {request.query && request.query !== '{}' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">Query Parameters</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(query)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                            {query}
                          </pre>
                        </div>
                      )}

                      {request.body && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">Request Body</p>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                                  <DialogHeader>
                                    <DialogTitle>Request Body</DialogTitle>
                                    <DialogDescription>
                                      Full request body content
                                    </DialogDescription>
                                  </DialogHeader>
                                  <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                                    {formatJson(request.body)}
                                  </pre>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(request.body)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-20">
                            {request.body.length > 200 ? 
                              `${request.body.substring(0, 200)}...` : 
                              formatJson(request.body)
                            }
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Response Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Response Details</h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-mono">
                            {request.responseStatus || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Forwarded</p>
                          <p className="font-mono text-xs">
                            {request.forwardedAt ? 
                              formatDistanceToNow(new Date(request.forwardedAt), { addSuffix: true }) : 
                              'Not forwarded'
                            }
                          </p>
                        </div>
                      </div>

                      {request.responseBody && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium">Response Body</p>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                                  <DialogHeader>
                                    <DialogTitle>Response Body</DialogTitle>
                                    <DialogDescription>
                                      Response from destination URL
                                    </DialogDescription>
                                  </DialogHeader>
                                  <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                                    {formatJson(request.responseBody)}
                                  </pre>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(request.responseBody!)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-20">
                            {request.responseBody.length > 200 ? 
                              `${request.responseBody.substring(0, 200)}...` : 
                              formatJson(request.responseBody)
                            }
                          </pre>
                        </div>
                      )}

                      {request.error && (
                        <div>
                          <p className="text-xs font-medium mb-1">Error Details</p>
                          <div className="text-xs bg-destructive/10 text-destructive p-2 rounded">
                            {request.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )
      })}
    </div>
  )
}