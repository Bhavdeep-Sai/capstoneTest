import { Box, Button, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { baseApi } from "../../../environment";
import { classSchema } from "../../../yupSchema/classSchema";
import axios from "axios";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const Class = () => {

  const [message, setMessage] = useState("");

  const [classes, setClasses] = useState();
  const [edit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchClasses = async () => {
    axios
      .get(`${baseApi}/class/all`)
      .then((res) => {
        setClasses(res.data.data);
      })
      .catch((err) => {
        console.log("Error in fetching classes", err);
      });
  };
  useEffect(() => {
    fetchClasses();
  }, [message]);

  const formik = useFormik({
    initialValues: {
      classText: "",
      classNum: "",
    },
    validationSchema: classSchema,
    onSubmit: (values) => {
      console.log(values);
      if (edit) {

        axios
          .put(`${baseApi}/class/update/${editId}`, { ...values })
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
          .post(`${baseApi}/class/create`, { ...values })
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

  const handleEdit = async (id, classText, classNum) => {
    console.log(id);
    setEdit(true);
    setEditId(id);
    formik.setFieldValue("classText", classText)
    formik.setFieldValue("classNum", classNum)
  };


  const handleCancelEdit = async () => {
    setEdit(false);
    setEditId(null);
    formik.setFieldValue("classText", "")
    formik.setFieldValue("classNum", "")
  }

  const handleDelete = async (id) => {
    axios.delete(`${baseApi}/class/delete/${id}`)
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
              Edit Class
            </Typography>
          </div>
        ) : (
          <div className="flex items-center justify-center mb-4">
            <Typography
              variant="h5"
              gutterBottom
              sx={{ color: "text.primary", m: 0 }}
            >
              Add New Class
            </Typography>
          </div>
        )}

        <TextField
          name="classText"
          label="Class Name"
          value={formik.values.classText}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.classText && Boolean(formik.errors.classText)}
          helperText={formik.touched.classText && formik.errors.classText}
          sx={{ mb: 3 }}
        />

        <TextField
          name="classNum"
          label="Class Number"
          value={formik.values.classNum}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.classNum && Boolean(formik.errors.classNum)}
          helperText={formik.touched.classNum && formik.errors.classNum}
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
            Add Class
          </Button>
        )}
      </Box>

      <div className="flex flex-wrap gap-10">
        {classes &&
          classes.map((item) => (
            <div key={item._id} className="px-10 m-5 border-2 border-black">
              <h1>{item.classText}</h1>
              <p>{item.classNum}</p>
              <div>
                <Button onClick={() => handleEdit(item._id, item.classText, item.classNum)}>
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

export default Class;
