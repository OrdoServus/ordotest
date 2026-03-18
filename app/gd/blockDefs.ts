import type { BlockDef, BlockType, UserRole } from '../types'

export const BLOCK_DEFS: Record<BlockType, BlockDef> = {
  lied: {
    type: 'lied',
    label: 'Lied',
    icon: '🎵',
    color: '#EAF3DE',
    textColor: '#3B6D11',
    defaultRoles: ['pfarrer', 'organist', 'gemeinde'],
    fields: [
      { key: 'titel',    label: 'Liedtitel',           type: 'text',     placeholder: 'z.B. Ein feste Burg' },
      { key: 'nummer',   label: 'Liederbuch Nr.',       type: 'text',     placeholder: 'z.B. 362' },
      { key: 'strophen', label: 'Strophen',             type: 'text',     placeholder: 'z.B. 1, 3, 4' },
      { key: 'tonart',   label: 'Tonart (für Organist)',type: 'text',     placeholder: 'z.B. D-Dur', roleOnly: 'organist' },
    ],
  },
  lesung: {
    type: 'lesung',
    label: 'Lesung',
    icon: '📖',
    color: '#E6F1FB',
    textColor: '#185FA5',
    defaultRoles: ['pfarrer', 'lektor', 'gemeinde'],
    fields: [
      { key: 'stelle',  label: 'Bibelstelle', type: 'text',     placeholder: 'z.B. Johannes 4,5–42' },
      { key: 'lektor',  label: 'Lektor/in',   type: 'text',     placeholder: 'Name' },
      { key: 'notiz',   label: 'Notiz',       type: 'textarea', placeholder: 'Kontext, Hinweise...' },
    ],
  },
  predigt: {
    type: 'predigt',
    label: 'Predigt',
    icon: '✝️',
    color: '#FAEEDA',
    textColor: '#854F0B',
    defaultRoles: ['pfarrer'],
    fields: [
      { key: 'thema',   label: 'Thema',          type: 'text',     placeholder: 'Predigtthema' },
      { key: 'dauer',   label: 'Dauer (Min.)',    type: 'text',     placeholder: 'z.B. 15' },
      { key: 'skizze',  label: 'Predigtskizze',  type: 'textarea', placeholder: 'Nur für dich sichtbar...', roleOnly: 'pfarrer' },
    ],
  },
  gebet: {
    type: 'gebet',
    label: 'Gebet / Fürbitte',
    icon: '🙏',
    color: '#EEEDFE',
    textColor: '#534AB7',
    defaultRoles: ['pfarrer', 'gemeinde'],
    fields: [
      { key: 'art',       label: 'Art',  type: 'select', options: ['Vaterunser', 'Fürbitte', 'Kollektengebet', 'Dankgebet', 'Segen', 'Anderes'] },
      { key: 'gebetText', label: 'Text', type: 'textarea', placeholder: 'Gebetstext...' },
    ],
  },
  ritual: {
    type: 'ritual',
    label: 'Ritual',
    icon: '🕯️',
    color: '#FAECE7',
    textColor: '#993C1D',
    defaultRoles: ['pfarrer', 'sakristan'],
    fields: [
      { key: 'ritualArt', label: 'Art',        type: 'select', options: ['Abendmahl', 'Taufe', 'Kollekte', 'Kerze', 'Beichte', 'Anderes'] },
      { key: 'material',  label: 'Materialien (für Sakristan)', type: 'textarea', placeholder: 'Was wird benötigt?', roleOnly: 'sakristan' },
    ],
  },
  text: {
    type: 'text',
    label: 'Freier Text',
    icon: '📝',
    color: '#F1EFE8',
    textColor: '#5F5E5A',
    defaultRoles: ['pfarrer', 'gemeinde'],
    fields: [
      { key: 'inhalt', label: 'Inhalt', type: 'textarea', placeholder: 'Ankündigung, Moderationstext...' },
    ],
  },
}

export const BLOCK_TYPES = Object.values(BLOCK_DEFS) as BlockDef[]

export const ROLE_LABELS: Record<UserRole, string> = {
  pfarrer:  'Pfarrer',
  organist: 'Organist',
  sakristan:'Sakristan',
  lektor:   'Lektor',
  gemeinde: 'Gemeinde',
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  pfarrer:  { bg: '#FAEEDA', text: '#854F0B' },
  organist: { bg: '#EAF3DE', text: '#3B6D11' },
  sakristan:{ bg: '#E6F1FB', text: '#185FA5' },
  lektor:   { bg: '#EEEDFE', text: '#534AB7' },
  gemeinde: { bg: '#F1EFE8', text: '#5F5E5A' },
}
