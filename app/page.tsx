'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, Webhook, Shield, Zap, LogIn, UserPlus, 
  BarChart3, Globe, Star,
  Github, Twitter, MessageSquare, Play,
  Activity, RefreshCw, Eye, Plus
} from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg">Webbaharihook</span>
          </div>
          <div className="flex items-center gap-4">
            {status === 'authenticated' ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome back, {session?.user?.name || 'User'}!
                </span>
                <Link href="/dashboard">
                  <Button>
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <Badge variant="outline" className="mx-auto">
              <Star className="w-3 h-3 mr-1" />
              Professional Webhook Management
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Webhook Forwarding
              <span className="block text-primary">Made Simple</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create, test, and monitor webhook endpoints with advanced analytics. 
              Perfect for developers who need reliable webhook management and debugging tools.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {status === 'authenticated' ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="text-lg px-8 py-6">
                      <Activity className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/dashboard?action=create">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Webhook
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="text-lg px-8 py-6">
                      <UserPlus className="w-5 h-5 mr-2" />
                      Start Free
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">&lt;50ms</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need for webhook management</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From simple forwarding to advanced analytics, we&apos;ve got you covered
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Instant Setup</h3>
                <p className="text-muted-foreground">
                  Create webhook endpoints in seconds with our intuitive interface. No complex configuration needed.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure & Reliable</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade security with SSL/TLS encryption and reliable delivery guarantees.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Comprehensive analytics with response times, success rates, and detailed request history.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Webhook Testing</h3>
                <p className="text-muted-foreground">
                  Built-in testing tools with preset templates for GitHub, Stripe, and custom payloads.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Request Monitoring</h3>
                <p className="text-muted-foreground">
                  Real-time monitoring with detailed request/response logging and error tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-0 bg-background">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Global Endpoints</h3>
                <p className="text-muted-foreground">
                  Public HTTPS endpoints accessible worldwide with ngrok integration for testing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-xl text-muted-foreground">Get started in 3 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create Endpoint</h3>
              <p className="text-muted-foreground">
                Sign up and create your webhook endpoint with custom destination URL
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Configure & Test</h3>
              <p className="text-muted-foreground">
                Set up advanced options and test your webhook with our built-in tools
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Monitor & Analyze</h3>
              <p className="text-muted-foreground">
                Track performance with detailed analytics and request history
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          {status === 'authenticated' ? (
            <>
              <h2 className="text-3xl font-bold mb-4">Welcome back to Webbaharihook!</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Ready to manage your webhooks? Access your dashboard or create a new webhook endpoint.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    <Activity className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard?action=create">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Webhook
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join developers who trust Webbaharihook for their webhook management needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-lg">Webbaharihook</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Professional webhook management and forwarding platform for developers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Connect</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Webbaharihook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}