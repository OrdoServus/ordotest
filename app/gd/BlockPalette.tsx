'use client'

import type { BlockType } from '../types'
import { BLOCK_TYPES } from './blockDefs'

interface BlockPaletteProps {
  onAdd: (type: BlockType) => void
}

export function BlockPalette({ onAdd }: BlockPaletteProps) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col gap-2">
      <p className="text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-1">
        Liturgieblöcke
      </p>
      {BLOCK_TYPES.map(def => (
        <button
          key={def.type}
          onClick={() => onAdd(def.type as BlockType)}
          draggable
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 transition-all text-left group"
        >
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: def.color }}
          >
            {def.icon}
          </span>
          <span className="text-sm text-stone-600 group-hover:text-stone-900">{def.label}</span>
        </button>
      ))}

      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-[11px] font-medium text-stone-400 uppercase tracking-widest mb-2">
          Vorlagen
        </p>
        {['Sonntagsgottesdienst', 'Taufe', 'Beerdigung', 'Hochzeit'].map(name => (
          <button
            key={name}
            className="w-full text-left text-xs text-stone-500 hover:text-stone-800 py-1.5 px-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            {name}
          </button>
        ))}
      </div>
    </aside>
  )
}
