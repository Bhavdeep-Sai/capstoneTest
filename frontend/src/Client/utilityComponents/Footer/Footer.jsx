import { Typography } from '@mui/material'
import Box from '@mui/material/Box';
import React from 'react'

const Footer = () => {
  return (
    <div>
      <Box sx={{display:"flex", justifyContent:"center" , alignItems:"center", flexDirection:"column"}} component={'div'}>
        <Typography variant='h5'>School Management System</Typography>
        <Typography variant='p'>Copyright@2024</Typography>
      </Box>
    </div>
  )
}

export default Footer
