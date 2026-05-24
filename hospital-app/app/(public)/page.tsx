import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Activity, Clock, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
                  Your Health, Our <span className="text-primary">Priority</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Providing world-class healthcare with state-of-the-art facilities and compassionate professionals. Book your appointment today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/patient/book" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}>
                  Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/doctors" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}>
                  Find a Doctor
                </Link>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-8 border-t">
                <div>
                  <h3 className="text-3xl font-bold text-primary">50+</h3>
                  <p className="text-sm text-muted-foreground">Expert Doctors</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">24/7</h3>
                  <p className="text-sm text-muted-foreground">Emergency Care</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-primary">10k+</h3>
                  <p className="text-sm text-muted-foreground">Happy Patients</p>
                </div>
              </div>
            </div>
            
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
              <div className="aspect-square rounded-2xl bg-muted/50 relative overflow-hidden border">
                {/* Placeholder for hero image */}
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Activity className="h-24 w-24 opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Why Choose Us</h2>
            <p className="text-muted-foreground max-w-[800px] mx-auto md:text-xl">
              We combine medical expertise with advanced technology to deliver the best possible care.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Expert Specialists</h3>
                <p className="text-muted-foreground">A team of highly qualified and experienced medical professionals.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <Activity className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Modern Technology</h3>
                <p className="text-muted-foreground">Equipped with the latest medical technology for accurate diagnosis.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">24/7 Service</h3>
                <p className="text-muted-foreground">Round-the-clock emergency services and patient care.</p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-none bg-muted/50">
              <CardContent className="pt-6">
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Trusted Care</h3>
                <p className="text-muted-foreground">Following the highest standards of safety and medical protocols.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Need Medical Assistance?</h2>
          <p className="max-w-[600px] mx-auto text-primary-foreground/80 md:text-xl">
            Our team is ready to help you with your healthcare needs. Book an appointment or contact us for emergency care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Contact Us Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
