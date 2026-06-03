import { Card, CardContent } from '@/components/ui/card'
import * as Icons from 'lucide-react'
import { createStaticClient } from '@/lib/supabase/static'
import { ComponentType } from 'react'

// Fallback mock data in case the database isn't initialized yet
export const dynamic = 'force-dynamic'

const MOCK_FACILITIES = [
  {
    id: '1',
    title: 'Modern ICU',
    description: 'State-of-the-art Intensive Care Unit equipped with the latest life-support systems.',
    icon_name: 'Activity',
    image_url: null
  },
  {
    id: '2',
    title: 'Advanced Laboratory',
    description: 'Fully automated pathology and diagnostic lab with rapid reporting capabilities.',
    icon_name: 'Beaker',
    image_url: null
  },
  {
    id: '3',
    title: '24/7 Pharmacy',
    description: 'Round-the-clock pharmacy service stocking all essential and specialized medications.',
    icon_name: 'Cross',
    image_url: null
  },
  {
    id: '4',
    title: 'Cardiology Center',
    description: 'Dedicated center for heart health with modern ECG, Echo, and TMT facilities.',
    icon_name: 'HeartPulse',
    image_url: null
  }
]

export default async function FacilitiesPage() {
  const supabase = createStaticClient()
  
  // Try to fetch facilities from the database
  const { data: dbFacilities, error } = await supabase
    .from('facilities')
    .select('*')
    .order('created_at', { ascending: true })

  // Use DB data if available and not empty, otherwise use mock data
  const facilities = !error && dbFacilities && dbFacilities.length > 0 
    ? dbFacilities 
    : MOCK_FACILITIES

  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Our Facilities</h1>
        <p className="text-xl text-muted-foreground max-w-[800px] mx-auto">
          We are equipped with world-class medical infrastructure to provide you with the best care possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {facilities.map((facility) => {
          // Dynamically resolve the icon from lucide-react
          const iconName = (facility.icon_name || 'Activity') as keyof typeof Icons
          const Icon = (Icons[iconName] || Icons.Activity) as ComponentType<{ className?: string }>
          const hasImage = !!facility.image_url

          return (
            <Card key={facility.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 bg-muted/30 group flex flex-col">
              {hasImage ? (
                <div className="relative aspect-video w-full overflow-hidden bg-muted border-b">
                  <img 
                    src={facility.image_url!} 
                    alt={facility.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 p-2.5 bg-background/90 backdrop-blur-sm rounded-xl shadow-md border">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              ) : (
                <div className="p-8 pb-0">
                  <div className="p-3 bg-primary/10 w-fit rounded-xl">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              )}
              <CardContent className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-3">{facility.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {facility.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
