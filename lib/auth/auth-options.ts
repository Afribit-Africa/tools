import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db } from '@/lib/db';
import { economies, adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Check if email is in admin list
function isAdmin(email: string): boolean {
  const adminEmails = process.env.CBAF_ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

// Check if email is in super admin list
function isSuperAdmin(email: string): boolean {
  const superAdminEmails = process.env.CBAF_SUPER_ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) || [];
  return superAdminEmails.includes(email.toLowerCase());
}

// Determine user role based on email
function getUserRole(email: string): 'super_admin' | 'admin' | 'bce' {
  if (isSuperAdmin(email)) return 'super_admin';
  if (isAdmin(email)) return 'admin';
  return 'bce';
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        console.error('❌ Sign-in failed: No email provided');
        return false;
      }

      const role = getUserRole(user.email);

      console.log('🔐 Sign-in attempt:', {
        email: user.email,
        role,
        hasAccount: !!account,
        provider: account?.provider,
      });

      try {
        // Check if user exists as admin
        if (role === 'admin' || role === 'super_admin') {
          console.log('👤 User is admin/super_admin, checking database...');

          const existingAdmin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.googleEmail, user.email),
          });

          if (!existingAdmin && account) {
            console.log('➕ Creating new admin user...');
            // Create admin user
            await db.insert(adminUsers).values({
              googleId: account.providerAccountId,
              googleEmail: user.email,
              googleName: user.name || null,
              googleAvatar: user.image || null,
              role: role === 'super_admin' ? 'super_admin' : 'admin',
              canApproveVideos: true,
              canRejectVideos: true,
              canSendPayments: role === 'super_admin',
              canManageAdmins: role === 'super_admin',
              isActive: true,
            });
            console.log('✅ Admin user created successfully');
          } else if (existingAdmin) {
            console.log('🔄 Updating existing admin last login...');
            // Update last login
            await db
              .update(adminUsers)
              .set({ lastLoginAt: new Date() })
              .where(eq(adminUsers.googleEmail, user.email));
            console.log('✅ Admin login updated');
          }
        } else {
          console.log('👤 User is BCE, checking for economy...');
          // BCE user - check if economy exists
          const existingEconomy = await db.query.economies.findFirst({
            where: eq(economies.googleEmail, user.email),
          });

          if (existingEconomy) {
            console.log('🔄 Updating economy last activity...');
            // Update last activity
            await db
              .update(economies)
              .set({ lastActivityAt: new Date() })
              .where(eq(economies.googleEmail, user.email));
            console.log('✅ Economy activity updated');
          } else {
            console.log('ℹ️  No economy found yet - user will be redirected to setup');
          }
          // If economy doesn't exist, we'll redirect to setup via requireBCEProfile
        }

        console.log('✅ Sign-in callback returning true');
        return true;
      } catch (error) {
        console.error('❌ Error in signIn callback:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
        // Return true anyway to allow login - the error might be non-critical
        return true;
      }
    },

    async jwt({ token, user, account }) {
      try {
        console.log('🔑 JWT Callback:', { hasUser: !!user, hasAccount: !!account, tokenRole: token.role, email: token.email });

        if (account && user) {
        const role = getUserRole(user.email!);
        console.log('🆕 New sign-in, setting role:', role);

        token.role = role;
        token.googleId = account.providerAccountId;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // For BCE users, attach economy data if it exists
        if (role === 'bce') {
          const economy = await db.query.economies.findFirst({
            where: eq(economies.googleEmail, user.email!),
            columns: {
              id: true,
              economyName: true,
              slug: true,
              isActive: true,
              isVerified: true,
            },
          });

          if (economy) {
            token.economyId = economy.id;
            token.economyName = economy.economyName;
            token.economySlug = economy.slug;
            token.isVerified = economy.isVerified ?? false;
          }
        }

        // For admin users, attach admin data
        if (role === 'admin' || role === 'super_admin') {
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.googleEmail, user.email!),
            columns: {
              id: true,
              canApproveVideos: true,
              canRejectVideos: true,
              canSendPayments: true,
              canManageAdmins: true,
            },
          });

          if (admin) {
            token.adminId = admin.id;
            token.canApproveVideos = admin.canApproveVideos ?? true;
            token.canRejectVideos = admin.canRejectVideos ?? true;
            token.canSendPayments = admin.canSendPayments ?? false;
            token.canManageAdmins = admin.canManageAdmins ?? false;
          }
        }
      } else if (token.email && !token.role) {
        // If token exists but role is missing, set it now
        const role = getUserRole(token.email as string);
        console.log('🔄 Existing token missing role, setting:', role);
        token.role = role;

        // Also fetch admin data if needed
        if (role === 'admin' || role === 'super_admin') {
          const admin = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.googleEmail, token.email as string),
            columns: {
              id: true,
              canApproveVideos: true,
              canRejectVideos: true,
              canSendPayments: true,
              canManageAdmins: true,
            },
          });

          if (admin) {
            token.adminId = admin.id;
            token.canApproveVideos = admin.canApproveVideos ?? true;
            token.canRejectVideos = admin.canRejectVideos ?? true;
            token.canSendPayments = admin.canSendPayments ?? false;
            token.canManageAdmins = admin.canManageAdmins ?? false;
          }
        }
      } else if (token.role === 'bce' && token.email && !token.economyName) {
        // BCE user without economy data - try to load it (handles post-setup scenario)
        console.log('🔄 BCE token missing economy data, fetching...');
        const economy = await db.query.economies.findFirst({
          where: eq(economies.googleEmail, token.email as string),
          columns: {
            id: true,
            economyName: true,
            slug: true,
            isActive: true,
            isVerified: true,
          },
        });

        if (economy) {
          console.log('✅ Economy data loaded:', economy.economyName);
          token.economyId = economy.id;
          token.economyName = economy.economyName;
          token.economySlug = economy.slug;
          token.isVerified = economy.isVerified ?? false;
        } else {
          console.log('ℹ️  No economy found yet');
        }
      }

        console.log('🔑 JWT Token after processing:', { role: token.role, email: token.email, adminId: token.adminId });
        return token;
      } catch (error) {
        console.error('❌ Error in JWT callback:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
        // Return token as-is to prevent auth failure, but log the error
        return token;
      }
    },

    async session({ session, token }) {
      try {
        console.log('📋 Session Callback:', { tokenRole: token.role, email: token.email });

        if (session.user) {
        session.user.role = token.role as 'bce' | 'admin' | 'super_admin';
        session.user.googleId = token.googleId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;

        if (token.role === 'bce') {
          session.user.economyId = token.economyId as string | undefined;
          session.user.economyName = token.economyName as string | undefined;
          session.user.economySlug = token.economySlug as string | undefined;
          session.user.isVerified = token.isVerified as boolean | undefined;
        }

        if (token.role === 'admin' || token.role === 'super_admin') {
          session.user.adminId = token.adminId as string;
          session.user.canApproveVideos = token.canApproveVideos as boolean;
          session.user.canRejectVideos = token.canRejectVideos as boolean;
          session.user.canSendPayments = token.canSendPayments as boolean;
          session.user.canManageAdmins = token.canManageAdmins as boolean;
        }
      }

        console.log('📋 Session after processing:', { role: session.user.role, email: session.user.email });
        return session;
      } catch (error) {
        console.error('❌ Error in session callback:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
        // Return session as-is to prevent auth failure
        return session;
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/auth/welcome', // Redirect new BCE users to profile setup
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
