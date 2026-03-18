import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from '@phosphor-icons/react'

interface PatientFormDialogProps {
  onSubmit: (patientData: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    dateOfBirth: string
  }) => Promise<void>
  initialPhoneNumber?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function PatientFormDialog({ onSubmit, initialPhoneNumber = '', open: controlledOpen, onOpenChange }: PatientFormDialogProps) {
  const [open, setOpen] = useState(controlledOpen ?? false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: initialPhoneNumber,
    dateOfBirth: ''
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, phoneNumber: initialPhoneNumber }))
  }, [initialPhoneNumber])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        dateOfBirth: ''
      })
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {controlledOpen === undefined && (
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus size={20} />
          Add Patient
        </Button>
      )}
      <Dialog open={controlledOpen !== undefined ? controlledOpen : open} onOpenChange={onOpenChange ?? setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>
              Enter patient information to create a new record
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} id="patient-form">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>
          </form>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="patient-form" disabled={loading}>
              {loading ? 'Registering...' : 'Register Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
