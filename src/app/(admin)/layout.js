import AdminSidebar from '@/components/admin/AdminSidebar';

// Auth is now handled by middleware.js at root
// This layout only adds the sidebar for all authenticated admin pages
export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-bg min-h-screen">{children}</main>
    </div>
  );
}
