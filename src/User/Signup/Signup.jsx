import React, { useState } from 'react'
import axiosInstance from '../../Services/Interceptors/userInterceptor.js'


function Signup() {
    const [formData,setFormData]=useState({
        name:'',
        email:'',
        password:'',
        confirmPassword:''
    })
    
    const handleChange=(e)=>{
        const{name,value}=e.target
        setFormData({...formData,[name]:value})
    }
    const handleSubmit=async(e)=>{
        e.preventDefault()
        try {
          const response=await axiosInstance.post('/user-signup',formData)
          if(response.data.success){
            Swal.fire({
              title: 'Success!',
              text: response.data.message,
              icon: 'success',
              timer: 5000, 
              position: 'top-center', 
            }).then((result) => {
              if (result.isConfirmed) {
                navigate('/user-login');
              }
            })
          }else{
            Swal.fire({
              title: 'Error!',
              text: response.data.message,
              icon: 'error',
              timer: 5000,
              position: 'top-center',
            })
          }
        } catch (error) {
          
        }
        
    }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-md w-96">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign Up
        </button>
      </form>
    </div>
  </div>
  )
}

export default Signup
