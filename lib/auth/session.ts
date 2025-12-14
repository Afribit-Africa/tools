import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth-options';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Require authentication for a page/API route
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Require BCE role
 */
export async function requireBCE() {
  const session = await requireAuth();

  if (session.user.role !== 'bce') {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Require Admin or Super Admin role
 */
export async function requireAdmin() {
  const session = await requireAuth();

  console.log('🔒 requireAdmin check:', {
    email: session.user.email,
    role: session.user.role,
    hasSession: !!session
  });

  if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
    console.log('❌ Access denied - role mismatch');
    redirect('/unauthorized');
  }

  console.log('✅ Admin access granted');
  return session;
}

/**
 * Require Super Admin role
 */
export async function requireSuperAdmin() {
  const session = await requireAuth();

  if (session.user.role !== 'super_admin') {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Check if user has completed BCE profile setup
 * Redirects to setup page if economyName is missing
 * Super admins can access without BCE profile
 */
export async function requireBCEProfile() {
  const session = await requireAuth();

  console.log('🔍 requireBCEProfile check:', {
    email: session.user.email,
    role: session.user.role,
    economyName: session.user.economyName,
    economyId: session.user.economyId,
  });

  // Admins and super admins can access without BCE profile
  if (session.user.role === 'admin' || session.user.role === 'super_admin') {
    return session;
  }

  // Regular BCE users need role check
  if (session.user.role !== 'bce') {
    redirect('/unauthorized');
  }

  // Check if economy name is set (indicates profile completion)
  if (!session.user.economyName) {
    console.log('⚠️ No economy profile found, redirecting to setup');
    redirect('/cbaf/setup');
  }

  return session;
}

/**
 * Get user role
 */
export async function getUserRole(): Promise<'bce' | 'admin' | 'super_admin' | null> {
  const session = await getSession();
  return session?.user?.role || null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}
