let cachedToken = null;
let cachedTokenExpiry = 0;

async function getManagementToken() {
  if (cachedToken && Date.now() < cachedTokenExpiry) {
    return cachedToken;
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
    throw new Error(`Failed to get management token: ${data.error_description || data.error}`);
  }

  cachedToken = data.access_token;
  cachedTokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh a minute early
  return cachedToken;
}

export async function getUserRoles(userId) {
  const token = await getManagementToken();
  const res = await fetch(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/roles`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch user roles: ${res.status}`);
  }

  const roles = await res.json();
  return roles.map((r) => r.name);
}

export async function isAuthor(userId) {
  const roles = await getUserRoles(userId);
  return roles.includes('author');
}