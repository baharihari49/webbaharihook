'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, ChevronDown, Settings, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface WebhookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { 
    name: string
    destinationUrl: string
    description?: string
    timeout?: number
    retryAttempts?: number
    isActive?: boolean
    customHeaders?: Record<string, string>
  }) => Promise<void>
  initialData?: { 
    name: string
    destinationUrl: string
    description?: string
    timeout?: number
    retryAttempts?: number
    isActive?: boolean
    customHeaders?: Record<string, string>
  }
}

const presetDestinations = [
  { name: 'Discord Webhook', url: 'https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN' },
  { name: 'Slack Webhook', url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK' },
  { name: 'GitHub Webhook', url: 'https://api.github.com/repos/owner/repo/hooks' },
  { name: 'Webhook.site', url: 'https://webhook.site/YOUR_UNIQUE_URL' },
  { name: 'RequestBin', url: 'https://requestbin.com/r/YOUR_BIN_ID' },
  { name: 'Localhost (Port 3000)', url: 'http://localhost:3000/webhook' },
  { name: 'Localhost (Port 8080)', url: 'http://localhost:8080/webhook' },
]

export function WebhookForm({ open, onOpenChange, onSubmit, initialData }: WebhookFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [destinationUrl, setDestinationUrl] = useState(initialData?.destinationUrl || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [timeout, setTimeout] = useState(initialData?.timeout || 30)
  const [retryAttempts, setRetryAttempts] = useState(initialData?.retryAttempts || 3)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [customHeaders, setCustomHeaders] = useState(JSON.stringify(initialData?.customHeaders || {}, null, 2))
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingUrl, setGeneratingUrl] = useState(false)

  const generateRandomDestination = async () => {
    setGeneratingUrl(true)
    try {
      const response = await fetch('/api/generate-destination')
      const data = await response.json()
      if (data.destinationUrl) {
        setDestinationUrl(data.destinationUrl)
      }
    } catch (error) {
      console.error('Error generating destination URL:', error)
    } finally {
      setGeneratingUrl(false)
    }
  }

  const selectPresetDestination = (url: string, presetName: string) => {
    setDestinationUrl(url)
    if (!name || name === 'My Webhook') {
      setName(presetName)
    }
  }

  useEffect(() => {
    if (open && !initialData) {
      setName('')
      setDestinationUrl('')
      setDescription('')
      setTimeout(30)
      setRetryAttempts(3)
      setIsActive(true)
      setCustomHeaders('{}')
      setShowAdvanced(false)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      let parsedHeaders = {}
      try {
        parsedHeaders = JSON.parse(customHeaders)
      } catch {
        parsedHeaders = {}
      }

      await onSubmit({ 
        name, 
        destinationUrl,
        description: description || undefined,
        timeout,
        retryAttempts,
        isActive,
        customHeaders: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined
      })
      
      if (!initialData) {
        setName('')
        setDestinationUrl('')
        setDescription('')
        setTimeout(30)
        setRetryAttempts(3)
        setIsActive(true)
        setCustomHeaders('{}')
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialData ? 'Edit' : 'Create'} Webhook</DialogTitle>
            <DialogDescription>
              {initialData ? 'Update your webhook settings' : 'Create a new webhook endpoint with advanced options'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Webhook Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Payment Gateway Webhook"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of what this webhook does..."
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="destinationUrl">Destination URL *</Label>
                  <div className="flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          Presets
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        {presetDestinations.map((preset) => (
                          <DropdownMenuItem
                            key={preset.name}
                            onClick={() => selectPresetDestination(preset.url, preset.name)}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{preset.name}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {preset.url.length > 40 ? preset.url.substring(0, 40) + '...' : preset.url}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={generateRandomDestination}
                          disabled={generatingUrl}
                          className="cursor-pointer"
                        >
                          <RefreshCw className={`h-3 w-3 mr-2 ${generatingUrl ? 'animate-spin' : ''}`} />
                          Generate Mock URL
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <Input
                  id="destinationUrl"
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://api.example.com/webhook"
                  required
                  disabled={generatingUrl}
                />
                <p className="text-xs text-muted-foreground">
                  The URL where webhook requests will be forwarded
                </p>
              </div>
            </div>

            {/* Webhook Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Webhook Status</Label>
                <p className="text-xs text-muted-foreground">
                  {isActive ? 'This webhook is currently active and will receive requests' : 'This webhook is inactive and will not receive requests'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>

            <Separator />

            {/* Advanced Options */}
            <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="w-full justify-start p-0 h-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Advanced Options</span>
                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="timeout">Timeout (seconds)</Label>
                    <Select value={timeout.toString()} onValueChange={(value) => setTimeout(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="retryAttempts">Retry Attempts</Label>
                    <Select value={retryAttempts.toString()} onValueChange={(value) => setRetryAttempts(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No retries</SelectItem>
                        <SelectItem value="1">1 retry</SelectItem>
                        <SelectItem value="3">3 retries</SelectItem>
                        <SelectItem value="5">5 retries</SelectItem>
                        <SelectItem value="10">10 retries</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="customHeaders">Custom Headers (JSON)</Label>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Textarea
                    id="customHeaders"
                    value={customHeaders}
                    onChange={(e) => setCustomHeaders(e.target.value)}
                    placeholder='{
  "Authorization": "Bearer token",
  "X-Custom-Header": "value"
}'
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional headers to include with forwarded requests (JSON format)
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}