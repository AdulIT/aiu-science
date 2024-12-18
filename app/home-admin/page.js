"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/Navbar';

export default function AdminHome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const decodedToken = jwtDecode(accessToken);
    // console.log("Decoded token:", decodedToken);

    if (decodedToken.role !== 'admin') {
      router.push('/home-user');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

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