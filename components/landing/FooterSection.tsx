'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Webhook, Github, Twitter, MessageSquare,
  Lock, Shield, CheckCircle2
} from 'lucide-react'

export default function FooterSection() {

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Webbaharihook</span>
          </div>
          <p className="text-muted-foreground text-base mb-6 max-w-md">
            Reliable webhook infrastructure for modern applications. Made with ❤️ by <a href="https://baharihari.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Bahari</a>.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm sm:text-base text-muted-foreground">
          <p className="text-center md:text-left">&copy; 2024 Webbaharihook. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
              <Lock className="w-3 h-3 mr-1" />
              SOC2 Compliant
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
              <Shield className="w-3 h-3 mr-1" />
              GDPR Ready
            </Badge>
            <Badge variant="outline" className="text-xs sm:text-sm whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              99.99% Uptime
            </Badge>
          </div>
        </div>
      </div>
    </footer>
  )
}