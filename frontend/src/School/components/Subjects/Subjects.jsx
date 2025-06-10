import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Container,
  Grid,
  Alert,
  Fade,
  IconButton,
  Chip,
  Paper,
  useTheme,
  useMediaQuery,
  Collapse
} from "@mui/material";
import { useFormik } from "formik";
import { baseApi } from "../../../environment";
import { subjectSchema } from "../../../yupSchema/subjectSchema";
import axios from "axios";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BookIcon from "@mui/icons-material/Book";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";

const Subjects = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [subjects, setSubjects] = useState([]);
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseApi}/subject/all`);
      setSubjects(response.data.data || []);
    } catch (err) {
      console.log("Error in fetching subjects", err);
      setMessage("Failed to fetch subjects");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const formik = useFormik({
    initialValues: {
      subjectName: "",
      subjectCode: "",
    },
    validationSchema: subjectSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (edit) {
          const response = await axios.put(`${baseApi}/subject/update/${editId}`, values);
          setEdit(false);
          setEditId(null);
          setMessage(response.data.message || "Subject updated successfully");
          setMessageType("success");
        } else {
          const response = await axios.post(`${baseApi}/subject/create`, values);
          setMessage(response.data.message || "Subject created successfully");
          setMessageType("success");
        }
        formik.resetForm();
        setShowForm(false);
        fetchSubjects();
      } catch (error) {
        console.log("Error", error);
        setMessage("Operation failed. Please try again.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleEdit = (id, subjectName, subjectCode) => {
    setEdit(true);
    setEditId(id);
    setShowForm(true);
    formik.setFieldValue("subjectName", subjectName);
    formik.setFieldValue("subjectCode", subjectCode);
    // Scroll to form on mobile
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCancelEdit = () => {
    setEdit(false);
    setEditId(null);
    setShowForm(false);
    formik.resetForm();
  };

  const handleAddNewSubject = () => {
    setEdit(false);
    setEditId(null);
    formik.resetForm();
    setShowForm(true);
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      setLoading(true);
      try {
        const response = await axios.delete(`${baseApi}/subject/delete/${id}`);
        setMessage(response.data.message || "Subject deleted successfully");
        setMessageType("success");
        fetchSubjects();
      } catch (err) {
        console.log("Error in deleting", err);
        setMessage("Failed to delete subject");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      py: 2
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          mb: 4,
          gap: isMobile ? 2 : 0
        }}>
          <Box>
            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: '#ffffff',
                mb: 0.5
              }}
            >
              Subject Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
              Manage your academic subjects efficiently
            </Typography>
          </Box>
          
          {!showForm && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddNewSubject}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: '#ff8c00',
                '&:hover': {
                  backgroundColor: '#e67e00',
                  color:"#1e1e1e"
                }
              }}
            >
              Add New Subject
            </Button>
          )}
        </Box>

        {/* Alert Message */}
        <Fade in={!!message}>
          <Box sx={{ mb: 3 }}>
            {message && (
              <Alert 
                severity={messageType} 
                onClose={() => setMessage("")}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: messageType === 'success' ? 'rgba(255, 140, 0, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                  color: messageType === 'success' ? '#ffb84d' : '#ff6b6b',
                  border: `1px solid ${messageType === 'success' ? '#ff8c00' : '#f44336'}`,
                  '& .MuiAlert-message': {
                    fontSize: '1rem'
                  },
                  '& .MuiAlert-icon': {
                    color: messageType === 'success' ? '#ff8c00' : '#f44336'
                  }
                }}
              >
                {message}
              </Alert>
            )}
          </Box>
        </Fade>

        <Grid container spacing={3}>
          {/* Form Section */}
          <Grid item sx={{width:"40%", margin:'auto'}} xs={12} lg={showForm ? 4 : 0}>
            <Collapse in={showForm} timeout={300}>
              <Paper
                elevation={3}
                sx={{
                  position: { lg: 'sticky' },
                  top: { lg: 24 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040'
                }}
              >
                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ p: 3 }}
                >
                  {/* Form Header with Close Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: 'rgba(255, 140, 0, 0.15)',
                          mr: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {edit ? <EditIcon sx={{ color: '#ff8c00', fontSize: 20 }} /> : <AddIcon sx={{ color: '#ff8c00', fontSize: 20 }} />}
                      </Box>
                      <Typography variant="h6" fontWeight={600} sx={{ color: '#ffffff' }}>
                        {edit ? "Edit Subject" : "Add New Subject"}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => setShowForm(false)}
                      size="small"
                      sx={{
                        color: '#b0b0b0',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 140, 0, 0.1)',
                          color: '#ff8c00'
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  {/* Form Fields */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      name="subjectName"
                      label="Subject Name"
                      value={formik.values.subjectName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                      helperText={formik.touched.subjectName && formik.errors.subjectName}
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          '& fieldset': {
                            borderColor: '#404040'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ff8c00'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ff8c00'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#b0b0b0',
                          '&.Mui-focused': {
                            color: '#ff8c00'
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ff6b6b'
                        },
                        '& input::placeholder': {
                          color: '#666666',
                          opacity: 1
                        }
                      }}
                    />

                    <TextField
                      name="subjectCode"
                      label="Subject Code"
                      placeholder="e.g., MATH101, PHY201, ENG105"
                      value={formik.values.subjectCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
                      helperText={formik.touched.subjectCode && formik.errors.subjectCode}
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#1a1a1a',
                          color: '#ffffff',
                          '& fieldset': {
                            borderColor: '#404040'
                          },
                          '&:hover fieldset': {
                            borderColor: '#ff8c00'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#ff8c00'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          color: '#b0b0b0',
                          '&.Mui-focused': {
                            color: '#ff8c00'
                          }
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#ff6b6b'
                        },
                        '& input::placeholder': {
                          color: '#666666',
                          opacity: 1
                        }
                      }}
                    />

                    {/* Form Actions */}
                    {edit ? (
                      <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row', mt: 1 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={loading}
                          fullWidth={isMobile}
                          sx={{
                            py: 1.2,
                            px: 3,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            backgroundColor: '#4caf50',
                            color: '#1a1a1a',
                            '&:hover': {
                              backgroundColor: '#45a049'
                            }
                          }}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelEdit}
                          disabled={loading}
                          fullWidth={isMobile}
                          sx={{
                            py: 1.2,
                            px: 3,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: '#f44336',
                            color: '#f44336',
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)'
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled={loading}
                        fullWidth
                        sx={{
                          py: 1.2,
                          px: 3,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          mt: 1,
                          backgroundColor: '#ff8c00',
                          color: '#1a1a1a',
                          '&:hover': {
                            backgroundColor: '#e67e00'
                          }
                        }}
                      >
                        Add Subject
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Collapse>
          </Grid>

          {/* Subjects Grid Section */}
          <Grid sx={{width:"100vw"}} xs={12} lg={showForm ? 8 : 12}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h5" fontWeight={600} sx={{ color: '#ffffff' }}>
                Subjects
              </Typography>
              <Chip 
                label={`${subjects.length} ${subjects.length === 1 ? 'Subject' : 'Subjects'}`}
                variant="outlined"
                icon={<BookIcon />}
                sx={{
                  borderColor: '#ff8c00',
                  color: '#ff8c00',
                  backgroundColor: 'rgba(255, 140, 0, 0.1)',
                  '& .MuiChip-icon': {
                    color: '#ff8c00'
                  }
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: '#b0b0b0' }}>
                  Loading subjects...
                </Typography>
              </Box>
            ) : subjects.length === 0 ? (
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040'
                }}
              >
                <BookIcon sx={{ fontSize: 64, color: '#666666', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 1 }}>
                  No subjects found
                </Typography>
                <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                  Start by adding your first subject using the "Add New Subject" button
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2.5}>
                {subjects.map((item, index) => (
                  <Grid item xs={12} className="m-auto lg:m-0" sm={6} lg={showForm ? 6 : 4} xl={showForm ? 4 : 3} key={item._id}>
                    <Fade in timeout={300 + index * 50}>
                      <Card
                        elevation={2}
                        sx={{
                          height: '100%',
                          minWidth:{md:"250px", xs:'320px'},
                          borderRadius: 2,
                          transition: 'all 0.2s ease-in-out',
                          backgroundColor: '#1e1e1e',
                          border: '1px solid #404040',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: '#ff8c00',
                            boxShadow: '0 4px 12px rgba(255, 140, 0, 0.2)',
                            '& .action-buttons': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5, pb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: 'rgba(255, 140, 0, 0.15)',
                                mr: 2,
                                minWidth: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <BookIcon sx={{ color: '#ff8c00', fontSize: 18 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography 
                                variant="h6" 
                                fontWeight={600} 
                                sx={{ 
                                  mb: 1,
                                  wordBreak: 'break-word',
                                  lineHeight: 1.3,
                                  color: '#ffffff',
                                  fontSize: '1.1rem'
                                }}
                              >
                                {item.subjectName}
                              </Typography>
                              <Chip
                                label={item.subjectCode}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  height: 22,
                                  borderColor: '#ffd54f',
                                  color: '#ffd54f',
                                  backgroundColor: 'rgba(255, 213, 79, 0.1)'
                                }}
                              />
                            </Box>
                          </Box>
                        </CardContent>

                        <CardActions 
                          className="action-buttons"
                          sx={{ 
                            p: 2, 
                            pt: 0,
                            opacity: isMobile ? 1 : 0.7,
                            transition: 'opacity 0.2s ease-in-out',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <IconButton
                            onClick={() => handleEdit(item._id, item.subjectName, item.subjectCode)}
                            disabled={loading}
                            size="small"
                            sx={{
                              color: '#ff8c00',
                              backgroundColor: 'rgba(255, 140, 0, 0.1)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 140, 0, 0.2)'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(item._id)}
                            disabled={loading}
                            size="small"
                            sx={{
                              color: '#f44336',
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              ml: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(244, 67, 54, 0.2)'
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Subjects;