'use client'

import { useState } from 'react'
import type { ServiceBlock, UserRole } from '../types'
import { BLOCK_DEFS, ROLE_LABELS, ROLE_COLORS } from './blockDefs'

const ROLES: UserRole[] = ['pfarrer', 'organist', 'sakristan', 'lektor', 'gemeinde']

const ROLE_ICONS: Record<UserRole, string> = {
  pfarrer:  '✝️',
  organist: '🎵',
  sakristan:'⛪',
  lektor:   '📖',
  gemeinde: '👥',
}

const ROLE_DESC: Record<UserRole, string> = {
  pfarrer:  'Vollständig + Notizen',
  organist: 'Lieder, Tonart, Strophen',
  sakristan:'Rituale, Materialien',
  lektor:   'Lesungen, Texte',
  gemeinde: 'Öffentliches Programm',
}

function getBlockSummary(block: ServiceBlock, role: UserRole): string {
  const d = block.data
  if (block.type === 'lied') {
    if (role === 'organist') return `Nr. ${d.nummer ?? '?'} · ${d.tonart ?? '?'}`
    return d.strophen ? `Str. ${d.strophen}` : ''
  }
  if (block.type === 'lesung') return d.lektor ?? ''
  if (block.type === 'predigt') return d.dauer ? `${d.dauer} Min.` : ''
  if (block.type === 'ritual' && role === 'sakristan') return d.material?.slice(0, 30) ?? ''
  return ''
}

function getBlockTitle(block: ServiceBlock): string {
  const d = block.data
  if (block.type === 'lied' && d.titel) return d.titel
  if (block.type === 'lesung' && d.stelle) return d.stelle
  if (block.type === 'predigt' && d.thema) return d.thema
  if (block.type === 'gebet' && d.art) return d.art
  if (block.type === 'ritual' && d.ritualArt) return d.ritualArt
  if (block.type === 'text' && d.inhalt) return d.inhalt.slice(0, 32) + '…'
  const def = BLOCK_DEFS[block.type]
  return def?.label ?? '–'
}

interface ExportPanelProps {
  blocks: ServiceBlock[]
  serviceTitle: string
  serviceDate: string
}

export function ExportPanel({ blocks, serviceTitle, serviceDate }: ExportPanelProps) {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null)

  const filtered = activeRole
    ? blocks.filter(b => b.visibleRoles.includes(activeRole))
    : []

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col gap-3">
      <p className="text-[11px] font-medium text-stone-400 uppercase tracking-widest">
        Export
      </p>

      {ROLES.map(role => {
        const colors = ROLE_COLORS[role]
        const isActive = activeRole === role
        return (
          <button
            key={role}
            onClick={() => setActiveRole(isActive ? null : role)}
            className={[
              'flex flex-col gap-0.5 px-3 py-2.5 rounded-xl border text-left transition-all',
              isActive ? 'border-current' : 'border-stone-200 bg-white hover:border-stone-300',
            ].join(' ')}
            style={isActive ? { background: colors.bg, borderColor: colors.text } : undefined}
          >
            <span className="text-sm font-medium" style={isActive ? { color: colors.text } : { color: '#44403c' }}>
              {ROLE_ICONS[role]} {ROLE_LABELS[role]}
            </span>
            <span className="text-[11px]" style={isActive ? { color: colors.text, opacity: 0.7 } : { color: '#a8a29e' }}>
              {ROLE_DESC[role]}
            </span>
          </button>
        )
      })}

      {/* Preview */}
      {activeRole && (
        <div className="mt-1 border border-stone-200 rounded-xl overflow-hidden bg-white">
          <div className="px-3 py-2 border-b border-stone-100">
            <p className="text-xs font-medium text-stone-700">{serviceTitle}</p>
            <p className="text-[11px] text-stone-400">{serviceDate} · {ROLE_LABELS[activeRole]}</p>
          </div>
          <div className="divide-y divide-stone-100">
            {filtered.length === 0 && (
              <p className="text-xs text-stone-400 px-3 py-3">Keine Elemente für diese Rolle.</p>
            )}
            {filtered.map(block => {
              const def = BLOCK_DEFS[block.type]
              const summary = getBlockSummary(block, activeRole)
              return (
                <div key={block.id} className="flex items-center gap-2 px-3 py-2">
                  <span className="text-sm flex-shrink-0">{def.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-stone-700 truncate">{getBlockTitle(block)}</p>
                    {summary && <p className="text-[11px] text-stone-400">{summary}</p>}
                  </div>
                </div>
              )
            })}
          </div>
          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-stone-100">
              <button className="w-full text-xs text-center text-stone-500 hover:text-stone-800 py-1 rounded-lg hover:bg-stone-50 transition-colors">
                PDF exportieren →
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}
