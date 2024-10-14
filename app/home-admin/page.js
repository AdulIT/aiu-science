"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';
import Navbar from '../../components/Navbar';

export default function AdminHome() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== 'admin') {
      router.push('/home-user');
    }
  }, [router]);

  return (
    <div>
      <Navbar role="admin" />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
        <p className="mt-4">Ваша роль в системе - администратор.</p>
        <p>Вы можете управлять всеми публикациями, резюме и просматривать информацию обо всех сотрудниках.</p>
      </div>
    </div>
  );
}