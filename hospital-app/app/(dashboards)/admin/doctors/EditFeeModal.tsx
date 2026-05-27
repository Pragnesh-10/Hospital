'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { updateConsultationFee } from '@/app/actions/admin'
import { Pencil } from 'lucide-react'

export function EditFeeModal({
  doctorId,
  currentFee,
  doctorName,
}: {
  doctorId: string
  currentFee: number
  doctorName: string
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateConsultationFee(doctorId, formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Consultation fee updated!')
      setOpen(false)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="w-3 h-3 mr-1" />
        Edit Fee
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Edit Consultation Fee</DialogTitle>
          <DialogDescription>
            Update the consultation fee for <strong>{doctorName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="fee">Consultation Fee (₹)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
              <Input
                id="fee"
                name="fee"
                type="number"
                min={0}
                step={50}
                required
                defaultValue={currentFee}
                className="pl-7"
                placeholder="500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Fee'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
