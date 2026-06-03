import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AppSidebar from '@/layout/AppSidebar';

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  // Hard block: hanya admin yang boleh masuk
  if (!session || session.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}