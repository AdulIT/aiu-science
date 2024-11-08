"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { jwtDecode } from 'jwt-decode';

const publicationTypeMap = {
    scopus_wos: 'Научные труды (Scopus/Web of Science)',
    koknvo: 'КОКНВО',
    conference: 'Материалы конференций',
    articles: 'Статьи РК и не включенные в Scopus/WoS',
    books: 'Монографии, книги и учебные материалы',
    patents: 'Патенты, авторское свидетельство',
};

export default function AdminPublications() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedHigherSchool, setSelectedHigherSchool] = useState('');
  const [higherSchools, setHigherSchools] = useState([]);
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [yearRange, setYearRange] = useState({ from: '', to: '' });
  

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const response = await makeAuthenticatedRequest(
          'http://localhost:8080/api/admin/publications',
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          router
        );
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setPublications(data);
          setFilteredPublications(data);

          // Calculate min and max years
          const years = data.map(pub => parseInt(pub.year, 10)).sort((a, b) => a - b);
          setMinYear(years[0]);
          setMaxYear(years[years.length - 1]);
        } else {
          console.error('Ошибка при загрузке публикаций');
          alert('Не удалось загрузить публикации');
        }
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error);
        alert('Произошла ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await makeAuthenticatedRequest(
          'http://localhost:8080/api/admin/users',
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          router
        );
        const data = await response.json();
        setUsers(data.users);

        // Extract unique higher schools
        const uniqueHigherSchools = [...new Set(data.users.map(user => user.higherSchool))].filter(Boolean);
        setHigherSchools(uniqueHigherSchools);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };

    fetchData();
    fetchUsers();
  }, [router]);

  useEffect(() => {
    // Apply all filters to the publications
    const filtered = publications.filter(pub => {
      const yearMatch = 
        (!yearRange.from || pub.year >= yearRange.from) &&
        (!yearRange.to || pub.year <= yearRange.to);

      const userMatch = selectedUser ? pub.iin === selectedUser : true;

      const author = users.find(user => user.iin === pub.iin);
      const schoolMatch = selectedHigherSchool
        ? author && author.higherSchool === selectedHigherSchool
        : true;

      return yearMatch && userMatch && schoolMatch;
    });

    setFilteredPublications(filtered);
  }, [yearRange, selectedUser, selectedHigherSchool, publications, users]);

  const generateReport = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Авторизуйтесь перед генерацией отчета.');
      router.push('/login');
      return;
    }

    const response = await makeAuthenticatedRequest('http://localhost:8080/api/admin/generateAllPublicationsReport', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, router);

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
  
const generateUserReport = async (iin) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Авторизуйтесь перед генерацией отчета.');
      router.push('/login');
      return;
    }

    const response = await makeAuthenticatedRequest(
      `http://localhost:8080/api/admin/generateUserReport`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ iin }), // Send the user's IIN as part of the request body
      },
      router
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${iin}_report.docx`; // Set the filename based on user IIN
      document.body.appendChild(a); // Append to the document
      a.click(); // Trigger the download
      a.remove(); // Clean up
    } else {
      // Log the error response for more information
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      alert(`Ошибка при генерации отчета по пользователю: ${errorText}`);
    }
  } catch (error) {
    console.error('Error in generateUserReport:', error);
    alert('Произошла ошибка при генерации отчета по пользователю.');
  }
};

  const handleYearRangeChange = (e, type) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : '';
    setYearRange(prev => ({
      ...prev,
      [type]: value,
    }));
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
      <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
        <div className="flex flex-col items-center w-full max-w-4xl mb-6"> {/* Center-align container */}
          <h1 className="text-2xl font-bold">Публикации всех сотрудников</h1>
          <button
            onClick={generateReport}
            className="mt-2 py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Генерировать отчет
          </button>
        </div>

        <div className="flex gap-4 mb-8 w-full max-w-4xl justify-center">
          <div className="flex flex-col items-start">
            <label className="mb-1 font-semibold">Фильтр по пользователю:</label>
            <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="px-3 py-2 border rounded-md">
              <option value="">Все пользователи</option>
              {users.map((user, index) => (
                <option key={index} value={user.iin}>{user.fullName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-start">
            <label className="mb-1 font-semibold">Фильтр по высшей школе:</label>
            <select
              value={selectedHigherSchool}
              onChange={e => setSelectedHigherSchool(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Все высшие школы</option>
              {higherSchools.map((school, index) => (
                <option key={index} value={school}>{school}</option>
              ))}
            </select>
          </div>

<div className="flex flex-col items-start">
  <label className="mb-1 font-semibold">Диапазон по годам:</label>
  <div className="flex space-x-2">
    {/* "От" (from) dropdown */}
    <select
      value={yearRange.from}
      onChange={e => handleYearRangeChange(e, 'from')}
      className="px-3 py-2 border rounded-md"
    >
      <option value="">От</option>
      {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>

    {/* "До" (to) dropdown */}
    <select
      value={yearRange.to}
      onChange={e => handleYearRangeChange(e, 'to')}
      className="px-3 py-2 border rounded-md"
    >
      <option value="">До</option>
      {Array.from({ length: maxYear - (yearRange.from || minYear) + 1 }, (_, i) => (yearRange.from || minYear) + i).map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>
</div>

        </div>

        <div className="w-full max-w-4xl">
          {filteredPublications.length > 0 ? (
            filteredPublications.map((publication, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-md bg-white max-w-lg mx-auto text-left">
                <p><strong>Тип публикации:</strong> {publicationTypeMap[publication.publicationType]}</p>
                <p><strong>Авторы:</strong> {publication.authors}</p>
                <p><strong>Название статьи:</strong> {publication.title}</p>
                <p><strong>Год:</strong> {publication.year}</p>
                <p><strong>Выходные данные:</strong> {publication.output}</p>
                {publication.doi && <p><strong>Ссылки, DOI:</strong> {publication.doi}</p>}
                {publication.isbn && <p><strong>ISBN:</strong> {publication.isbn}</p>}
                <p><strong>Пользователь:</strong> 
                  <Link href={`/admin/user/${publication.iin}`} className="text-blue-500 hover:underline">
                    {publication.iin}
                  </Link>
                </p>
                {publication.file && (
                  <p>
                    <strong>Файл:</strong> <a target="_blank" href={`http://localhost:8080/${publication.file}`} download className="text-blue-600 hover:underline">Скачать файл</a>
                  </p>
                )}
                <button
                  onClick={() => generateUserReport(publication.iin)}
                  className="mt-2 py-1 px-3 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none"
                >
                  Генерировать отчет по пользователю
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">Нет публикаций для отображения.</p>
          )}
        </div>
      </div>
    </>
  );
}