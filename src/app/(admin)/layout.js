import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }) {
  // Get current path from headers
  const { headers } = await import('next/headers');
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Don't protect the login page itself!
  const isLoginPage = pathname.includes('/admin/login');

  if (!isLoginPage) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      redirect('/admin/login');
    }
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 bg-bg min-h-screen">{children}</main>
      </div>
    );
  }

  // Login page: no sidebar, no auth check
  return <>{children}</>;
}
