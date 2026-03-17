'use client'

import { useState, useRef, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react'
import type { ServiceBlock, UserRole } from '../types'
import { BLOCK_DEFS, ROLE_LABELS, ROLE_COLORS } from './blockDefs'

interface BlockCardProps {
  block: ServiceBlock
  index: number
  totalBlocks: number
  onUpdate: (blockId: string, data: Record<string, string>) => void
  onToggleRole: (blockId: string, role: UserRole) => void
  onRemove: (blockId: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  // Drag & Drop
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

export function BlockCard({
  block, index, totalBlocks,
  onUpdate, onToggleRole, onRemove,
  onMoveUp, onMoveDown,
  onDragStart, onDragOver, onDrop,
}: BlockCardProps) {
  const [expanded, setExpanded] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const def = BLOCK_DEFS[block.type]
  if (!def) return null

  const handleFieldChange = (key: string, value: string) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onUpdate(block.id, { [key]: value })
    }, 400)
  }

  const getBlockTitle = () => {
    const d = block.data
    if (block.type === 'lied' && d.titel) return d.titel
    if (block.type === 'lesung' && d.stelle) return d.stelle
    if (block.type === 'predigt' && d.thema) return d.thema
    if (block.type === 'gebet' && d.art) return d.art
    if (block.type === 'ritual' && d.ritualArt) return d.ritualArt
    if (block.type === 'text' && d.inhalt) return d.inhalt.slice(0, 40) + '…'
    return '–'
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver(index) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => { setIsDragOver(false); onDrop() }}
      className={[
        'rounded-xl border bg-white transition-all duration-150',
        isDragOver ? 'border-blue-400 border-dashed border-2' : 'border-stone-200',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}>
        {/* Drag handle */}
        <span className="text-stone-300 cursor-grab text-sm" onClick={e => e.stopPropagation()}>⠿</span>

        {/* Icon + Tag */}
        <span className="text-sm w-6 text-center">{def.icon}</span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: def.color, color: def.textColor }}
        >
          {def.label}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm text-stone-700 truncate">{getBlockTitle()}</span>

        {/* Actions */}
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-20 px-1"
            title="Nach oben"
          >↑</button>
          <button
            onClick={() => onMoveDown(index)}
            disabled={index === totalBlocks - 1}
            className="text-xs text-stone-400 hover:text-stone-700 disabled:opacity-20 px-1"
            title="Nach unten"
          >↓</button>
          <button
            onClick={() => onRemove(block.id)}
            className="text-xs text-stone-400 hover:text-red-500 px-1"
            title="Löschen"
          >✕</button>
          <span className="text-xs text-stone-400 px-1">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 flex flex-col gap-3">
          {/* Fields */}
          {def.fields.map((field: { key: string | number; label: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; type: string; placeholder: string | undefined; options: any[] }) => (
            <div key={String(field.key)} className="flex flex-col gap-1">
              <label className="text-xs text-stone-400">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  defaultValue={String(block.data[field.key] ?? '')}
                  onChange={e => handleFieldChange(String(field.key), e.target.value)}
                  placeholder={field.placeholder}
                  className="text-sm border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-stone-400 bg-stone-50"
                />
              ) : field.type === 'select' ? (
                <select
                  defaultValue={String(block.data[field.key] ?? '')}
                  onChange={e => handleFieldChange(String(field.key), e.target.value)}
                  className="text-sm border border-stone-200 rounded-lg px-3 py-2 bg-stone-50 focus:outline-none focus:border-stone-400"
                >
                  <option value="">– Auswählen –</option>
                  {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  defaultValue={String(block.data[field.key] ?? '')}
                  onChange={e => handleFieldChange(String(field.key), e.target.value)}
                  placeholder={field.placeholder}
                  className="text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:border-stone-400 bg-stone-50"
                />
              )}
            </div>
          ))}

          {/* Role visibility */}
          <div>
            <p className="text-xs text-stone-400 mb-1.5">Sichtbar für:</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ROLE_LABELS) as UserRole[]).map(role => {
                const active = block.visibleRoles.includes(role)
                const colors = ROLE_COLORS[role]
                return (
                  <button
                    key={role}
                    onClick={() => onToggleRole(block.id, role)}
                    className={[
                      'text-xs px-2.5 py-1 rounded-full border transition-all',
                      active ? 'border-current font-medium' : 'border-stone-200 opacity-40',
                    ].join(' ')}
                    style={active ? { background: colors.bg, color: colors.text } : undefined}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
