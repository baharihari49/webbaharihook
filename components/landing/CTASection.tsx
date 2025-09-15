'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, Activity, LogIn } from 'lucide-react'

export default function CTASection() {
  const { data: session, status } = useSession()

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
      <div className="container mx-auto px-4 text-center relative max-w-7xl">
        <Badge variant="outline" className="mb-4">Get Started</Badge>
        {status === 'authenticated' ? (
          <>
            <h2 className="text-4xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access your dashboard and start managing webhooks like a pro
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
                >
                  <Activity className="w-5 h-5 mr-3" />
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] h-14 px-10 text-base font-semibold rounded-lg border-2 border-primary/20 hover:border-primary/40 bg-background/80 backdrop-blur-sm hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                >
                  View Documentation
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-4">Start Building Today</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of developers using Webbaharihook to power their webhook infrastructure
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
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
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Free forever for up to 10,000 requests/month
            </p>
          </>
        )}
      </div>
    </section>
  )
}