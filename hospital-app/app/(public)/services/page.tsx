import { HeartPulse, Stethoscope, Microscope, Pill, Phone, Calendar, ArrowRight, ShieldCheck, Check } from 'lucide-react'
import Link from 'next/link'
import { getSystemSettings } from '@/app/actions/admin'

export default async function ServicesPage() {
  const res = await getSystemSettings()
  
  const emergencyImg = typeof res.settings?.service_emergency === 'string' ? res.settings.service_emergency : null
  const opdImg = typeof res.settings?.service_opd === 'string' ? res.settings.service_opd : null
  const diagnosticsImg = typeof res.settings?.service_diagnostics === 'string' ? res.settings.service_diagnostics : null
  const pharmacyImg = typeof res.settings?.service_pharmacy === 'string' ? res.settings.service_pharmacy : null
  return (
    <div className="container py-20 px-4 md:px-6 space-y-20">
      {/* Header Section */}
      <div className="text-center mb-12 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Our Medical Services</h1>
        <p className="text-xl text-muted-foreground">
          MediCare Plus offers a comprehensive range of clinical services backed by expert medical professionals and state-of-the-art diagnostic tools.
        </p>
      </div>

      {/* Services Grid / Sections */}
      <div className="space-y-24">
        {/* 1. Emergency Care */}
        <section id="emergency" className="scroll-mt-20 grid lg:grid-cols-2 gap-12 items-center border-b pb-16 last:border-0 last:pb-0">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400">
              <HeartPulse className="h-4 w-4" /> 24/7 Lifesaving Support
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Emergency Care & Trauma Center</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our level-1 trauma and emergency center is staffed 24/7 by board-certified emergency physicians, trauma surgeons, and specialized nurses. We are fully equipped to handle critical situations, cardiac events, and acute injuries instantly.
            </p>
            <ul className="space-y-3">
              {[
                "24/7 Cardiac Care & Stroke Intervention",
                "Advanced Trauma Suites & Triage",
                "On-site Rapid Response Ambulance Fleet",
                "Pediatric Emergency Care Unit"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <span className="p-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:+15559110000" className="inline-flex items-center justify-center rounded-md bg-red-600 text-white font-medium px-6 py-3 hover:bg-red-700 transition-colors shadow-md gap-2">
                <Phone className="h-4 w-4" /> Call Emergency: +1 (555) 911-0000
              </a>
            </div>
          </div>
          
          {emergencyImg ? (
            <div className="aspect-video lg:aspect-square rounded-2xl overflow-hidden border relative">
              <img src={emergencyImg} alt="Emergency Care & Trauma Center" className="w-full h-full object-cover animate-in fade-in-50 duration-500" />
            </div>
          ) : (
            <div className="aspect-video lg:aspect-square bg-muted rounded-2xl overflow-hidden border relative flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/10 dark:to-red-950/20">
              <HeartPulse className="h-32 w-32 text-red-500/20 animate-pulse" />
            </div>
          )}
        </section>

        {/* 2. Outpatient Department (OPD) */}
        <section id="opd" className="scroll-mt-20 grid lg:grid-cols-2 gap-12 items-center border-b pb-16 last:border-0 last:pb-0">
          <div className="lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400">
              <Stethoscope className="h-4 w-4" /> Specialized Consultations
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Outpatient Department (OPD)</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our Outpatient Department (OPD) provides specialized consultation across more than 20 medical disciplines. Designed for comfort and efficiency, patients can easily meet with specialists, receive personalized treatment plans, and schedule follow-up care.
            </p>
            <ul className="space-y-3">
              {[
                "Consultations with Top Specialists",
                "Preventative Health Checkups & Screening",
                "Chronic Disease Management (Diabetes, Hypertension)",
                "Immunizations & General Wellness Visits"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <span className="p-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book" className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium px-6 py-3 hover:opacity-90 transition-opacity shadow-md gap-2">
                <Calendar className="h-4 w-4" /> Book OPD Appointment <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {opdImg ? (
            <div className="lg:order-1 aspect-video lg:aspect-square rounded-2xl overflow-hidden border relative">
              <img src={opdImg} alt="Outpatient Department (OPD)" className="w-full h-full object-cover animate-in fade-in-50 duration-500" />
            </div>
          ) : (
            <div className="lg:order-1 aspect-video lg:aspect-square bg-muted rounded-2xl overflow-hidden border relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/10 dark:to-blue-950/20">
              <Stethoscope className="h-32 w-32 text-blue-500/20" />
            </div>
          )}
        </section>

        {/* 3. Diagnostics */}
        <section id="diagnostics" className="scroll-mt-20 grid lg:grid-cols-2 gap-12 items-center border-b pb-16 last:border-0 last:pb-0">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400">
              <Microscope className="h-4 w-4" /> Precision Laboratory & Imaging
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Advanced Diagnostics & Pathology</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Accurate diagnostics are the foundation of effective treatments. Our diagnostic center features cutting-edge pathology labs and advanced radiology imaging equipment (MRI, CT, Ultrasound, Digital X-Ray) to deliver quick and precise reports.
            </p>
            <ul className="space-y-3">
              {[
                "High-field MRI & Multislice CT Scans",
                "Fully Automated Pathology & Biochemistry Labs",
                "Non-invasive Cardiology (ECG, Echo, TMT)",
                "Digital Mammography & Bone Densitometry"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <span className="p-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent font-medium px-6 py-3 transition-colors shadow-sm gap-2">
                Inquire About Test Schedules
              </Link>
            </div>
          </div>
          
          {diagnosticsImg ? (
            <div className="aspect-video lg:aspect-square rounded-2xl overflow-hidden border relative">
              <img src={diagnosticsImg} alt="Advanced Diagnostics & Pathology" className="w-full h-full object-cover animate-in fade-in-50 duration-500" />
            </div>
          ) : (
            <div className="aspect-video lg:aspect-square bg-muted rounded-2xl overflow-hidden border relative flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/10 dark:to-indigo-950/20">
              <Microscope className="h-32 w-32 text-indigo-500/20" />
            </div>
          )}
        </section>

        {/* 4. Pharmacy */}
        <section id="pharmacy" className="scroll-mt-20 grid lg:grid-cols-2 gap-12 items-center border-b pb-16 last:border-0 last:pb-0">
          <div className="lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
              <Pill className="h-4 w-4" /> 24/7 Certified Medicine Dispensing
            </div>
            <h2 className="text-3xl font-bold tracking-tight">24/7 In-House Pharmacy</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our fully stocked, certified in-house pharmacy ensures that you have access to authentic medications, critical life-support drugs, and medical supplies day or night. We maintain strict temperature controls and safety standards for all items.
            </p>
            <ul className="space-y-3">
              {[
                "24/7 Availability of Essential Medications",
                "Authentic & Barcoded Supplies with Date Checking",
                "Qualified Pharmacists for Guidance & Consultation",
                "Prescription Verification & Fast Billing"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                  <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg font-medium border border-dashed border-muted-foreground/30">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Fully Accredited Pharmacy
              </span>
            </div>
          </div>
          
          {pharmacyImg ? (
            <div className="lg:order-1 aspect-video lg:aspect-square rounded-2xl overflow-hidden border relative">
              <img src={pharmacyImg} alt="24/7 In-House Pharmacy" className="w-full h-full object-cover animate-in fade-in-50 duration-500" />
            </div>
          ) : (
            <div className="lg:order-1 aspect-video lg:aspect-square bg-muted rounded-2xl overflow-hidden border relative flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/10 dark:to-emerald-950/20">
              <Pill className="h-32 w-32 text-emerald-500/20" />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
