'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ServiceBlock, BlockType, UserRole, BlockData } from '../types'

import { BLOCK_DEFS } from './blockDefs'
import {
  subscribeToBlocks,
  addBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
} from './index'


interface UseEditorOptions {
  orgId: string
  serviceId: string
}

export function useEditor({ orgId, serviceId }: UseEditorOptions) {
  const [blocks, setBlocks] = useState<ServiceBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Realtime listener
  useEffect(() => {
    const unsub = subscribeToBlocks(orgId, serviceId, (updated) => {
      setBlocks(updated)
      setLoading(false)
    })
    return unsub
  }, [orgId, serviceId])

  // Block hinzufügen
  const addNewBlock = useCallback(async (type: BlockType, atIndex?: number) => {
    const def = BLOCK_DEFS[type]
    const position = atIndex !== undefined ? atIndex : blocks.length
    setSaving(true)
    try {
      await addBlock(orgId, serviceId, {
        type,
        position,
        data: {},
        visibleRoles: def.defaultRoles as UserRole[],
      })
      // Positionen der folgenden Blöcke anpassen
      if (atIndex !== undefined) {
        const toUpdate = blocks
          .filter(b => b.position >= atIndex)
          .map(b => ({ id: b.id, position: b.position + 1 }))
        if (toUpdate.length > 0) await reorderBlocks(orgId, serviceId, toUpdate)
      }
    } finally {
      setSaving(false)
    }
  }, [blocks, orgId, serviceId])

  // Block-Daten updaten (debounced in der Komponente)
  const updateBlockData = useCallback(async (blockId: string, data: Partial<BlockData>) => {
    setBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, data: { ...b.data, ...data } } : b)
    )
    await updateBlock(orgId, serviceId, blockId, {
      data: { ...blocks.find(b => b.id === blockId)?.data, ...data },
    })
  }, [blocks, orgId, serviceId])

  // Rollen togglen
  const toggleRole = useCallback(async (blockId: string, role: UserRole) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return
    const hasRole = block.visibleRoles.includes(role)
    const newRoles = hasRole
      ? block.visibleRoles.filter(r => r !== role)
      : [...block.visibleRoles, role]
    setBlocks(prev =>
      prev.map(b => b.id === blockId ? { ...b, visibleRoles: newRoles } : b)
    )
    await updateBlock(orgId, serviceId, blockId, { visibleRoles: newRoles })
  }, [blocks, orgId, serviceId])

  // Block löschen
  const removeBlock = useCallback(async (blockId: string) => {
    setSaving(true)
    try {
      await deleteBlock(orgId, serviceId, blockId)
    } finally {
      setSaving(false)
    }
  }, [orgId, serviceId])

  // Reihenfolge nach Drag & Drop
  const reorder = useCallback(async (fromIndex: number, toIndex: number) => {
    const reordered = [...blocks]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    const withPositions = reordered.map((b, i) => ({ ...b, position: i }))
    setBlocks(withPositions) // optimistisches Update
    await reorderBlocks(orgId, serviceId, withPositions.map(b => ({ id: b.id, position: b.position })))
  }, [blocks, orgId, serviceId])

  return {
    blocks,
    loading,
    saving,
    addNewBlock,
    updateBlockData,
    toggleRole,
    removeBlock,
    reorder,
  }
}
