'use client'

import { useRef, useState } from 'react'
import type { BlockType, UserRole } from '../types'
import { useEditor } from './useEditor'
import { BlockCard } from './BlockCard'
import { BlockPalette } from './BlockPalette'
import { ExportPanel } from './ExportPanel'

interface ServiceEditorProps {
  orgId: string
  serviceId: string
  serviceTitle: string
  serviceDate: string
  serviceLocation?: string
}

export function ServiceEditor({
  orgId, serviceId,
  serviceTitle, serviceDate, serviceLocation,
}: ServiceEditorProps) {
  const {
    blocks, loading, saving,
    addNewBlock, updateBlockData,
    toggleRole, removeBlock, reorder,
  } = useEditor({ orgId, serviceId })

  const dragFromIndex = useRef<number | null>(null)
  const dragToIndex = useRef<number | null>(null)
  const [isDragOverZone, setIsDragOverZone] = useState(false)

  const handleDrop = () => {
    if (dragFromIndex.current !== null && dragToIndex.current !== null) {
      reorder(dragFromIndex.current, dragToIndex.current)
    }
    dragFromIndex.current = null
    dragToIndex.current = null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
        Gottesdienst wird geladen…
      </div>
    )
  }

  return (
    <div className="flex gap-6 min-h-[calc(100vh-120px)]">

      {/* Left: Block palette */}
      <BlockPalette onAdd={(type) => addNewBlock(type)} />

      {/* Center: Editor */}
      <main className="flex-1 flex flex-col gap-3 min-w-0">

        {/* Service header */}
        <div className="bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-stone-900">{serviceTitle}</h1>
            <p className="text-sm text-stone-400 mt-0.5">
              {serviceDate}{serviceLocation ? ` · ${serviceLocation}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-stone-400">Speichert…</span>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              Entwurf
            </span>
            <button className="text-sm px-4 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-700 transition-colors">
              Veröffentlichen
            </button>
          </div>
        </div>

        {/* Block list */}
        <div className="flex flex-col gap-2">
          {blocks.map((block, index) => (
            <BlockCard
              key={block.id}
              block={block}
              index={index}
              totalBlocks={blocks.length}
              onUpdate={(id, data) => updateBlockData(id, data)}
              onToggleRole={(id, role) => toggleRole(id, role as UserRole)}
              onRemove={removeBlock}
              onMoveUp={(i) => reorder(i, i - 1)}
              onMoveDown={(i) => reorder(i, i + 1)}
              onDragStart={(i) => { dragFromIndex.current = i }}
              onDragOver={(i) => { dragToIndex.current = i }}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Drop zone / Add button */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOverZone(true) }}
          onDragLeave={() => setIsDragOverZone(false)}
          onDrop={() => { setIsDragOverZone(false) }}
          className={[
            'border-2 border-dashed rounded-xl px-4 py-5 text-center text-sm transition-colors',
            isDragOverZone
              ? 'border-stone-400 bg-stone-50'
              : 'border-stone-200 text-stone-400 hover:border-stone-300',
          ].join(' ')}
        >
          {blocks.length === 0
            ? 'Klicke links auf einen Blocktyp um zu beginnen'
            : 'Block hierher ziehen oder links auswählen'
          }
        </div>

        {/* Block count */}
        {blocks.length > 0 && (
          <p className="text-xs text-stone-400 text-center">
            {blocks.length} {blocks.length === 1 ? 'Block' : 'Blöcke'}
          </p>
        )}
      </main>

      {/* Right: Export panel */}
      <ExportPanel
        blocks={blocks}
        serviceTitle={serviceTitle}
        serviceDate={serviceDate}
      />
    </div>
  )
}
