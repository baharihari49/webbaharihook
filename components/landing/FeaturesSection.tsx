'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Zap, Shield, BarChart3, RefreshCw, Globe, Lock,
  CheckCircle2, Terminal
} from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-20ms processing with global edge network distribution",
      color: "yellow"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption, SOC2 compliance, and GDPR ready",
      color: "green"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards with actionable insights",
      color: "blue"
    },
    {
      icon: RefreshCw,
      title: "Smart Retries",
      description: "Automatic retry logic with exponential backoff",
      color: "purple"
    },
    {
      icon: Globe,
      title: "Multi-Region",
      description: "Deploy across multiple regions for lower latency",
      color: "cyan"
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Fine-grained permissions and API key management",
      color: "red"
    }
  ]

  const advancedFeatures = [
    "Custom webhook transformations with JavaScript",
    "Request/Response filtering and validation",
    "Webhook signature verification (HMAC)",
    "Batch processing and aggregation",
    "Dead letter queue management",
    "Webhook event replay and debugging"
  ]

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-4xl font-bold mb-4">Built for Modern Development</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to handle webhooks at scale with confidence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/20">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 sm:p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start lg:items-center">
            <div className="order-2 lg:order-1">
              <Badge className="mb-4">Advanced</Badge>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Developer-First Features</h3>
              <ul className="space-y-3 sm:space-y-4">
                {advancedFeatures.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground/90 text-sm sm:text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="bg-background rounded-lg shadow-xl p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-hidden">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Terminal className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>webhook-transform.js</span>
                </div>
                <div className="relative">
                  <pre className="text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all sm:break-normal">
                    <code>{`// Transform incoming webhook
export default function transform(webhook) {
  const { headers, body } = webhook;

  // Custom logic here
  return {
    ...body,
    timestamp: Date.now(),
    processed: true
  };
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}