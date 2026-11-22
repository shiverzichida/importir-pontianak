import { getCustomerSession } from './auth';
import { getSupabaseAdmin } from './supabase';
import type { CustomerProfile, CustomerSessionUser } from './types';

export const CUSTOMER_SAFE_COLUMNS =
  'id, member_code, marking_code_base, email, full_name, whatsapp, company_name, default_destination_city, address_detail, is_active, last_login_at, created_at, updated_at';

export function toCustomerSessionUser(
  profile: CustomerProfile
): CustomerSessionUser {
  return {
    customerId: profile.id,
    memberCode: profile.member_code,
    markingCodeBase: profile.marking_code_base,
    email: profile.email,
    fullName: profile.full_name,
    whatsapp: profile.whatsapp,
    companyName: profile.company_name ?? null,
    defaultDestinationCity: profile.default_destination_city,
  };
}

export async function getActiveCustomerProfile(): Promise<CustomerProfile | null> {
  const session = await getCustomerSession();
  if (!session) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('imp_customers')
      .select(CUSTOMER_SAFE_COLUMNS)
      .eq('id', session.customerId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as CustomerProfile;
  } catch (err) {
    console.error('Failed to resolve active customer profile:', err);
    return null;
  }
}
