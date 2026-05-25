import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          We are here to help. Reach out to us for any medical assistance or inquiries.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Send us a message</h2>
                <p className="text-muted-foreground text-sm">
                  Fill out the form below and our team will get back to you shortly.
                </p>
              </div>

              <form className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="How can we help you?" className="min-h-[120px]" />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Contact Information</h2>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Emergency Contacts</h3>
                <p className="text-muted-foreground">+1 (555) 911-0000</p>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Email Us</h3>
                <p className="text-muted-foreground">contact@medicareplus.com</p>
                <p className="text-muted-foreground">support@medicareplus.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Working Hours</h3>
                <p className="text-muted-foreground">Emergency: 24/7</p>
                <p className="text-muted-foreground">OPD: Mon-Sat, 8am-8pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted-foreground">123 Health Avenue, Medical District</p>
                <p className="text-muted-foreground">Cityville, State 10001</p>
              </div>
            </div>
          </div>

          <div className="aspect-video bg-muted rounded-xl overflow-hidden relative border flex items-center justify-center">
            {/* Google Maps placeholder */}
            <p className="text-muted-foreground font-medium flex flex-col items-center gap-2">
              <MapPin className="h-8 w-8 opacity-50" />
              Google Maps Embed
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
