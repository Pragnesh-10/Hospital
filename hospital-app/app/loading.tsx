import { Activity } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <Activity className="h-12 w-12 text-primary animate-pulse" />
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin border-transparent" />
      </div>
      <p className="text-muted-foreground animate-pulse font-medium">Loading MediCare Plus...</p>
    </div>
  )
}
