import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId:     process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: 'identify email' } },
    }),
    CredentialsProvider({
      id: 'admin-login',
      name: 'Admin',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        if (creds.email !== process.env.ADMIN_EMAIL) return null;
        const valid = await bcrypt.compare(creds.password, process.env.ADMIN_PASSWORD_HASH || '');
        if (!valid) return null;
        return { id: 'admin', email: creds.email, role: 'admin', name: 'Admin' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === 'discord') {
        token.discordId   = profile.id;
        token.discordName = profile.username;
        token.avatar      = profile.avatar;
        token.role        = 'customer';
        token.accessToken = account.access_token;
      }
      if (user?.role === 'admin') {
        token.role  = 'admin';
        token.email = user.email;
      }
      // Refresh data user dari DB setiap token refresh
      if (token.discordId) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
          );
          // Cari user berdasarkan discord_id
          const { data: u } = await sb
            .from('users')
            .select('id, tier, balance')
            .eq('discord_id', token.discordId)
            .single();
          if (u) {
            token.userUUID = u.id;
            token.tier     = u.tier    || 'member';
            token.balance  = u.balance || 0;
          }
          // Hitung stats transaksi
          const { data: orders } = await sb
            .from('orders')
            .select('status')
            .eq('discord_id', token.discordId);
          if (orders) {
            token.totalOrders   = orders.length;
            token.pendingOrders = orders.filter(o => o.status === 'pending').length;
            token.processOrders = orders.filter(o => ['paid','processing'].includes(o.status)).length;
            token.successOrders = orders.filter(o => o.status === 'completed').length;
            token.failedOrders  = orders.filter(o => ['failed','cancelled'].includes(o.status)).length;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      session.user.discordId    = token.discordId;
      session.user.discordName  = token.discordName;
      session.user.avatar       = token.avatar;
      session.user.role         = token.role || 'customer';
      session.user.tier         = token.tier || 'member';
      session.user.balance      = token.balance || 0;
      session.user.userUUID     = token.userUUID;
      session.user.totalOrders  = token.totalOrders || 0;
      session.user.pendingOrders = token.pendingOrders || 0;
      session.user.processOrders = token.processOrders || 0;
      session.user.successOrders = token.successOrders || 0;
      session.user.failedOrders  = token.failedOrders || 0;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'discord' && profile?.id) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
          );
          // Upsert berdasarkan discord_id (bukan id UUID)
          await sb.from('users').upsert({
            discord_id: profile.id,
            username:   profile.username,
            avatar:     profile.avatar,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'discord_id' });
        } catch (e) {
          console.error('[AUTH] save user:', e.message);
        }
      }
    }
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
