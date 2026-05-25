'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { uploadDoctorImage, uploadFacilityImage } from '@/app/actions/upload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Entity = {
  id: string
  title?: string
  profiles?: any
}

export function AdminUploadForm({ type, entities }: { type: 'doctor' | 'facility', entities: Entity[] }) {
  const [isUploading, setIsUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)

    const formData = new FormData(e.currentTarget)
    
    let result
    if (type === 'doctor') {
      result = await uploadDoctorImage(formData)
    } else {
      result = await uploadFacilityImage(formData)
    }

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Image uploaded successfully!")
      ;(e.target as HTMLFormElement).reset()
    }
    
    setIsUploading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Select {type === 'doctor' ? 'Doctor' : 'Facility'}</Label>
        <Select name={type === 'doctor' ? 'doctor_id' : 'facility_id'} required>
          <SelectTrigger>
            <SelectValue placeholder={`Select a ${type}`} />
          </SelectTrigger>
          <SelectContent>
            {entities.map((entity) => (
              <SelectItem key={entity.id} value={entity.id}>
                {type === 'doctor' 
                  ? `Dr. ${entity.profiles?.first_name} ${entity.profiles?.last_name}` 
                  : entity.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${type}-image`}>Choose Image</Label>
        <Input 
          id={`${type}-image`} 
          name="image" 
          type="file" 
          accept="image/*" 
          required 
          className="cursor-pointer"
        />
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </Button>
    </form>
  )
}
