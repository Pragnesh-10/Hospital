'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Mail, MailOpen, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { markMessageAsRead } from '@/app/actions/contact'
import { toast } from 'sonner'

interface Message {
  id: string
  first_name: string
  last_name: string
  email: string
  message: string
  is_read: boolean
  created_at: string
}

interface AdminMessagesListProps {
  initialMessages: Message[]
}

export function AdminMessagesList({ initialMessages }: AdminMessagesListProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setUpdatingId(id)
    try {
      const res = await markMessageAsRead(id)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Message marked as read")
        router.refresh()
      }
    } catch (err) {
      toast.error("An error occurred")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
            <tr>
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3">Sender</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message Preview</th>
              <th className="px-4 py-3">Received At</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {initialMessages.length > 0 ? (
              initialMessages.map((msg) => {
                const isExpanded = expandedId === msg.id
                const senderName = `${msg.first_name} ${msg.last_name}`
                const isUpdating = updatingId === msg.id

                return (
                  <optgroup label={senderName} key={msg.id} className="p-0 m-0 border-0">
                    <tr 
                      className={`hover:bg-muted/30 transition-colors cursor-pointer ${
                        !msg.is_read ? 'font-semibold bg-primary/5' : ''
                      }`}
                      onClick={() => toggleExpand(msg.id)}
                    >
                      <td className="px-4 py-3 align-middle">
                        {!msg.is_read ? (
                          <Mail className="h-4 w-4 text-primary" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">{senderName}</td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">{msg.email}</td>
                      <td className="px-4 py-3 align-middle max-w-xs truncate">
                        {msg.message}
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground text-xs">
                        {format(new Date(msg.created_at), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="px-4 py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!msg.is_read && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={(e) => handleMarkAsRead(msg.id, e)}
                              disabled={isUpdating}
                            >
                              <Check className="h-3 h-3 mr-1 text-green-600" /> Mark as Read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => toggleExpand(msg.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-muted/10">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-2 border-l-2 border-primary pl-4 py-1">
                            <p className="text-sm font-semibold">Message from {senderName} ({msg.email})</p>
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-normal">
                              {msg.message}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </optgroup>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground italic">
                  No inquiries received yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
