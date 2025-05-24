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
}));

export default function Teacher() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

  const handleDrawerToggle = () => setOpen(!open);

  const handleNavigation = (link) => navigate(link);

  const navArr = [
    { link: "/teacher", component: "Dashboard", icon: DashboardIcon },
  ];

  const SubnavArr = [
    { link: "/teacher/schedule", component: "Schedule", icon: CalendarMonthIcon },
    { link: "/teacher/attendance", component: "Attendance", icon: BarChartIcon },
    { link: "/teacher/examination", component: "Examinations", icon: AssignmentIcon },
    { link: "/teacher/notice", component: "Notices", icon: NotificationsActiveIcon }
  ];

  // Function to check if a route is active
  const isActive = (path) => location.pathname === path;

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
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap>
              School Management System
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
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
                      justifyContent: open ? "initial" : "center",
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
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.component} sx={{ opacity: open ? 1 : 0 }} />
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
                      justifyContent: open ? "initial" : "center",
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
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.component} sx={{ opacity: open ? 1 : 0 }} />
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
                  justifyContent: open ? "initial" : "center",
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
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Log Out" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}