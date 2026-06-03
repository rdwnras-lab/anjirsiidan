import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Hard block: redirect jika bukan admin
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}