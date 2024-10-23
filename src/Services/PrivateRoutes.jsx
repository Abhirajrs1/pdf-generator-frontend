import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

function PrivateRoutes() {
    const token=localStorage.getItem('token')
  return token? <Outlet/> :<Navigate to={'/user-login'}/>
}
export default PrivateRoutes

export function PublicRoutes(){
    const token=localStorage.getItem('token')
    return token?<Navigate to={'/'}/> :<Outlet/>
}
