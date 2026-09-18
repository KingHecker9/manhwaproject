import { supabaseAdmin } from "./supabase-admin.js";

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getManagementToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }

  if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_MGMT_CLIENT_ID || !process.env.AUTH0_MGMT_CLIENT_SECRET) {
    return null;
  }

  const res = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.warn(`Auth0 management token warning: ${data.error_description || data.error}`);
    return null;
  }

  cachedToken = data.access_token;
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh a minute early
  return cachedToken;
}

export async function getUserRoles(userId) {
  if (!userId) return [];
  try {
    const token = await getManagementToken();
    if (!token) return [];

    const res = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      console.warn(`Auth0 getUserRoles status ${res.status} for user ${userId}`);
      return [];
    }

    const roles = await res.json();
    return Array.isArray(roles) ? roles.map((r) => r.name) : [];
  } catch (err) {
    console.warn("Could not fetch user roles from Auth0 Management API:", err.message);
    return [];
  }
}

export async function isAuthor(userId) {
  if (!userId) return false;

  // 1. Check Auth0 user roles via Management API
  try {
    const roles = await getUserRoles(userId);
    if (roles.includes('author') || roles.includes('admin')) {
      return true;
    }
  } catch {
    // Non-fatal, fallback to database check
  }

  // 2. Database Author Verification: If this user already created any series, they are an authorized creator
  try {
    const { data: existingSeries } = await supabaseAdmin
      .from('series')
      .select('id')
      .eq('author_id', userId)
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      return true;
    }
  } catch (err) {
    console.warn("Error verifying author in Supabase:", err.message);
  }

  return false;
}