// frontend/src/hooks/useApi.js
// Verwendet jetzt die Umgebungsvariable für die API-URL.

import { useContext, useCallback } from 'react';
import AuthContext from '../context/AuthContext';

const useApi = () => {
    const { authTokens, logoutUser } = useContext(AuthContext);
    const API_URL = process.env.REACT_APP_API_URL;

    const api = useCallback(async (url, options = {}) => {
        const headers = { ...options.headers };

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (authTokens) {
            headers['Authorization'] = `Bearer ${authTokens.access}`;
        }

        const response = await fetch(`${API_URL}/api${url}`, {
            ...options,
            headers,
        });

        if (response.status === 401 && authTokens) {
            logoutUser();
        }
        
        return response;
    }, [authTokens, logoutUser, API_URL]);

    const get = useCallback(async (url, options = {}) => {
        const response = await api(url, { ...options, method: 'GET' });
        return response;
    }, [api]);

    const post = useCallback(async (url, data, options = {}) => {
        const response = await api(url, {
            ...options,
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
        return response;
    }, [api]);

    const put = useCallback(async (url, data, options = {}) => {
        const response = await api(url, {
            ...options,
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
        return response;
    }, [api]);

    const del = useCallback(async (url, options = {}) => {
        const response = await api(url, { ...options, method: 'DELETE' });
        return response;
    }, [api]);

    return { api, get, post, put, delete: del };
};

export { useApi };
export default useApi;
