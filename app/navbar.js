"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar({ onLogout }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between">
        <div>
          <Link href="/dashboard" className="text-white mx-4 hover:underline">Dashboard</Link>
          <Link href="/publications" className="text-white mx-4 hover:underline">Publications</Link>
        </div>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-600">Logout</button>
      </div>
    </nav>
  );
}
