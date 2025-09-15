'use client'

import { Github, Code2, Terminal, Server, Layers } from 'lucide-react'

export default function LogoCloudSection() {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <p className="text-center text-sm text-muted-foreground mb-8">
          TRUSTED BY LEADING COMPANIES
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60">
          <Github className="h-8 w-auto" />
          <Code2 className="h-8 w-auto" />
          <Terminal className="h-8 w-auto" />
          <Server className="h-8 w-auto" />
          <Layers className="h-8 w-auto" />
        </div>
      </div>
    </section>
  )
}