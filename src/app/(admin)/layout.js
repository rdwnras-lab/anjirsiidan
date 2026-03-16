import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') redirect('/login');
<<<<<<< HEAD
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
=======
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg min-h-screen">{children}</main>
    </div>
  );
>>>>>>> a3a7d63792529c0b9cfdcc4a247156dad8e387e7
}
