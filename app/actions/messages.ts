'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ApiError, deleteMessage, setMessageRead } from '@/lib/api';

/** Called when a message is opened: mark it read and refresh the unread counters. */
export async function markMessageRead(id: string) {
  try {
    await setMessageRead(id, true);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error; // e.g. a redirect to /login
    return;
  }
  revalidatePath('/', 'layout');
}

/** "Mark as unread" goes back to the inbox (staying on the message would mark it read again). */
export async function markMessageUnread(id: string) {
  await setMessageRead(id, false);
  revalidatePath('/', 'layout');
  redirect('/messages?notice=unread');
}

export async function removeMessage(id: string) {
  try {
    await deleteMessage(id);
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error;
  }
  revalidatePath('/', 'layout');
  redirect('/messages?notice=deleted');
}
