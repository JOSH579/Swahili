import { useState } from "react";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  const [page, setPage] = useState("register");

  if (page === "login") {
    return <LoginPage onGoToRegister={() => setPage("register")} />;
  }

  return <RegisterPage onGoToLogin={() => setPage("login")} />;
}
