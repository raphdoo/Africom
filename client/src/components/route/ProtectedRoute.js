import React from 'react'
import {Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'


const ProtectedRoute = ({ isAdmin, children }) => {
    const { isAuthenticated, loading , user} = useSelector(state => state.auth)
    if(isAdmin === true){
        if(user.role === 'admin'){
            return(children)
        }
        else
        {
        return <Navigate to='/' replace/>
        }
    }
    else{
    return ( (loading===false && isAuthenticated=== true) ? (
        children
        ) :
    <Navigate to='/login' replace />    )}
}

export default ProtectedRoute