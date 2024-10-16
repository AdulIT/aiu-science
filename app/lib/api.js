// Функция для обновления токена
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.error('Отсутствует Refresh Token');
    return null;
  }

  const response = await fetch('http://localhost:8080/api/auth/refresh-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (response.ok && data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } else {
    console.error('Ошибка при обновлении Access Token:', data.message);
    return null;
  }
}

export async function makeAuthenticatedRequest(endpoint, options = {}, router) {
  let accessToken = localStorage.getItem('accessToken');

  // Если accessToken отсутствует, не пытаемся обновить токен, просто возвращаем null
  if (!accessToken) {
    return null; // Не делаем запрос с отсутствующим токеном
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };

  const response = await fetch(endpoint, options);

  // Если токен недействителен, пробуем обновить токен
  if (response.status === 401) {
    accessToken = await refreshAccessToken(); // Пробуем обновить токен
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      return fetch(endpoint, options); // Повторяем запрос с обновленным токеном
    } else {
      // Перенаправляем на логин, если не удалось обновить токен
      if (router) {
        router.push('/login');
      } else {
        window.location.href = '/login';
      }
      return null;
    }
  }

  return response;
}