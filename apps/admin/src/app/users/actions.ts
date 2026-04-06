'use server';
import { revalidatePath } from 'next/cache';
import { setUserRole } from '../../lib/api';

export async function changeUserRole(id: string, role: 'user' | 'supplier' | 'admin') {
  await setUserRole(id, role);
  revalidatePath('/users');
}
