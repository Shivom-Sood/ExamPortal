// every call to the backend goes through this file
const API_URL = import.meta.env.VITE_API_URL;

// sends one request to the backend
const sendRequest = (path, method, body, token) => {
    const options = {
        method: method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (token) {
        options.headers.Authorization = 'Bearer ' + token;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    return fetch(API_URL + path, options);
}

// access token lasts only 15 min, so we get a new one using the refresh token
const getNewAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return null;
    }

    const res = await sendRequest('/api/auth/refresh', 'POST', { refreshToken: refreshToken });
    if (!res.ok) {
        return null;
    }

    const data = await res.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
}

// use this in every page: apiRequest('/api/exams') or apiRequest('/api/exams', 'POST', {...})
export const apiRequest = async (path, method = 'GET', body = null) => {
    let res = await sendRequest(path, method, body, localStorage.getItem('accessToken'));

    // 401 = token expired -> get a new token and try one more time
    if (res.status === 401 && localStorage.getItem('refreshToken')) {
        const newToken = await getNewAccessToken();

        if (newToken) {
            res = await sendRequest(path, method, body, newToken);
        } else {
            // refresh token also expired -> logout
            localStorage.clear();
            window.location.href = '/login';
            throw new Error('Session expired, please login again');
        }
    }

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
}