import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react'
import Signup from "../User/Signup/Signup";
import Home from "../User/Home";


function Api() {
  return (
    <>
    <Router>
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/user-signup" element={<Signup/>}/>
        </Routes>
    </Router>
      
    </>
  )
}

export default Api
