import type { EnquiryPayload, EnquiryResponse } from '../../../types/catalog';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResponse> {
  const response = await fetch(`${API_BASE_URL}/enquiries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error((data as { message?: string } | null)?.message || 'Unable to submit your enquiry.');
  }

  return data as EnquiryResponse;
}
