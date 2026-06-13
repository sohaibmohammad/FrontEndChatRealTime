import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Home from './Pages/Home'
 
function App() {
  const [count, setCount] = useState(0)

  return (
 <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية للـ Login */}
        <Route path="/" element={<Login />} />
     <Route path="/home" element={<Home />} /> {/* رابط صفحة المحادثات */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
