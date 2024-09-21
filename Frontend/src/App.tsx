// import React from 'react'
import './index.css'
import Home from './pages/home.page.tsx'
import Signin from './pages/Signin.page.tsx'
import Signup from './pages/Signup.page.tsx'
import { Routes, Route, Outlet } from "react-router-dom";
import { createContext, useEffect, useState } from 'react';
import Navbar from './components/navbar.component.tsx';
import Editor from './pages/Editor.page.tsx';

export const AuthContext = createContext<any>({});
function App() {
  const userr = localStorage.getItem("userAuth");
  const [userAuth, setUserAuth] = useState<any>(null)

  useEffect(() => {
    if (userr) {
      setUserAuth(JSON.parse(userr))
    }
  }, [])
  return (
    <AuthContext.Provider value={{ userAuth, setUserAuth }} >
      <Routes>
        <Route path='/' element={<Layout />} >
          <Route path="" element={<Home />} />
          <Route path='signin' element={<Signin />} />
          <Route path='signup' element={<Signup />} />
        </Route>
        <Route path='/editor' element={<Editor />}></Route>
      </Routes>
    </AuthContext.Provider>
  )
}

const Layout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default App
