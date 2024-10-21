"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function Navbar({ role }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href={role === 'admin' ? "/home-admin" : "/home-user"} className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === (role === 'admin' ? '/home-admin' : '/home-user') ? 'bg-gray-900' : ''}`}>
            Главная
          </Link>

          {/* Ссылки для всех ролей */}
          <Link href={role === 'admin' ? "/admin-publications" : "/publications"} className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/publications' ? 'bg-gray-900' : ''}`}>
            Публикации
          </Link>
          <Link href="/resume" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/resumes' ? 'bg-gray-900' : ''}`}>
            Резюме
          </Link>

          {/* Дополнительные ссылки только для администратора */}
          {role === 'admin' && (
            <>
              <Link href="/admin-users" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/users' ? 'bg-gray-900' : ''}`}>
                Все сотрудники
              </Link>
              {/* <Link href="/admin-dashboard" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/admin-dashboard' ? 'bg-gray-900' : ''}`}>
                Панель администратора
              </Link> */}
            </>
          )}

          {/* {role === 'user' && (
            <Link href="/my-submissions" className={`text-white px-3 py-2 rounded-md text-sm font-medium ${pathname === '/my-submissions' ? 'bg-gray-900' : ''}`}>
              Мои отправления
            </Link>
          )} */}
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-white text-sm font-medium">
            Профиль
          </Link>
          <button 
            onClick={handleLogout} 
            className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  );
}