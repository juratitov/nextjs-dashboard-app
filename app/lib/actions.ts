'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { queryPool as sql } from '@/app/lib/postgres';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

function getAmountInCents(amount: number) {
  return amount * 100;
}

/**
 *
 * @param formData
 */
export async function createInvoice(formData: FormData) {
  //   const rawFormData = {
  //     customerId: formData.get('customerId'),
  //     amount: formData.get('amount'),
  //     status: formData.get('status'),
  //   };

  //   console.log(rawFormData);

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  const amountInCents = getAmountInCents(amount);
  const date = new Date().toISOString().split('T')[0];

  try {
    await sql(
      `INSERT INTO invoices (customer_id, amount, status, date) 
    VALUES ($1, $2, $3, $4)`,
      [customerId, amountInCents, status, date]
    );
  } catch (error) {
    return {
      message: 'Failed to create invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 *
 * @param id
 * @param formData
 */
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = getAmountInCents(amount);

  try {
    await sql(
      `UPDATE invoices
          SET customer_id = $2, amount = $3, status = $4 
          WHERE id = $1`,
      [id, customerId, amountInCents, status]
    );
  } catch (error) {
    return {
      message: 'Failed to update invoice',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 *
 * @param id
 */
export async function deleteInvoice(id: string) {
  try {
    await sql(`DELETE FROM invoices WHERE id = $1`, [id]);
  } catch (error) {
    return {
      message: 'Failed to delete invoice',
    };
  }
  revalidatePath('/dashboard/invoices');
}
