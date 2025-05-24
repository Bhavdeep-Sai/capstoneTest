import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { baseApi } from '../../../environment';
import { FormControl, InputLabel, Select, MenuItem, Box, Button, Alert, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const Attendee = ({ classId }) => {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedClassData, setSelectedClassData] = useState(null);
    const [edit, setEdit] = useState(false);

    // Fetch teachers and class data when component mounts or classId changes
    useEffect(() => {
        if (classId) {
            fetchTeachers();
            fetchSelectedClass();
        }
    }, [classId]);

    // Fetch teachers from the API, filtering by the specific class
    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Use the teacherClass query parameter to filter teachers by class
            const response = await axios.get(`${baseApi}/teacher/fetch-with-query`, {
                params: { teacherClass: classId },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setTeachers(response.data.teachers || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching teachers:", err);
            setMessage({ type: 'error', text: 'Failed to load teachers for this class' });
            setLoading(false);
        }
    };

    const fetchSelectedClass = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${baseApi}/class/${classId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data.data) {
                setSelectedClassData(res.data.data);

                // If class already has an attendee, set it as selected
                if (res.data.data.attendee) {
                    setSelectedTeacher(res.data.data.attendee._id || res.data.data.attendee);
                }
            }
        } catch (error) {
            console.error("Error fetching class data:", error);
            setMessage({ type: 'error', text: 'Failed to load class information' });
        }
    };

    const handleSubmit = async () => {
        if (!selectedTeacher) {
            setMessage({ type: 'error', text: 'Please select a teacher' });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.put(
                `${baseApi}/class/update/${classId}`,
                { attendee: selectedTeacher },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setMessage({ type: 'success', text: 'Attendee assigned successfully' });
            // Refresh class data after successful update
            fetchSelectedClass();
            setLoading(false);
            setEdit(false);
        } catch (error) {
            console.error("Error assigning attendee:", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to assign attendee' });
            setLoading(false);
        }
    };

    // Find the teacher name based on ID
    const getTeacherName = (teacherId) => {
        const teacher = teachers.find(t => t._id === teacherId);
        return teacher ? teacher.name : 'Unknown Teacher';
    };

    return (
        <div className="p-4">
            {message.text && (
                <Alert severity={message.type} className="mb-4" onClose={() => setMessage({ type: '', text: '' })}>
                    {message.text}
                </Alert>
            )}
            <h1 className="text-xl font-bold mb-4">Assign Class Attendee</h1>
            {selectedClassData && selectedClassData.attendee && (
                <h1 className="text-xl font-bold mb-4">
                    Current attendee : {typeof selectedClassData.attendee === 'object' ?
                        selectedClassData.attendee.name : getTeacherName(selectedClassData.attendee)}
                </h1>
            )}


            <IconButton onClick={() => setEdit(true)}>
                <EditIcon />
            </IconButton>
            {edit && <Box className="space-y-4">
                <FormControl fullWidth>
                    <InputLabel id="teacher-select-label">Select Teacher</InputLabel>
                    <Select
                        labelId="teacher-select-label"
                        label="Select Teacher"
                        value={selectedTeacher}
                        onChange={(e) => setSelectedTeacher(e.target.value)}
                        disabled={loading}
                    >
                        <MenuItem value="">None</MenuItem>
                        {teachers.map((teacher) => (
                            <MenuItem key={teacher._id} value={teacher._id}>
                                {teacher.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || !selectedTeacher}
                >
                    {selectedClassData && selectedClassData.attendee ? 'Edit Attendee' : (loading ? 'Submitting...' : 'Assign Attendee')}
                </Button>



                {teachers.length === 0 && !loading && (
                    <p className="text-gray-600 mt-2">
                        No teachers are assigned to this class. Teachers must be assigned to this class to appear in this list.
                    </p>
                )}
            </Box>
            }
        </div>
    );
};

export default Attendee;