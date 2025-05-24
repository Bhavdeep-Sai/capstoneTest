import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import { baseApi } from '../../../../environment';

export default function Gallery() {
    const [open, setOpen] = React.useState(false);
    const [selectedSchool, setSelectedSchool] = React.useState(null);
    const [schools, setSchools] = React.useState([]);

    React.useEffect(() => {
        axios.get(`${baseApi}/school/all`)
            .then(res => {
                console.log("School", res)
                setSchools(res.data.schools)
            })
            .catch(e => { console.log("error", e) })
    }, [])


    const handleOpen = (school) => {
        setOpen(true)
        setSelectedSchool(school)
    }

    const handleClose = () => {
        setOpen(false);
        setSelectedSchool(null)
    }

    const style = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: "60%",
        display: "flex",
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Box>
            <Typography variant='h4' sx={{textAlign:"center", marginTop:"40px", marginBottom:"20px"}}>Registered Schools</Typography>
            <ImageList sx={{ width: "100%", height: "auto" }} cols={3} rowHeight={200}>
                {schools.map((school, _id) => (
                    <div key={_id}>
                        <ImageListItem>
                            <img
                                srcSet={`./images/uploaded/school/${school.schoolImg}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                src={`./images/uploaded/school/${school.schoolImg}?w=164&h=164&fit=crop&auto=format`}
                                alt={school.schoolName}
                                loading="lazy"
                                onClick={() => handleOpen(school)}
                                className='max-h-[100%]'
                            />
                        </ImageListItem>
                        <h2>{school.schoolName}</h2>
                    </div>
                ))}
            </ImageList>

            <div>
                <Modal
                    open={open && selectedSchool}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{position:"absolute", top:"50%", left:"50%",
                        transform:'translate(-50%, -50%)',
                        background:"black",
                        padding:"10px",
                        borderRadius:"10px",
                    }}>
                        <h1 className='text-center font-bold text-2xl  text-orange-500'>{selectedSchool && selectedSchool.schoolName}</h1>
                        <img
                            // srcSet={`./images/uploaded/school/${selectedSchool && selectedSchool.img}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                            src={selectedSchool && `./images/uploaded/school/${selectedSchool.schoolImg}`}
                            alt={"alt"}
                            loading="lazy"
                        className='max-h-[80vh] min-h-[60vh] w-auto '
                        />
                    </Box>
                </Modal>
            </div>
        </Box>
    );
}
