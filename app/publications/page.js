"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import jwtDecode from 'jwt-decode';
// import { makeAuthenticatedRequest } from '../lib/api';

export default function Publications() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Добавляем состояние для роли администратора
  const [newPublication, setNewPublication] = useState({
    authors: '',
    title: '',
    year: '',
    output: '',
    doi: '',
    percentile: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
    } else {
      const decodedToken = jwtDecode(token);
      setIsAdmin(decodedToken.role === 'admin'); // Определяем роль пользователя

      const fetchPublications = async () => {
        try {
          const response = await fetch(isAdmin
            ? 'http://localhost:8080/api/admin/publications'
            : 'http://localhost:8080/api/user/publications',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setPublications(data);
          } else {
            console.error('Ошибка при загрузке публикаций');
            router.push('/login');
          }
        } catch (error) {
          console.error('Ошибка при загрузке публикаций:', error);
          router.push('/login');
        }
        setIsLoading(false);
      };

      fetchPublications();
    }
  }, [router, isAdmin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPublication = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Ошибка авторизации. Пожалуйста, войдите снова.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/user/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPublication),
      });

      if (response.ok) {
        const addedPublication = await response.json();
        setPublications((prev) => [...prev, addedPublication]);
        setNewPublication({
          authors: '',
          title: '',
          year: '',
          output: '',
          doi: '',
          percentile: '',
        });
        setIsAdding(false);
      } else {
        console.error('Ошибка при добавлении публикации');
      }
    } catch (error) {
      console.error('Ошибка при добавлении публикации:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="mb-4">
            <Link href="/" className="text-blue-500 hover:underline">
              Главная
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Публикации</h1>

          {!isAdmin && ( // Только обычный пользователь может добавлять публикации
            <button
              onClick={() => setIsAdding(true)}
              className="py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Добавить публикацию
            </button>
          )}
        </div>

        {isAdding && !isAdmin && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold mb-4">Новая публикация</h2>
            {['authors', 'title', 'year', 'output', 'doi', 'percentile'].map((field) => (
              <div key={field} className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">
                  {field === 'authors' && 'Авторы'}
                  {field === 'title' && 'Название статьи'}
                  {field === 'year' && 'Год'}
                  {field === 'output' && 'Выходные данные'}
                  {field === 'doi' && 'Ссылки, DOI'}
                  {field === 'percentile' && 'Процентиль'}
                </label>
                <input
                  type="text"
                  name={field}
                  value={newPublication[field]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <button
              onClick={handleAddPublication}
              className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Сохранить публикацию
            </button>
          </div>
        )}

        <div>
          {publications.length > 0 ? (
            publications.map((publication, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                <p><strong>Авторы:</strong> {publication.authors}</p>
                <p><strong>Название статьи:</strong> {publication.title}</p>
                <p><strong>Год:</strong> {publication.year}</p>
                <p><strong>Выходные данные:</strong> {publication.output}</p>
                <p><strong>Ссылки, DOI:</strong> {publication.doi}</p>
                <p><strong>Процентиль:</strong> {publication.percentile}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">У вас пока нет публикаций.</p>
          )}
        </div>
      </div>
    </div>
  );
}