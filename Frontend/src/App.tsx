// import React from 'react'
import './index.css'
import 'react-image-crop/dist/ReactCrop.css'
import Home from './pages/home.page.tsx'
import Signin from './pages/Signin.page.tsx'
import Signup from './pages/Signup.page.tsx'
import { Routes, Route, Outlet } from "react-router-dom";
import { createContext, useEffect, useState } from 'react';
import Navbar from './components/navbar.component.tsx';
import Editor from './pages/Editor.page.tsx';
import { MutatingDots } from 'react-loader-spinner'
import Search from './pages/Search.page.tsx';
import NotFound404 from './pages/404.page.tsx';
import ProfilePage from './pages/ProfilePage.page.tsx';
import BlogPage from './pages/BlogPage.page.tsx';
import SideNav from './components/SideNav.component.tsx';
import ChangePassword from './pages/ChangePassword.page.tsx';
import EditProfile from './pages/EditProfile.page.tsx';

type userType = {
  email: string,
  username: string
  profile_img: string
  token: string
}
export const AuthContext = createContext<any>({});
function App() {
  const userr = localStorage.getItem("userAuth");
  const [userAuth, setUserAuth] = useState<userType>({ email: "", username: "", profile_img: "", token: "" })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")

  useEffect(() => {
    const f = async () => {
      if (userr) {
        const parsedUser = await JSON.parse(userr);
        setUserAuth(parsedUser);
        setLoading(false)
      }
    }
    f()
  }, [userr])

  if (loading) {
    return <div className='flex justify-center items-center mt-56'><MutatingDots
      visible={true}
      height="100"
      width="100"
      color="black"
      secondaryColor="black"
      radius="12.5"
      ariaLabel="mutating-dots-loading"
      wrapperStyle={{}}
      wrapperClass=""
    /></div>
  }
  return (
    <AuthContext.Provider value={{ userAuth, setUserAuth, filter, setFilter }} >
      <Routes>
        <Route path='/' element={<Layout />} >
          <Route index element={<Home />} />
          <Route path='signin' element={<Signin />} />
          <Route path='signup' element={<Signup />} />
          <Route path='search' element={<Search />} />
          <Route path='user/:id' element={<ProfilePage />} />
          <Route path='settings' element={<SideNav />}>
            <Route path='edit-profile' element={<EditProfile />}></Route>
            <Route path='change-password' element={<ChangePassword />}></Route>
          </Route>
          <Route path='blog/:blog_id' element={<BlogPage />} />
          <Route path='*' element={<NotFound404 />} />
        </Route>
        <Route path='/editor' element={<Editor />}></Route>
        <Route path='/editor/:blog_id' element={<Editor />}></Route>
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
