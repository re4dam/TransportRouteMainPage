// components/CsrfInitializer.tsx
"use client"; // This must be a client component to use useEffect and sessionStorage

import { apiFetch } from '@/lib/apiClient';
import { useEffect } from 'react';

export default function CsrfInitializer() {
    useEffect(() => {
        const fetchCsrf = async () => {
            try {
                // Adjust this URL if your API is on a different port
                const res = await apiFetch('/Auth/csrf-token', {
                    credentials: 'include'
                });
                
                if (res.ok) {
                    const data = await res.json();
                    sessionStorage.setItem('csrf_token', data.token);
                }
            } catch (error) {
                console.error("Failed to initialize CSRF token", error);
            }
        };

        fetchCsrf();
    }, []);

    // This component renders absolutely nothing to the screen
    return null; 
}