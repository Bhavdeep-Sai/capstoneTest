import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './utilityComponents/Navbar/Navbar'
import Footer from './utilityComponents/Footer/Footer'
import { Box } from '@mui/material'

const Client = () => {
    return (
        <div>
            <Box sx={{height:"80vh"}} component={'div'}>
                <Outlet />
            </Box>
        </div>
    )
}

export default Client
