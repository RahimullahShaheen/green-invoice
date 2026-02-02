import { supabase } from './supabaseClient';
import { BusinessInfo } from '@/types/invoice';

// Fetch business info (assumes only one row per business)
export async function getBusinessInfoFromSupabase(): Promise<BusinessInfo | null> {
  const { data, error } = await supabase
    .from('business_info')
    .select('*')
    .single();
  if (error || !data) return null;
  return {
    businessName: data.businessname ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    address: data.address ?? '',
    abn: data.abn ?? '',
    logoUrl: data.logourl ?? '',
    bankAccountNumber: data.bankaccountnumber ?? '',
    bankBSB: data.bankbsb ?? '',
    id: data.id ?? 1,
  };
}

// Save or update business info (upsert)
export async function saveBusinessInfoToSupabase(info: BusinessInfo): Promise<boolean> {
  // Map camelCase fields to snake_case for Supabase
  const dbInfo = {
    id: 1,
    businessname: info.businessName,
    email: info.email,
    phone: info.phone,
    address: info.address,
    abn: info.abn || null,
    logourl: info.logoUrl || null,
    bankaccountnumber: info.bankAccountNumber || null,
    bankbsb: info.bankBSB || null,
  };
  const { error } = await supabase
    .from('business_info')
    .upsert([dbInfo], { onConflict: 'id' });
  return !error;
}
