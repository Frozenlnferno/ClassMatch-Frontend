import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import SignUpPage from "./features/auth/signupPage.jsx";
import LoginPage from "./features/auth/loginPage.jsx";
import MyGroupsPage from "./features/groups/mygroups/groupsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={ <Navigate to="/login" /> } />
        <Route path="/signup" element={ <SignUpPage />} />
        <Route path="/login" element={ <LoginPage />} />
        <Route path="/mygroups" element={ <MyGroupsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
