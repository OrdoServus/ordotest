'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '../../../AuthContext'
import { useEffect, useState } from 'react'
import { ServiceEditor } from '../../ServiceEditor'
import type { Service } from '../../../types'
import { getService } from '../../index'

export default function ServiceEditorPage() {
  const params = useParams()
  const orgId = Array.isArray(params?.orgId) ? params.orgId[0] : params?.orgId
  const serviceId = Array.isArray(params?.serviceId) ? params.serviceId[0] : params?.serviceId

  const { user } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!orgId || !serviceId) {
      setError('Ungültige URL.')
      setLoading(false)
      return
    }

    if (!user) {
      setError('Bitte melde dich an, um den Gottesdienst zu bearbeiten.')
      setLoading(false)
      return
    }

    setError(null)
    setLoading(true)

    const load = async () => {
      try {
        const s = await getService(orgId, serviceId)
        if (!cancelled) setService(s)
      } catch {
        if (!cancelled) {
          setError('Ein Fehler ist beim Laden des Gottesdienstes aufgetreten.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [orgId, serviceId, user])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-gray-500">Gottesdienst wird geladen...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-red-500">Gottesdienst nicht gefunden</div>
      </div>
    )
  }

  const serviceDate = (() => {
    try {
      const date = new Date(service.date)
      return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('de-DE')
    } catch {
      return ''
    }
  })()

  return (
    <ServiceEditor
      orgId={orgId!}
      serviceId={serviceId!}
      serviceTitle={service.title || 'Neuer Gottesdienst'}
      serviceDate={serviceDate}
      serviceLocation={service.location || ''}
    />
  )
}

