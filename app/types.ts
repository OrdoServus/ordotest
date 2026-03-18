export interface ServiceBlock {
  id: string
  type: BlockType
  position: number
  data: Record<string, any>
  visibleRoles: UserRole[]
  createdAt?: any
  updatedAt?: any
}

export interface ServiceData {
  title: string
  date: string
  location?: string
}

export interface Service extends ServiceData {
  id: string
  orgId: string
  createdBy: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
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
