'use client'

import { useState, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFacility, updateFacility, deleteFacility } from '@/app/actions/admin_facilities'
import { toast } from 'sonner'
import * as Icons from 'lucide-react'
import Link from 'next/link'

interface Facility {
  id: string
  title: string
  description: string
  icon_name: string | null
  image_url: string | null
}

const AVAILABLE_ICONS = [
  'Activity',
  'HeartPulse',
  'Beaker',
  'Cross',
  'Stethoscope',
  'ShieldAlert',
  'BedDouble',
  'Brain',
  'Eye',
  'Baby',
  'Tablets',
  'Microscope',
]

export function AdminFacilitiesList({ initialFacilities }: { initialFacilities: Facility[] }) {
  const router = useRouter()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [iconName, setIconName] = useState('Activity')
  const [submitting, setSubmitting] = useState(false)

  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreateModal = () => {
    setEditingFacility(null)
    setTitle('')
    setDescription('')
    setIconName('Activity')
    setIsFormOpen(true)
  }

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility)
    setTitle(facility.title)
    setDescription(facility.description)
    setIconName(facility.icon_name || 'Activity')
    setIsFormOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !iconName) {
      toast.error("Please fill in all fields")
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('iconName', iconName)

    try {
      if (editingFacility) {
        const res = await updateFacility(editingFacility.id, formData)
        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Facility updated successfully")
          setIsFormOpen(false)
          router.refresh()
        }
      } else {
        const res = await createFacility(formData)
        if (res.error) {
          toast.error(res.error)
        } else {
          toast.success("Facility created successfully")
          setIsFormOpen(false)
          router.refresh()
        }
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await deleteFacility(deleteId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Facility deleted successfully")
        setDeleteId(null)
        router.refresh()
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <Button onClick={openCreateModal} className="shadow-sm">
          <Icons.Plus className="mr-2 h-4 w-4" /> Add New Facility
        </Button>
        <Link 
          href="/admin/upload" 
          className="inline-flex items-center text-sm text-primary hover:underline font-medium"
        >
          <Icons.Upload className="mr-1.5 h-4 w-4" /> Go to Image Upload Panel
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialFacilities.length > 0 ? (
          initialFacilities.map((facility) => {
            const iconName = (facility.icon_name || 'Activity') as keyof typeof Icons
            const Icon = (Icons[iconName] || Icons.Activity) as ComponentType<{ className?: string }>
            return (
              <Card key={facility.id} className="flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
                {facility.image_url ? (
                  <div className="relative aspect-video w-full bg-muted border-b overflow-hidden">
                    <img 
                      src={facility.image_url} 
                      alt={facility.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm rounded-lg border shadow-sm">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                ) : (
                  <div className="p-6 pb-2">
                    <div className="p-3 bg-primary/10 w-fit rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
                
                <CardHeader className="pt-4 flex-1">
                  <CardTitle className="text-xl font-bold">{facility.title}</CardTitle>
                  <CardDescription className="line-clamp-4 leading-relaxed mt-2 text-sm">
                    {facility.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-2 flex justify-end gap-2 border-t bg-muted/10 p-4 mt-auto">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(facility)}>
                    <Icons.Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10 border-destructive/20 hover:text-destructive" 
                    onClick={() => setDeleteId(facility.id)}
                  >
                    <Icons.Trash className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20 col-span-full">
            <Icons.Activity className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium">No facilities found</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Get started by creating the first facility listing.</p>
            <Button onClick={openCreateModal}>
              <Icons.Plus className="mr-2 h-4 w-4" /> Add New Facility
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingFacility ? 'Edit Facility' : 'Add New Facility'}</DialogTitle>
            <DialogDescription>
              {editingFacility ? 'Update details of this hospital facility.' : 'Create a new hospital facility directory listing.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Facility Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intensive Care Unit (ICU)"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="iconName">Icon</Label>
              <Select value={iconName} onValueChange={(val) => setIconName(val || 'Activity')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => {
                    const DisplayIcon = (Icons[icon as keyof typeof Icons] || Icons.Activity) as ComponentType<{ className?: string }>
                    return (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <DisplayIcon className="h-4 w-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe facilities, treatments offered, equipment, working slots etc." 
                rows={4}
                required 
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Facility</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this facility? This action cannot be undone and will remove it from the directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
