export interface ServiceBlock {
  id: string
  type: string
  position: number
  data: Record<string, any>
  visibleRoles: UserRole[]
  createdAt?: any
  updatedAt?: any
}

export type BlockType = 'lied' | 'lesung' | 'predigt' | 'gebet' | 'ritual' | 'text'

export type UserRole = 'pfarrer' | 'organist' | 'sakristan' | 'lektor' | 'gemeinde'

export type BlockData = Record<string, any>

export interface BlockDef {
  type: BlockType
  label: string
  icon: string
  color: string
  textColor: string
  defaultRoles: UserRole[]
  fields: {
    key: string
    label: string
    type: 'text' | 'textarea' | 'select'
    placeholder?: string
    options?: string[]
    roleOnly?: UserRole
  }[]
}
