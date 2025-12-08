import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      email: string;
      name: string;
      image: string;
      role: 'bce' | 'admin' | 'super_admin';
      googleId: string;
      
      // BCE specific
      economyId?: string;
      economyName?: string;
      economySlug?: string;
      isVerified?: boolean;
      
      // Admin specific
      adminId?: string;
      canApproveVideos?: boolean;
      canRejectVideos?: boolean;
      canSendPayments?: boolean;
      canManageAdmins?: boolean;
    };
  }

  interface User {
    role?: 'bce' | 'admin' | 'super_admin';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'bce' | 'admin' | 'super_admin';
    googleId: string;
    
    // BCE specific
    economyId?: string;
    economyName?: string;
    economySlug?: string;
    isVerified?: boolean;
    
    // Admin specific
    adminId?: string;
    canApproveVideos?: boolean;
    canRejectVideos?: boolean;
    canSendPayments?: boolean;
    canManageAdmins?: boolean;
  }
}
