import { Card, CardContent } from '@/components/ui/card'
import * as Icons from 'lucide-react'
import { createStaticClient } from '@/lib/supabase/static'

// Fallback mock data in case the database isn't initialized yet
// Opt-in to ISR: Revalidate the data every 1 hour (3600 seconds)
export const revalidate = 3600

const MOCK_FACILITIES = [
  {
    id: '1',
    title: 'Modern ICU',
    description: 'State-of-the-art Intensive Care Unit equipped with the latest life-support systems.',
    icon_name: 'Activity'
  },
  {
    id: '2',
    title: 'Advanced Laboratory',
    description: 'Fully automated pathology and diagnostic lab with rapid reporting capabilities.',
    icon_name: 'Beaker'
  },
  {
    id: '3',
    title: '24/7 Pharmacy',
    description: 'Round-the-clock pharmacy service stocking all essential and specialized medications.',
    icon_name: 'Cross'
  },
  {
    id: '4',
    title: 'Cardiology Center',
    description: 'Dedicated center for heart health with modern ECG, Echo, and TMT facilities.',
    icon_name: 'HeartPulse'
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
          // @ts-ignore
          const Icon = Icons[facility.icon_name || 'Activity'] || Icons.Activity

          return (
            <Card key={facility.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-muted/30">
              <CardContent className="p-8">
                <div className="p-3 bg-primary/10 w-fit rounded-xl mb-6">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{facility.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {facility.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
