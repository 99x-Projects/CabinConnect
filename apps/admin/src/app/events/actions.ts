'use server';
import { revalidatePath } from 'next/cache';
import { updateEventStatus } from '../../lib/api';

export async function publishEvent(id: string) {
  await updateEventStatus(id, 'published');
  revalidatePath('/events');
}

export async function cancelEvent(id: string) {
  await updateEventStatus(id, 'cancelled');
  revalidatePath('/events');
}
