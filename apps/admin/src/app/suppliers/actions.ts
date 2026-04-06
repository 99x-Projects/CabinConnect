'use server';
import { revalidatePath } from 'next/cache';
import { updateSupplierStatus } from '../../lib/api';

export async function approveSupplier(id: string) {
  await updateSupplierStatus(id, 'approved');
  revalidatePath('/suppliers');
}

export async function rejectSupplier(id: string) {
  await updateSupplierStatus(id, 'rejected');
  revalidatePath('/suppliers');
}
