"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ role }) {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/publications" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/publications' ? 'bg-gray-900' : ''}`}>
            Публикации
          </Link>
          <Link href="/resumes" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/resumes' ? 'bg-gray-900' : ''}`}>
            Резюме
          </Link>
          {role === 'admin' && (
            <Link href="/admin-users" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/admin-users' ? 'bg-gray-900' : ''}`}>
              Все сотрудники
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-white text-sm font-medium">
            Профиль
          </Link>
        </div>
      </div>
    </nav>
  );
}