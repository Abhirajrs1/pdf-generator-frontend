import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react'
import Signup from "../User/Signup/Signup";
import Home from "../User/Home";
import Login from "../User/Login/Login";


function Api() {
  return (
    <>
    <Router>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/user-signup" element={<Signup/>}/>
            <Route path="/user-login" element={<Login/>}/>
        </Routes>
    </Router>
      
    </>
  )
}

export default Api
