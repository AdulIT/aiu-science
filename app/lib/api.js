const url = process.env.NEXT_PUBLIC_API_URL;

if (!url) {
  console.error('NEXT_PUBLIC_API_URL не задан в окружении');
}

export async function refreshAccessToken(router) {
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
  // console.log("makeAuthenticatedRequest called with:");
  // console.log("Endpoint:", endpoint);
  // console.log("Initial Options:", options);

  let accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    console.error("No access token found in localStorage");
    return null;
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
  };
  // console.log("Options with Authorization Header:", options);

  try {
    const response = await fetch(endpoint, options);

    // console.log(`Response status for ${endpoint}:`, response.status);

    if (response.status === 401 && retry) {
      console.warn("Unauthorized. Attempting token refresh...");
      accessToken = await refreshAccessToken(router);
      if (accessToken) {
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        // console.log("Retrying request with refreshed token...");
        return makeAuthenticatedRequest(endpoint, options, router, false);
      } else {
        console.error("Token refresh failed. Redirecting to login.");
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('Ошибка при выполнении запроса:', error.message);
    throw error;
  }
}