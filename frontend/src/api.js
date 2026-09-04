export function getToken() {
    return localStorage.getItem("token");
  }
  
  export function setToken(token) {
    localStorage.setItem("token", token);
  }
  
  export function clearToken() {
    localStorage.removeItem("token");
  }
  
  export async function apiFetch(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    };
  
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    return fetch(path, { ...options, headers });
  }