'use client'

import { useMemo } from 'react'
import {
  BarChart3, TrendingUp, Clock, Activity, Calendar,
  Globe, Target
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

import { WebhookWithCount, WebhookRequest } from '@/types/webhook'

interface WebhookAnalyticsProps {
  webhook: WebhookWithCount
  requests: WebhookRequest[]
}

export function WebhookAnalytics({ webhook, requests }: WebhookAnalyticsProps) {
  const analytics = useMemo(() => {
    if (requests.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        methodDistribution: {},
        statusCodeDistribution: {},
        hourlyDistribution: Array(24).fill(0),
        dailyDistribution: {},
        responseTimeStats: {
          min: 0,
          max: 0,
          p50: 0,
          p95: 0,
          p99: 0
        }
      }
    }

    const totalRequests = requests.length
    const successfulRequests = requests.filter(r => r.statusCode && r.statusCode < 400).length
    const failedRequests = totalRequests - successfulRequests
    const successRate = Math.round((successfulRequests / totalRequests) * 100)

    // Response time calculations
    const responseTimes = requests
      .map(r => r.responseTime || 0)
      .filter(rt => rt > 0)
      .sort((a, b) => a - b)
    
    const avgResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length)
      : 0

    const responseTimeStats = {
      min: responseTimes.length > 0 ? responseTimes[0] : 0,
      max: responseTimes.length > 0 ? responseTimes[responseTimes.length - 1] : 0,
      p50: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.5)] : 0,
      p95: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.95)] : 0,
      p99: responseTimes.length > 0 ? responseTimes[Math.floor(responseTimes.length * 0.99)] : 0
    }

    // Method distribution
    const methodDistribution = requests.reduce((acc, request) => {
      acc[request.method] = (acc[request.method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Status code distribution
    const statusCodeDistribution = requests.reduce((acc, request) => {
      const statusCode = request.statusCode || 'Failed'
      acc[statusCode] = (acc[statusCode] || 0) + 1
      return acc
    }, {} as Record<string | number, number>)

    // Hourly distribution (24 hours)
    const hourlyDistribution = Array(24).fill(0)
    requests.forEach(request => {
      const hour = new Date(request.receivedAt).getHours()
      hourlyDistribution[hour]++
    })

    // Daily distribution (last 7 days)
    const dailyDistribution: Record<string, number> = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      dailyDistribution[dateKey] = 0
    }

    requests.forEach(request => {
      const dateKey = request.receivedAt.split('T')[0]
      if (dailyDistribution.hasOwnProperty(dateKey)) {
        dailyDistribution[dateKey]++
      }
    })

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      avgResponseTime,
      methodDistribution,
      statusCodeDistribution,
      hourlyDistribution,
      dailyDistribution,
      responseTimeStats
    }
  }, [requests])

  const maxHourlyCount = Math.max(...analytics.hourlyDistribution)
  const maxDailyCount = Math.max(...Object.values(analytics.dailyDistribution))

  const getStatusCodeCategory = (statusCode: string | number) => {
    const code = typeof statusCode === 'string' ? parseInt(statusCode) : statusCode
    if (isNaN(code)) return 'failed'
    if (code >= 200 && code < 300) return 'success'
    if (code >= 300 && code < 400) return 'redirect'
    if (code >= 400 && code < 500) return 'client-error'
    if (code >= 500) return 'server-error'
    return 'other'
  }

  const getStatusBadgeVariant = (category: string) => {
    switch (category) {
      case 'success': return 'default'
      case 'redirect': return 'secondary'
      case 'client-error': return 'destructive'
      case 'server-error': return 'destructive'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Start sending requests to your webhook to see detailed analytics and performance metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
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
            <div className="text-2xl font-bold">{analytics.successRate}%</div>
            <div className="flex text-xs text-muted-foreground gap-2 mt-1">
              <span className="text-green-600">{analytics.successfulRequests} success</span>
              <span className="text-red-600">{analytics.failedRequests} failed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const diff = Date.now() - new Date(webhook.createdAt).getTime()
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                if (days > 0) return `${days}d`
                const hours = Math.floor(diff / (1000 * 60 * 60))
                if (hours > 0) return `${hours}h`
                return '<1h'
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Since creation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* HTTP Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              HTTP Methods
            </CardTitle>
            <CardDescription>Distribution of request methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.methodDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([method, count]) => {
                const percentage = Math.round((count / analytics.totalRequests) * 100)
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{method}</Badge>
                      <span className="text-sm font-medium">{count} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {/* Status Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Status Codes
            </CardTitle>
            <CardDescription>Response status distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.statusCodeDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([statusCode, count]) => {
                const percentage = Math.round((count / analytics.totalRequests) * 100)
                const category = getStatusCodeCategory(statusCode)
                return (
                  <div key={statusCode} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusBadgeVariant(category)}>
                        {statusCode}
                      </Badge>
                      <span className="text-sm font-medium">{count} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      {/* Response Time Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Response Time Statistics
          </CardTitle>
          <CardDescription>Performance percentiles and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{analytics.responseTimeStats.min}ms</div>
              <p className="text-sm text-muted-foreground">Min</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analytics.responseTimeStats.p50}ms</div>
              <p className="text-sm text-muted-foreground">P50</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analytics.responseTimeStats.p95}ms</div>
              <p className="text-sm text-muted-foreground">P95</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analytics.responseTimeStats.p99}ms</div>
              <p className="text-sm text-muted-foreground">P99</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{analytics.responseTimeStats.max}ms</div>
              <p className="text-sm text-muted-foreground">Max</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Request Pattern</CardTitle>
            <CardDescription>Requests by hour of day (24h format)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.hourlyDistribution.map((count, hour) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="text-sm font-mono w-8">{hour.toString().padStart(2, '0')}:00</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all"
                          style={{ width: maxHourlyCount > 0 ? `${(count / maxHourlyCount) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Distribution (Last 7 days) */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Requests in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.dailyDistribution).map(([date, count]) => {
                const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
                const monthDay = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                return (
                  <div key={date} className="flex items-center gap-3">
                    <span className="text-sm font-mono w-16">{dayName}</span>
                    <span className="text-sm w-12">{monthDay}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all"
                            style={{ width: maxDailyCount > 0 ? `${(count / maxDailyCount) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}