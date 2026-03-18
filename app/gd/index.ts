import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, writeBatch,
  onSnapshot, type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase/firebaseClient'
import type { Service, ServiceBlock, ServiceData, UserRole } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const servicesCol = (orgId: string) =>
  collection(db, 'organizations', orgId, 'services')

const blocksCol = (orgId: string, serviceId: string) =>
  collection(db, 'organizations', orgId, 'services', serviceId, 'blocks')

// ─── Services ────────────────────────────────────────────────────────────────

export async function getServices(orgId: string): Promise<Service[]> {
  const q = query(servicesCol(orgId), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service))
}

export async function getService(orgId: string, serviceId: string): Promise<Service | null> {
  const snap = await getDoc(doc(servicesCol(orgId), serviceId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Service
}

export async function createService(
  orgId: string,
  createdBy: string,
  data: ServiceData
): Promise<string> {
  const ref = await addDoc(servicesCol(orgId), {
    ...data,
    orgId,
    createdBy,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}


export async function updateService(
  orgId: string,
  serviceId: string,
  data: Partial<Service>
): Promise<void> {
  await updateDoc(doc(servicesCol(orgId), serviceId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteService(orgId: string, serviceId: string): Promise<void> {
  await deleteDoc(doc(servicesCol(orgId), serviceId))
}

// ─── Blocks ──────────────────────────────────────────────────────────────────

export async function getBlocks(orgId: string, serviceId: string): Promise<ServiceBlock[]> {
  const q = query(blocksCol(orgId, serviceId), orderBy('position', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceBlock))
}

export async function addBlock(
  orgId: string,
  serviceId: string,
  block: Omit<ServiceBlock, 'id'>
): Promise<string> {
  const ref = await addDoc(blocksCol(orgId, serviceId), {
    ...block,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBlock(
  orgId: string,
  serviceId: string,
  blockId: string,
  data: Partial<ServiceBlock>
): Promise<void> {
  await updateDoc(doc(blocksCol(orgId, serviceId), blockId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteBlock(
  orgId: string,
  serviceId: string,
  blockId: string
): Promise<void> {
  await deleteDoc(doc(blocksCol(orgId, serviceId), blockId))
}

/** Schreibt alle Positionen auf einmal (nach Drag & Drop) */
export async function reorderBlocks(
  orgId: string,
  serviceId: string,
  blocks: { id: string; position: number }[]
): Promise<void> {
  const batch = writeBatch(db)
  blocks.forEach(({ id, position }) => {
    batch.update(doc(blocksCol(orgId, serviceId), id), { position })
  })
  await batch.commit()
}

// ─── Organizations ─────────────────────────────────────────────────────────────

export type Org = {
  id: string
  userId: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const userOrgsCol = (userId: string) =>
  collection(db, 'users', userId, 'organizations')

export async function getUserOrgs(userId: string): Promise<Org[]> {
  const q = query(userOrgsCol(userId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Org))
}

export async function createOrg(
  userId: string,
  name: string
): Promise<string> {
  const ref = await addDoc(userOrgsCol(userId), {
    userId,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

/** Realtime-Listener für den Editor */
export function subscribeToBlocks(

  orgId: string,
  serviceId: string,
  onUpdate: (blocks: ServiceBlock[]) => void
): Unsubscribe {
  const q = query(blocksCol(orgId, serviceId), orderBy('position', 'asc'))
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceBlock)))
  })
}

// ─── Export helpers ───────────────────────────────────────────────────────────

/** Filtert Blöcke nach Rolle – für den rollenbasierten Export */
export function filterBlocksByRole(blocks: ServiceBlock[], role: UserRole): ServiceBlock[] {
  return blocks.filter(b => b.visibleRoles.includes(role))
}
