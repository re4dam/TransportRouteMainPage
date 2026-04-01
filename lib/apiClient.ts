const BASE_URL = 'http://localhost:5285/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const response = await fetch(url, options);

    // 🚨 CENTRALIZED ERROR INTERCEPTOR
    if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status}`;

        try {
            // Try to parse the C# error payload
            const errorData = await response.json();

            // 1. Is it an ASP.NET Core Validation Error? (400 Bad Request)
            if (errorData && errorData.errors) {
                errorMessage = Object.values(errorData.errors).flat().join(' ');
            } 
            // 2. Is it from our Custom Exception Middleware? (500 Internal Server Error)
            else if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
        } catch (e) {
            // If the server didn't send JSON (e.g., a hard 404 text page), try to grab the text
            const text = await response.text().catch(() => null);
            if (text) errorMessage = text;
        }

        // Throw the clean, readable string!
        throw new Error(errorMessage);
    }

    // If everything is OK, just return the response as normal
    return response;
}