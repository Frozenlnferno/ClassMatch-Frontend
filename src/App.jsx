import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import SignUpPage from "./features/auth/signupPage.jsx";
import LoginPage from "./features/auth/loginPage.jsx";
import MyGroupsPage from "./features/groups/mygroups/groupsPage.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout/>}>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/mygroups" element={<MyGroupsPage/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
