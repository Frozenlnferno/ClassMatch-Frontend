import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import SignUpPage from "./features/auth/signupPage.jsx";
import LoginPage from "./features/auth/loginPage.jsx";
import MyGroupsPage from "./features/groups/mygroups/groupsPage.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";
import LandingPage from "./features/landing/LandingPage.jsx";
import { ProtectedRoute, PublicRoute } from "./components/RouteGuards.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DefaultLayout/>}>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/signup" element={<PublicRoute element={<SignUpPage/>} />} />
          <Route path="/login" element={<PublicRoute element={<LoginPage/>} />} />
          <Route path="/mygroups" element={<ProtectedRoute element={<MyGroupsPage/>} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
