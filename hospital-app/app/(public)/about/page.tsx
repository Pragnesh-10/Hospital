export default function AboutPage() {
  return (
    <div className="container py-20 px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">About MediCare Plus</h1>
          <p className="text-xl text-muted-foreground">
            A legacy of excellence in healthcare, committed to saving lives and improving well-being.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To provide compassionate, accessible, high quality, cost effective healthcare to the community.
            We strive to promote health, prevent disease, and deliver the best possible care to every patient, every time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To be the healthcare provider of choice for our community, recognized for our commitment to clinical excellence, patient safety, and compassionate care.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Licenses & Certifications</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">ISO 9001:2015</h3>
              <p className="text-sm text-muted-foreground">Quality Management System</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">NABH Accredited</h3>
              <p className="text-sm text-muted-foreground">National Accreditation Board for Hospitals</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold">JCI Accreditation</h3>
              <p className="text-sm text-muted-foreground">Joint Commission International</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
