"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { makeAuthenticatedRequest } from '../lib/api';
import Navbar from '../../components/Navbar';
import { jwtDecode } from 'jwt-decode';

export default function UserResume() {
  const router = useRouter();
  const params = useParams();
  const iin = params.iin;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
  
    if (!token) {
      router.push('/login');
    } else {
      const fetchUserData = async () => {
        try {
          // const decodedToken = jwtDecode(token);
          // setIsAdmin(decodedToken.role === 'admin');

          const endpoint = `${url}/api/user/profile`;

          const response = await makeAuthenticatedRequest(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }, 
          router
          );
      
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setIsLoading(false);
          } else {
            const errorText = await response.text();
            console.error('Ошибка при загрузке данных пользователя:', errorText);
            router.push('/login');
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error);
          router.push('/login');
        }
      };
  
      fetchUserData();
    }
  }, [router, iin]);

  const generateResume = async (format) => {
    try {
      const response = await makeAuthenticatedRequest(`${url}/api/user/generateResume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iin }),
      }, 
      router
      );
      
      const data = await response.json();
      console.log(data);
      if (format === 'docx') {
        window.open(`${url}/api/user/downloadResumeDocx?path=${data.docxPath}`);
      } else if (format === 'pdf') {
        window.open(`${url}/api/user/downloadResumePdf?path=${data.pdfPath}`);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <>
      <Navbar role="user" />
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-4">Резюме пользователя: {user.fullName}</h1>
        <div className="mb-6">
          <p><strong>ИИН:</strong> {user.iin}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Телефон:</strong> {user.phone}</p>
          <p><strong>Научные интересы:</strong> {user.researchArea}</p>
        </div>

        <div className="mt-4">
          <button
            onClick={() => generateResume('docx')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg mr-4 hover:bg-blue-700"
          >
            Скачать DOCX
          </button>
          <button
            onClick={() => generateResume('pdf')}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Скачать PDF
          </button>
        </div>
      </div>
    </>
  );
}