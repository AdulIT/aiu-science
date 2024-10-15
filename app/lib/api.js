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

  if (response.ok) {
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } else {
    console.error('Ошибка при обновлении Access Token:', data.message);
    return null;
  }
}

// Функция для выполнения аутентифицированных запросов
export async function makeAuthenticatedRequest(endpoint, options = {}, router) {
  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      router.push('/login'); // Перенаправление на логин, если не удалось обновить токен
      return null; // Возвращаем null, чтобы избежать выполнения запроса
    }
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };

  let response = await fetch(endpoint, options);

  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(endpoint, options); // Повторный запрос с новым токеном
    } else {
      router.push('/login'); // Перенаправляем на логин, если не удалось обновить токен
      return null; // Возвращаем null, чтобы избежать выполнения запроса
    }
  }

  return response;
}