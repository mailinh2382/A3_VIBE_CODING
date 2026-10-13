import type { Invoice } from '../types';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';

// ---------- Types sent to / from the backend (snake_case) ----------

interface ApiInvoice {
  id: string;
  user_id: string;
  product_name: string;
  price: number;
  vat_rate: number;
  buyer_name: string;
  buyer_tax_code: string;
  total: number;
  invoice_number: string | null;
  created_at: string;
}

// ---------- Mapping helpers ----------

function apiToInvoice(a: ApiInvoice): Invoice {
  return {
    id: a.id,
    invoiceNumber: a.invoice_number ?? '',
    productName: a.product_name,
    price: a.price,
    vatRate: a.vat_rate,
    buyerName: a.buyer_name,
    buyerTaxCode: a.buyer_tax_code,
    totalAmount: a.total,
    issuedDate: new Date(a.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
}

// ---------- Auth helper ----------

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please log in.');
  }
  return session.access_token;
}

// ---------- API calls ----------

export async function createInvoice(data: {
  productName: string;
  price: number;
  vatRate: number;
  buyerName: string;
  buyerTaxCode: string;
  totalAmount: number;
}): Promise<Invoice> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product_name: data.productName,
      price: data.price,
      vat_rate: data.vatRate,
      buyer_name: data.buyerName,
      buyer_tax_code: data.buyerTaxCode,
      total: data.totalAmount,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Server error (${res.status})`);
  }

  return apiToInvoice(await res.json());
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const token = await getAccessToken();

  const res = await fetch(`${API_URL}/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Server error (${res.status})`);
  }

  const data: ApiInvoice[] = await res.json();
  return data.map(apiToInvoice);
}