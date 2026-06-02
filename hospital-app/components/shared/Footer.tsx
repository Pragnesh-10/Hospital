import Link from 'next/link'
import { Activity, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">MediCare Plus</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Providing world-class healthcare services with a focus on compassion, innovation, and excellence.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
            <li><Link href="/doctors" className="text-sm text-muted-foreground hover:text-primary">Our Doctors</Link></li>
            <li><Link href="/facilities" className="text-sm text-muted-foreground hover:text-primary">Facilities</Link></li>
            <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Services</h3>
          <ul className="space-y-2">
            <li><Link href="/services#emergency" className="text-sm text-muted-foreground hover:text-primary">Emergency Care</Link></li>
            <li><Link href="/services#opd" className="text-sm text-muted-foreground hover:text-primary">Outpatient Department</Link></li>
            <li><Link href="/services#diagnostics" className="text-sm text-muted-foreground hover:text-primary">Diagnostics</Link></li>
            <li><Link href="/services#pharmacy" className="text-sm text-muted-foreground hover:text-primary">Pharmacy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">123 Health Avenue, Medical District, City 10001</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">contact@medicareplus.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MediCare Plus Hospital. All rights reserved. Maintained and operated by Scalyx</p>
      </div>
    </footer>
  )
}
