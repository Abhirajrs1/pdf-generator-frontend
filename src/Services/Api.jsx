import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react'
import Signup from "../User/Signup/Signup";
import Home from "../User/Home";
import Login from "../User/Login/Login";
import PrivateRoutes, { PublicRoutes } from "./PrivateRoutes";


function Api() {
  return (
    <>
    <Router>
        <Routes>

        <Route element={<PublicRoutes/>}>
          <Route path="/user-signup" element={<Signup/>}/>
          <Route path="/user-login" element={<Login/>}/>
        </Route>
        
        <Route element={<PrivateRoutes/>}>
            <Route path="/" element={<Home/>}/>
        </Route>


        </Routes>
    </Router>
      
    </>
  )
}

export default Api
