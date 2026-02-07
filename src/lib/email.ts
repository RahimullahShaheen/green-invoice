export async function sendInvoicesByEmail(to: string, body: string, files: { name: string; blob: Blob }[]) {
  try {
    const form = new FormData();
    form.append('to', to);
    form.append('body', body);
    files.forEach((f, i) => {
      form.append('files', f.blob, f.name);
    });

    // Allow overriding the API base URL in dev via VITE_API_URL (e.g. http://localhost:4000)
    const API_URL = (import.meta as any).env?.VITE_API_URL || '';
    const url = API_URL ? `${API_URL.replace(/\/$/, '')}/api/send-invoices` : '/api/send-invoices';

    const res = await fetch(url, {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      // Read the body once as text, then try parsing JSON to avoid "Body has already been consumed" errors
      const text = await res.text();
      let errBody: any;
      try {
        errBody = JSON.parse(text);
      } catch {
        errBody = text;
      }
      console.error('sendInvoicesByEmail server error:', res.status, errBody);
      throw new Error((errBody && errBody.error) || errBody || 'Email API error');
    }

    return true;
  } catch (e) {
    console.error('sendInvoicesByEmail error:', e);
    return false;
  }
}