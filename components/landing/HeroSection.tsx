'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight, Star, Activity, Plus, Play
} from 'lucide-react'

export default function HeroSection() {
  const { data: session, status } = useSession()

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />
      <div className="absolute inset-0 -z-10" style={{
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px'
      }} />

      <div className="container mx-auto px-4 py-20 lg:py-28 max-w-7xl">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <Badge variant="outline" className="mx-auto px-4 py-1.5">
            <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
            Trusted by 10,000+ developers worldwide
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Reliable Webhook
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Infrastructure Platform
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Receive, process, and forward webhooks with unmatched reliability.
            Built for scale, designed for developers.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                  >
                    <Activity className="w-5 h-5 mr-3" />
                    Open Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard?action=create">
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create Webhook
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-3" />
                    View Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required • Free tier available • Setup in 2 minutes
          </p>

          <p className="text-sm text-muted-foreground/80 mt-4">
            Made with ❤️ by <a href="https://baharihari.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Bahari</a>
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto pt-12">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">99.99%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">&lt;20ms</div>
              <div className="text-sm text-muted-foreground mt-1">Avg Latency</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">10M+</div>
              <div className="text-sm text-muted-foreground mt-1">Requests/Day</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">SOC2</div>
              <div className="text-sm text-muted-foreground mt-1">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}