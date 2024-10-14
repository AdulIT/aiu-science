"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/Navbar';

export default function UserHome() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== 'user') {
      router.push('/admin');
    }
  }, [router]);

  return (
    <div>
      <Navbar role="user" />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Добро пожаловать на главную страницу!</h1>
        <p className="mt-4">Вы можете управлять своими публикациями и резюме через навигацию сверху.</p>
      </div>
    </div>
  );
}