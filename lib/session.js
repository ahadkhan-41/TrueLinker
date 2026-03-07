import { cookies } from "next/headers";

const SESSION_COOKIE = "tl_session_email";

export async function setSession(email) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionEmail() {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value || null;
}
