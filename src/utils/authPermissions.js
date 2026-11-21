const USER_STORAGE_KEY = 'tracking_current_user_v1';

export const ROLES = ['Owner', 'Member', 'Viewer'];

export const DEFAULT_USER = {
  id: 'u1',
  name: 'Ohm Saehae',
  email: 'lighting6647@gmail.com',
  role: 'Owner',
  provider: 'local',
};

export function loadCurrentUser() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name && parsed.role) return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_USER;
}

export function saveCurrentUser(user) {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export function getPermissions(role = 'Owner') {
  const r = String(role || 'Owner');
  return {
    canView: true,
    canEditItems: r === 'Owner' || r === 'Member',
    canEditBoards: r === 'Owner' || r === 'Member',
    canDeleteBoards: r === 'Owner',
    canManagePermissions: r === 'Owner',
    isReadOnly: r === 'Viewer',
  };
}

// Optional Supabase Auth REST sign-in (works when Supabase URL & Anon Key are configured)
export async function signInWithSupabase({ supabaseUrl, supabaseAnonKey, email, password }) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('กรุณาตั้งค่า Supabase URL และ Anon Key ใน Cloud Sync ก่อน');
  }
  const base = supabaseUrl.replace(/\/+$/, '');
  const res = await fetch(`${base}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error_description || data.msg || `Login failed (${res.status})`);
  }
  return {
    id: data.user?.id || `sb-${Date.now()}`,
    name: data.user?.user_metadata?.full_name || email.split('@')[0],
    email: data.user?.email || email,
    role: 'Owner',
    provider: 'supabase',
    accessToken: data.access_token || null,
  };
}
