'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Senior Developer at TechCorp",
      content: "Webbaharihook transformed how we handle webhooks. The reliability and analytics are game-changing.",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      role: "CTO at StartupXYZ",
      content: "Finally, a webhook service that just works. Setup took minutes, and we've had zero downtime.",
      rating: 5
    },
    {
      name: "Mike Williams",
      role: "DevOps Lead at Scale.io",
      content: "The best webhook infrastructure we've used. Great performance and excellent support team.",
      rating: 5
    }
  ]

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl font-bold mb-4">Loved by Developers</h2>
          <p className="text-xl text-muted-foreground">See what our users are saying</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}