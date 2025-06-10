import * as React from "react";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Typography,
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Backdrop,
} from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import axios from "axios";
import { baseApi } from "../environment";
import { useEffect } from "react";

const drawerWidth = 240;

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ff6f00",
    },
    secondary: {
      main: "#ffa000",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
    text: {
      primary: "#ffffff",
      secondary: "#f5f5f5",
    },
  },
});

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.primary.main,
  transition: theme.transitions.create(["background-color"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.standard,
  }),
  width: '100%',
  marginLeft: 0,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const MobileDrawer = styled(MuiDrawer)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.primary,
    },
  },
}));

export default function Student() {
  const [open, setOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [studentData, setStudentData] = useState([]);

  // Check if mobile/tablet
  const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));

  const fetchStudentData = async () => {
    try {
      const res = await axios.get(`${baseApi}/student/fetch-single`);
      setStudentData(res.data.student);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchStudentData();
  }, [])

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleNavigation = (link) => {
    navigate(link);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const navArr = [
    { link: "/student", component: "Dashboard", icon: DashboardIcon },
  ];

  const SubnavArr = [
    { link: "/student/schedule", component: "Schedule", icon: CalendarMonthIcon },
    { link: `/student/attendance/${studentData._id}`, component: "Attendance", icon: BarChartIcon },
    { link: "/student/examination", component: "Examinations", icon: AssignmentIcon },
    { link: "/student/notice", component: "Notices", icon: NotificationsActiveIcon }
  ];

  // Function to check if a route is active
  const isActive = (path) => location.pathname === path;

  const renderDrawerContent = () => (
    <>
      <DrawerHeader />
      <Divider />
      <List>
        {navArr.map((item, index) => {
          const isCurrent = isActive(item.link);
          return (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => handleNavigation(item.link)}
                sx={{
                  minHeight: 48,
                  justifyContent: (open || isMobile) ? "initial" : "center",
                  px: 2.5,
                  borderLeft: isCurrent ? `4px solid ${darkTheme.palette.primary.main}` : "4px solid transparent",
                  backgroundColor: isCurrent ? "#333" : "transparent",
                  "&:hover": {
                    backgroundColor: darkTheme.palette.primary.main,
                    color: "#000",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: (open || isMobile) ? 3 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.component} sx={{ opacity: (open || isMobile) ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List>
        {SubnavArr.map((item, index) => {
          const isCurrent = isActive(item.link);
          return (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => handleNavigation(item.link)}
                sx={{
                  minHeight: 48,
                  justifyContent: (open || isMobile) ? "initial" : "center",
                  px: 2.5,
                  borderLeft: isCurrent ? `4px solid ${darkTheme.palette.primary.main}` : "4px solid transparent",
                  backgroundColor: isCurrent ? "#333" : "transparent",
                  "&:hover": {
                    backgroundColor: darkTheme.palette.primary.main,
                    color: "#000",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: (open || isMobile) ? 3 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.component} sx={{ opacity: (open || isMobile) ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            onClick={() => handleNavigation('/logout')}
            sx={{
              minHeight: 48,
              justifyContent: (open || isMobile) ? "initial" : "center",
              px: 2.5,
              "&:hover": {
                backgroundColor: darkTheme.palette.primary.main,
                color: "#000",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: (open || isMobile) ? 3 : "auto",
                justifyContent: "center",
                color: "inherit",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" sx={{ opacity: (open || isMobile) ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={{ display: "flex", bgcolor: "background.default", color: "text.primary" }}>
        <CssBaseline />

        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ marginRight: 5 }}
            >
              {(open || mobileOpen) ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              School Management System
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Desktop Drawer */}
        <Drawer variant="permanent" open={open}>
          {renderDrawerContent()}
        </Drawer>

        {/* Mobile Drawer */}
        <MobileDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
        >
          {renderDrawerContent()}
        </MobileDrawer>

        {/* Mobile backdrop */}
        {isMobile && mobileOpen && (
          <Backdrop
            open={mobileOpen}
            onClick={() => setMobileOpen(false)}
            sx={{ zIndex: darkTheme.zIndex.drawer - 1 }}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            width: {
              xs: "100%",
              md: open ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${darkTheme.spacing(8)} - 1px)`
            },
          }}
        >
          <DrawerHeader />

          <Box sx={{
            width: "100%",
            maxWidth: "100%",
            padding: { xs: "8px", sm: "16px", md: "24px" },
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}