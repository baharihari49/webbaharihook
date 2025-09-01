'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RefreshCw, ChevronDown, Settings, Info, Plus, Trash2 } from 'lucide-react'
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
    destinationUrls: string[]
    allowedMethods?: string[]
    description?: string
    timeout?: number
    retryAttempts?: number
    isActive?: boolean
    customHeaders?: Record<string, string>
  }) => Promise<void>
  initialData?: { 
    name: string
    destinationUrls: string[]
    allowedMethods?: string[]
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
  const [destinationUrls, setDestinationUrls] = useState<string[]>(initialData?.destinationUrls || [''])
  const [description, setDescription] = useState(initialData?.description || '')
  const [allowedMethods, setAllowedMethods] = useState<string[]>(initialData?.allowedMethods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  const [timeout, setTimeout] = useState(initialData?.timeout || 30)
  const [retryAttempts, setRetryAttempts] = useState(initialData?.retryAttempts || 3)
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [customHeaders, setCustomHeaders] = useState(JSON.stringify(initialData?.customHeaders || {}, null, 2))
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingUrl, setGeneratingUrl] = useState(false)
  
  const availableMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
  
  const toggleMethod = (method: string) => {
    if (allowedMethods.includes(method)) {
      setAllowedMethods(allowedMethods.filter(m => m !== method))
    } else {
      setAllowedMethods([...allowedMethods, method])
    }
  }

  const addDestinationUrl = () => {
    setDestinationUrls([...destinationUrls, ''])
  }

  const removeDestinationUrl = (index: number) => {
    if (destinationUrls.length > 1) {
      setDestinationUrls(destinationUrls.filter((_, i) => i !== index))
    }
  }

  const updateDestinationUrl = (index: number, value: string) => {
    const updated = [...destinationUrls]
    updated[index] = value
    setDestinationUrls(updated)
  }

  const generateRandomDestination = async (index: number = 0) => {
    setGeneratingUrl(true)
    try {
      const response = await fetch('/api/generate-destination')
      const data = await response.json()
      if (data.destinationUrl) {
        updateDestinationUrl(index, data.destinationUrl)
      }
    } catch (error) {
      console.error('Error generating destination URL:', error)
    } finally {
      setGeneratingUrl(false)
    }
  }

  const selectPresetDestination = (url: string, presetName: string, index: number = 0) => {
    updateDestinationUrl(index, url)
    if (!name || name === 'My Webhook') {
      setName(presetName)
    }
  }

  useEffect(() => {
    if (open && !initialData) {
      setName('')
      setDestinationUrls([''])
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
        destinationUrls: destinationUrls.filter(url => url.trim() !== ''),
        allowedMethods: allowedMethods.length > 0 ? allowedMethods : undefined,
        description: description || undefined,
        timeout,
        retryAttempts,
        isActive,
        customHeaders: Object.keys(parsedHeaders).length > 0 ? parsedHeaders : undefined
      })
      
      if (!initialData) {
        setName('')
        setDestinationUrls([''])
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
                <Label>Allowed HTTP Methods</Label>
                <div className="flex flex-wrap gap-2">
                  {availableMethods.map((method) => (
                    <label
                      key={method}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={allowedMethods.includes(method)}
                        onChange={() => toggleMethod(method)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm font-medium">{method}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select which HTTP methods this webhook will accept
                </p>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Destination URLs *</Label>
                  <Button
                    type="button"
                    onClick={addDestinationUrl}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add URL
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {destinationUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex gap-1">
                          <Input
                            value={url}
                            onChange={(e) => updateDestinationUrl(index, e.target.value)}
                            placeholder="https://example.com/webhook"
                            required={index === 0}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64">
                              <DropdownMenuItem className="font-medium text-xs text-muted-foreground">
                                Select Preset
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {presetDestinations.map((preset) => (
                                <DropdownMenuItem
                                  key={preset.name}
                                  onClick={() => selectPresetDestination(preset.url, preset.name, index)}
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
                                onClick={() => generateRandomDestination(index)}
                                disabled={generatingUrl}
                                className="cursor-pointer"
                              >
                                <RefreshCw className={`h-3 w-3 mr-2 ${generatingUrl ? 'animate-spin' : ''}`} />
                                Generate Mock URL
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {destinationUrls.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDestinationUrl(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                  {index === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Primary destination - all requests will be sent here
                    </p>
                  )}
                        {index > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Fallback destination #{index} - used if previous destinations fail
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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