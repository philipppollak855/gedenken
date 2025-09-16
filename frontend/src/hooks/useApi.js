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

        // Fallback für API_URL
        const baseUrl = API_URL || 'http://localhost:8000';
        
        try {
            const response = await fetch(`${baseUrl}/api${url}`, {
                ...options,
                headers,
            });

            if (response.status === 401 && authTokens) {
                logoutUser();
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }, [authTokens, logoutUser, API_URL]);

    const apiGet = useCallback(async (url, options = {}) => {
        return await api(url, { ...options, method: 'GET' });
    }, [api]);

    const apiPost = useCallback(async (url, data, options = {}) => {
        return await api(url, { 
            ...options, 
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data)
        });
    }, [api]);

    const apiPut = useCallback(async (url, data, options = {}) => {
        return await api(url, { 
            ...options, 
            method: 'PUT',
            body: data instanceof FormData ? data : JSON.stringify(data)
        });
    }, [api]);

    const apiDelete = useCallback(async (url, options = {}) => {
        return await api(url, { ...options, method: 'DELETE' });
    }, [api]);

    return { api, apiGet, apiPost, apiPut, apiDelete };
};

export default useApi;
export { useApi };
