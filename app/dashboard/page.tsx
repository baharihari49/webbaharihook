'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { WebhookList } from '@/components/webhook-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Globe, Clock, CheckCircle, XCircle } from 'lucide-react'

function DashboardContent() {
  const [webhooks, setWebhooks] = useState([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  
  const action = searchParams?.get('action')
  const view = searchParams?.get('view')

  const fetchWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks')
      const data = await response.json()
      setWebhooks(data)
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchWebhooks()
    }
  }, [session])

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please sign in to access your webhooks.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  // Handle special views from sidebar
  if (view === 'status') {
    const totalRequests = webhooks.reduce((sum: number, webhook: Record<string, unknown>) => sum + ((webhook._count as { requests?: number })?.requests || 0), 0)
    const activeWebhooks = webhooks.filter((webhook: Record<string, unknown>) => webhook.isActive).length
    const recentActivity = webhooks.some((webhook: Record<string, unknown>) => ((webhook._count as { requests?: number })?.requests || 0) > 0)
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Global Status</h2>
            <p className="text-muted-foreground">
              System overview and health monitoring
            </p>
          </div>
          <Badge variant={recentActivity ? 'default' : 'secondary'} className="gap-1">
            <Activity className="h-3 w-3" />
            {recentActivity ? 'Active' : 'Idle'}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Webhooks</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhooks.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeWebhooks} active, {webhooks.length - activeWebhooks} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All time requests processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">Online</div>
              <p className="text-xs text-muted-foreground">
                All services operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days average
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Webhook Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No webhooks created yet. Create your first webhook to see activity.
              </p>
            ) : (
              <div className="space-y-4">
                {webhooks.slice(0, 5).map((webhook: Record<string, unknown>) => (
                  <div key={webhook.id as string} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {webhook.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium">{webhook.name as string}</p>
                        <p className="text-sm text-muted-foreground">
                          {((webhook._count as { requests?: number })?.requests || 0)} requests • {webhook.endpoint as string}
                        </p>
                      </div>
                    </div>
                    <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                      {webhook.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return <WebhookList webhooks={webhooks} onRefresh={fetchWebhooks} initialAction={action} />
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p>Loading...</p></div>}>
      <DashboardContent />
    </Suspense>
  )
}