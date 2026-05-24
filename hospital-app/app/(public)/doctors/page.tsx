import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DoctorsPage() {
  const supabase = await createClient()

  // Fetch doctors and join with profiles table to get names and avatars
  const { data: dbDoctors, error } = await supabase
    .from('doctors')
    .select('*, profiles(*)')
    .eq('is_active', true)

  const doctors = (!error && dbDoctors) ? dbDoctors : []

  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Our Doctors</h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          Meet our team of world-class specialists dedicated to your well-being.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {doctors.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No doctors are currently available. Please check back later.
          </div>
        )}
        
        {doctors.map((doctor: any) => {
          const fullName = doctor.profiles ? `Dr. ${doctor.profiles.first_name} ${doctor.profiles.last_name}` : 'Unknown Doctor';
          const avatarUrl = doctor.profiles?.avatar_url || '';

          return (
            <Card key={doctor.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="bg-muted aspect-square flex items-center justify-center p-6">
                  <Avatar className="w-32 h-32 border-4 border-background shadow-lg group-hover:scale-105 transition-transform">
                    <AvatarImage src={avatarUrl} alt={fullName} />
                    <AvatarFallback>{fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="p-6 text-center space-y-4 border-t">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">{fullName}</h3>
                    <Badge variant="secondary" className="mt-2 text-primary bg-primary/10 hover:bg-primary/20">
                      {doctor.specialization}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Experience: <span className="font-medium text-foreground">{doctor.experience_years} Years</span></p>
                    <p>Availability: <span className="font-medium text-foreground">{doctor.availability || 'Contact Hospital'}</span></p>
                  </div>

                  <Link href={`/book?doctor=${doctor.id}`} className={buttonVariants({ className: "w-full" })}>
                    Book Appointment
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
