const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`; // Replace with your C# port

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include", // <-- CRITICAL: Tells the browser to attach the HttpOnly cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn"); // Clear our UI flag
      window.location.href = "/login"; 
    }
  }

  return response;
}

/*
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // 1. Safely check for the token (Next.js does Server-Side Rendering, 
  // so we must ensure 'window' exists before accessing localStorage)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  // 2. Set up default headers, but allow overriding
  const headers = new Headers(options.headers);

  // 3. Inject the Authorization header if we have a token
  // Only set JSON content type if caller didn't provide one and body isn't FormData
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 4. Execute the fetch call
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 5. Global Security Catch: If the C# API ever returns 401 Unauthorized 
  // (meaning the token is expired or invalid), instantly log the user out.
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login"; 
    }
  }

  return response;
}
*/