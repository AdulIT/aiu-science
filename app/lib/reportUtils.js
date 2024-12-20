import { makeAuthenticatedRequest } from './api';

export async function generateReport(url, router) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Авторизуйтесь перед генерацией отчета.');
        router.push('/login');
        return;
      }
  
      const response = await makeAuthenticatedRequest(`${url}/api/admin/generateAllPublicationsReport`, {
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
    
    export async function generateUserReport(url, router, iin) {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Авторизуйтесь перед генерацией отчета.');
        router.push('/login');
        return;
      }
  
      const response = await makeAuthenticatedRequest(
        `${url}/api/admin/generateUserReport`,
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