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

    return api;
};

export default useApi;
