import { Box, Button, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { baseApi } from "../../../environment";
import { subjectSchema } from "../../../yupSchema/subjectSchema";
import axios from "axios";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Subjects = () => {

  const [message, setMessage] = useState("");

  const [subjects, setSubjects] = useState();
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchsubjects = async () => {
    axios
      .get(`${baseApi}/subject/all`)
      .then((res) => {
        setSubjects(res.data.data);
      })
      .catch((err) => {
        console.log("Error in fetching subjects", err);
      });
  };
  useEffect(() => {
    fetchsubjects();
  }, [message]);

  const formik = useFormik({
    initialValues: {
      subjectName: "",
      subjectCode: "",
    },
    validationSchema: subjectSchema,
    onSubmit: (values) => {
      console.log(values);
      if (edit) {

        axios
          .put(`${baseApi}/subject/update/${editId}`, { ...values })
          .then((res) => {
            setEdit(false);
            setMessage(res.data.message)
          })
          .catch((e) => {
            console.log("Error", e);
          });

        formik.resetForm();
      } else {
        
        axios
          .post(`${baseApi}/subject/create`, { ...values })
          .then((res) => {
            setMessage(res.data.message)
          })
          .catch((e) => {
            console.log("Error", e);
          });

        formik.resetForm();
      }
    },
  });

  const handleEdit = async (id, subjectName, subjectCode) => {
    console.log(id);
    setEdit(true);
    setEditId(id);
    formik.setFieldValue("subjectName", subjectName)
    formik.setFieldValue("subjectCode", subjectCode)
  };


  const handleCancelEdit = async () => {
    setEdit(false);
    setEditId(null);
    formik.setFieldValue("subjectName", "")
    formik.setFieldValue("subjectCode", "")
  }

  const handleDelete = async (id) => {
    axios.delete(`${baseApi}/subject/delete/${id}`)
      .then(res => {
        setMessage(res.data.message)
      }).catch(err => {
        console.log("Error in deleting", err);
      })
  };

  return (
    <div>
      {message && <p>{message}</p>}
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1 },
          display: "flex",
          flexDirection: "column",
          margin: "50px",
          justifyContent: "center",
          width: "80vw",
          minWidth: "320px",
          maxWidth: "500px",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
          bgcolor: "background.paper",
        }}
        className="bg-gray-800 border border-gray-700"
        noValidate
        autoComplete="off"
        onSubmit={formik.handleSubmit}
      >
        {edit ? (
          <div className="flex items-center justify-center mb-4">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "text.primary", m: 0 }}
            >
              Edit Subject
            </Typography>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-4">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "text.primary", m: 0 }}
            >
              Add New Subject
            </Typography>
          </div>
        )}

        <TextField
          name="subjectName"
          label="Subject Name"
          value={formik.values.subjectName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
          helperText={formik.touched.subjectName && formik.errors.subjectName}
          sx={{ mb: 3 }}
        />

        <TextField
          name="subjectCode"
          label="Subject Code"
          value={formik.values.subjectCode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.subjectCode && Boolean(formik.errors.subjectCode)}
          helperText={formik.touched.subjectCode && formik.errors.subjectCode}
          sx={{ mb: 3 }}
        />

        {edit ? (
          <div className="flex gap-10">
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 1,
                py: 1.5,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-600"
            >
              Save
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                mt: 1,
                py: 1.5,
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
              onClick={() => handleCancelEdit()}
              className="bg-gradient-to-r from-gray-500 to-gray-600"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 1,
              py: 1.5,
              textTransform: "uppercase",
              fontWeight: "bold",
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-600"
          >
            Add Subject
          </Button>
        )}
      </Box>

      <div className="flex flex-wrap gap-10">
        {subjects &&
          subjects.map((item) => (
            <div key={item._id} className="px-10 m-5 border-2 border-black">
              <h1>{item.subjectName}</h1>
              <p>{item.subjectCode}</p>
              <div>
                <Button onClick={() => handleEdit(item._id, item.subjectName, item.subjectCode)}>
                  <EditIcon />
                </Button>
                <Button onClick={() => handleDelete(item._id)}>
                  <DeleteIcon />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Subjects;
