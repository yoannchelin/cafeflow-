const TOKEN_KEY = "cafeflow_access_token";
const ROLE_KEY = "cafeflow_role";
const EMAIL_KEY = "cafeflow_email";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(accessToken: string, email: string, role: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function getSession() {
  const token = getAccessToken();
  const role = localStorage.getItem(ROLE_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  return { token, role, email };
}
