const url = process.env.NEXT_PUBLIC_API_URL;

if (!url) {
  console.error('NEXT_PUBLIC_API_URL не задан в окружении');
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    console.error('Отсутствует Refresh Token');
    return null;
  }

  try {
    const response = await fetch(`${url}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } else {
      throw new Error('Ошибка при обновлении токена');
    }
  } catch (error) {
    console.error('Ошибка при обновлении токена:', error);
    if (router) {
      router.push('/login');
    } else {
      window.location.href = '/login';
    }
  }
}

export async function makeAuthenticatedRequest(endpoint, options = {}, router, retry = true) {
  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return null;
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };

  try {
    const response = await fetch(endpoint, options);

    if (response.status === 401 && retry) {
      accessToken = await refreshAccessToken();
      if (accessToken) {
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        return makeAuthenticatedRequest(endpoint, options, router, false);
      } else {
        if (router) {
          router.push('/login');
        } else {
          window.location.href = '/login';
        }
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  }
}