import { API_URL } from './auth';

export enum MetodePembayaran {
  MIDTRANS = 'midtrans',
  COD = 'cod'
}

export enum StatusPembayaran {
  BELUM_BAYAR = 'belum bayar',
  SUDAH_BAYAR = 'sudah bayar',
  GAGAL = 'gagal',
  DIKEMBALIKAN = 'dikembalikan',
}

export interface PembayaranRecord {
  id: string;
  pesanan_id: string;
  metode: MetodePembayaran;
  status: StatusPembayaran;
  jumlah_pembayaran: number;
  keterangan?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePembayaranDto {
  pesanan_id: string;
  metode: MetodePembayaran;
  jumlah_pembayaran: number;
  keterangan?: string;
}

export interface MidtransPaymentResponse {
  token: string;
  redirect_url: string;
}

// Create pembayaran record
export async function createPembayaran(token: string, data: CreatePembayaranDto): Promise<PembayaranRecord> {
  const response = await fetch(`${API_URL}/pembayaran`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal membuat pembayaran');
  }

  return response.json();
}

// Initiate Midtrans payment
export async function createMidtransPayment(token: string, pesananId: string): Promise<MidtransPaymentResponse> {
  console.log('Calling Midtrans API:', `${API_URL}/pembayaran/initiate`);
  console.log('Request body:', { pesananId });

  const response = await fetch(`${API_URL}/pembayaran/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ pesananId }),
  });

  console.log('API Response status:', response.status);
  console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const error = await response.json();
    console.log('API Error response:', error);
    throw new Error(error.message || 'Gagal membuat pembayaran Midtrans');
  }

  const data = await response.json();
  console.log('API Success response:', data);
  return data;
}

// Get payment status
export async function getPaymentStatus(token: string, pesananId: string): Promise<PembayaranRecord> {
  const response = await fetch(`${API_URL}/pembayaran/${pesananId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal mendapatkan status pembayaran');
  }

  return response.json();
}

// Update payment status (for admin)
export async function updatePaymentStatus(token: string, pembayaranId: string, status: StatusPembayaran): Promise<PembayaranRecord> {
  const response = await fetch(`${API_URL}/pembayaran/${pembayaranId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Gagal mengupdate status pembayaran');
  }

  return response.json();
}

// Check and update order status based on payment status
export async function syncOrderStatusWithPayment(token: string, pesananId: string): Promise<{updated: boolean, message: string}> {
  try {
    // Get payment status
    const payment = await getPaymentStatus(token, pesananId);

    // If payment is successful and order is still pending, update order status
    if (payment.status === StatusPembayaran.SUDAH_BAYAR) {
      // Import here to avoid circular dependency
      const { getPesananById, updatePesanan, StatusPesanan } = await import('./pesanan');

      const order = await getPesananById(token, pesananId);

      if (order.status === StatusPesanan.PENDING) {
        await updatePesanan(token, pesananId, { status: StatusPesanan.DIPROSES });
        return { updated: true, message: 'Status pesanan berhasil diperbarui ke DIPROSES' };
      }
    }

    return { updated: false, message: 'Tidak ada pembaruan status yang diperlukan' };
  } catch (error: any) {
    throw new Error(error?.message || 'Gagal sinkronisasi status pesanan');
  }
}
