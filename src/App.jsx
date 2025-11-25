import { BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css';
import SignUpPage from "./features/auth/signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
