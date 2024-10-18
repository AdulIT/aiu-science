"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

export default function AdminPublications() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [users, setUsers] = useState([]); // Список всех пользователей для фильтрации
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const decodedToken = jwtDecode(token);
    if (decodedToken.role !== 'admin') {
      router.push('/home-user');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'http://localhost:8080/api/admin/publications', 
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } }, 
          router
        );
        
        if (response.ok) {
          const data = await response.json();
          setPublications(data);
          setFilteredPublications(data); // По умолчанию показываем все публикации
        } else {
          console.error('Ошибка при загрузке публикаций');
          router.push('/login');
        }
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    if (year === '') {
      setFilteredPublications(publications);
    } else {
      const filtered = publications.filter((pub) => pub.year === year);
      setFilteredPublications(filtered);
    }
  };
  
  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    if (userId === '') {
      setFilteredPublications(publications);
    } else {
      const filtered = publications.filter((pub) => pub.userId === userId);
      setFilteredPublications(filtered);
    }
  };

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Авторизуйтесь перед генерацией отчета.');
        return;
      }
  
      const response = await fetch('http://localhost:8080/api/admin/generateAllPublicationsReport', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_publications_report.docx';  // Set the filename
        document.body.appendChild(a); // Append to the document
        a.click(); // Trigger the download
        a.remove(); // Clean up
      } else {
        alert('Ошибка при генерации отчета.');
      }
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
      alert('Произошла ошибка при генерации отчета.');
    }
  };
  
  const generateUserReport = async (userIin) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Authorization failed. Please log in again.');
        return;
      }
  
      const response = await fetch('/api/admin/generateUserReport', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin: userIin }), // Sending the IIN as a parameter
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${userIin}_report.docx`); // Filename based on user IIN
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the report.');
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
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Публикации всех сотрудников</h1>
          <button
            onClick={generateReport}
            className="py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Генерировать отчет
          </button>
        </div>

        <div className="flex gap-4 mb-4">
            <div>
                <label>Фильтр по году:</label>
                <select value={selectedYear} onChange={handleYearChange} className="px-3 py-2 border rounded-lg">
                    <option value="">Все годы</option>
                    {[...new Set(publications.map((pub) => pub.year))].map((year) => (
                    <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>

          <div>
            <label>Фильтр по пользователю:</label>
            <select value={selectedUser} onChange={handleUserChange} className="px-3 py-2 border rounded-lg">
              <option value="">Все пользователи</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          {filteredPublications.length > 0 ? (
            filteredPublications.map((publication, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                <p><strong>Авторы:</strong> {publication.authors}</p>
                <p><strong>Название статьи:</strong> {publication.title}</p>
                <p><strong>Год:</strong> {publication.year}</p>
                <p><strong>Выходные данные:</strong> {publication.output}</p>
                {publication.doi && <p><strong>Ссылки, DOI:</strong> {publication.doi}</p>}
                {publication.isbn && <p><strong>ISBN:</strong> {publication.isbn}</p>}
                <p><strong>Пользователь:</strong> 
                  <Link href={`/api/admin/user/${publication.userId}`} className="text-blue-500 hover:underline">
                    {publication.userName}
                  </Link>
                </p>
                <button
                  onClick={() => generateUserReport(publication.userId)}
                  className="py-1 px-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
                >
                  Генерировать отчет по пользователю
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Нет публикаций для отображения.</p>
          )}
        </div>
      </div>
    </>
  );
}