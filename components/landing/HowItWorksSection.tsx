'use client'

import { Badge } from '@/components/ui/badge'
import { Send, FileJson, TrendingUp } from 'lucide-react'

export default function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Create Endpoint",
      description: "Generate a unique webhook URL with one click. Configure destination URLs and processing rules.",
      icon: Send
    },
    {
      step: "02",
      title: "Point & Configure",
      description: "Add your webhook URL to any service. Set up transformations, filters, and retry logic.",
      icon: FileJson
    },
    {
      step: "03",
      title: "Monitor & Scale",
      description: "Track every request in real-time. Auto-scale based on traffic with zero configuration.",
      icon: TrendingUp
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-4xl font-bold mb-4">Simple Integration, Powerful Results</h2>
          <p className="text-xl text-muted-foreground">Get started in minutes, not hours</p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          {/* Background connection lines */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 pointer-events-none">
            <div className="relative h-full max-w-3xl mx-auto">
              <div className="absolute left-1/6 right-1/6 top-0 h-full bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative">
            {steps.map((item, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-background border-4 border-primary/20 flex items-center justify-center mx-auto mb-6 relative shadow-xl">
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <item.icon className="w-10 h-10 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}