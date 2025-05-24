import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import School from './School/School'
import AttendanceStudentList from './School/components/Attendance/AttendanceStudentList'
import Class from './School/components/Class/Class'
import Subjects from './School/components/Subjects/Subjects'
import Students from './School/components/Students/Students'
import Teachers from './School/components/Teachers/Teachers'
import Dashboard from './School/components/Dashboard/Dashboard'
import Notice from './School/components/Notice/Notice'
import Schedule from './School/components/Schedule/Schedule'
import Examination from './School/components/Examination/Examination'
import Client from './Client/Client'
import Home from './Client/components/Home/Home'
import Login from './Client/components/Login/Login'
import Register from './Client/components/Register/Register'

// Teacher Router
import Teacher from './Teacher/Teacher'
import TeacherDashboard from './Teacher/components/Dashboard/Dashboard'
import TeacherAttendance from './Teacher/components/Attendance/Attendance'
import TeacherSchedule from './Teacher/components/Schedule/Schedule'
import TeacherExamination from './Teacher/components/Examination/Examination'
import TeacherNotice from './Teacher/components/Notice/Notice'

// Student Router
import Student from './Student/Student'
import StudentDashboard from './Student/Components/Dashboard/Dashboard'
import StudentAttendance from './Student/Components/Attendance/Attendance'
import StudentSchedule from './Student/Components/Schedule/Schedule'
import StudentExamination from './Student/Components/Examination/Examination'
import StudentNotice from './Student/Components/Notice/Notice'
import ProtectedRoute from './Guard/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AttendanceDetails from './School/components/Attendance/AttendanceDetails'
import Logout from './Client/components/Logout/Logout'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* School */}
          <Route path='/school' element={<ProtectedRoute allowedRoles={['SCHOOL']}><School /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='attendance' element={<AttendanceStudentList />} />
            <Route path='attendance/:id' element={<AttendanceDetails/>} />
            <Route path='class' element={<Class />} />
            <Route path='subject' element={<Subjects />} />
            <Route path='student' element={<Students />} />
            <Route path='teacher' element={<Teachers />} />
            <Route path='notice' element={<Notice />} />
            <Route path='schedule' element={<Schedule />} />
            <Route path='examination' element={<Examination />} />
          </Route>

          {/* Student */}
          <Route path='/student' element={<ProtectedRoute allowedRoles={['STUDENT']}><Student /></ProtectedRoute>}>
            <Route index element={<StudentDashboard/>} />
            <Route path='dashboard' element={<StudentDashboard/>} />
            <Route path='schedule' element={<StudentSchedule/>} />
            <Route path='attendance' element={<StudentAttendance/>} />
            <Route path='examination' element={<StudentExamination/>} />
            <Route path='notice' element={<StudentNotice/>} />
          </Route>

          {/* Teacher */}
          <Route path='/teacher' element={<ProtectedRoute allowedRoles={['TEACHER']}><Teacher /></ProtectedRoute>}>
            <Route index element={<TeacherDashboard/>} />
            <Route path='dashboard' element={<TeacherDashboard/>} />
            <Route path='schedule' element={<TeacherSchedule/>} />
            <Route path='attendance' element={<TeacherAttendance/>} />
            <Route path='examination' element={<TeacherExamination/>} />
            <Route path='notice' element={<TeacherNotice/>} />
          </Route>

          {/* Client */}
          <Route path='/' element={<Client />}>
            <Route index element={<Home />} />
            <Route path='login' element={<Login />} />
            <Route path='logout' element={<Logout />} />
            <Route path='register' element={<Register />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App