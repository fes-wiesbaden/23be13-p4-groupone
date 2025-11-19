// FULLY FIXED VERSION WITH DARK/LIGHT MODE
// -------------------------------------------------------------
// Cleaned imports + fixed dark mode toggle button
// -------------------------------------------------------------

import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  AppBar as MuiAppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer as MuiDrawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HelpIcon from "@mui/icons-material/Help";
import StarIcon from "@mui/icons-material/Star";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: any) => ({
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

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }: { theme?: any; open?: boolean }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  // DARK MODE
  const [mode, setMode] = React.useState<"light" | "dark">("light");

  const colorMode = React.useMemo(
    () => ({ toggleTheme: () => setMode((prev) => (prev === "light" ? "dark" : "light")) }),
    []
  );

  const muiTheme = React.useMemo(
    () =>
      createTheme({
        palette: { mode },
      }),
    [mode]
  );

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={muiTheme}>
          <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <AppBar position="fixed" open={open}>
              <Toolbar>
                {!open && (
                  <IconButton color="inherit" onClick={() => setOpen(true)} edge="start" sx={{ mr: 2 }}>
                    <MenuIcon />
                  </IconButton>
                )}

                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                  Logo
                </Typography>

                {/* DARK/LIGHT MODE CIRCLE BUTTON */}
                <IconButton
                  onClick={colorMode.toggleTheme}
                  sx={{
                    mr: 2,
                    width: 35,
                    height: 20,
                    borderRadius: "75%",
                    backgroundColor: muiTheme.palette.mode === "dark" ? "#444" : "#eee",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    transition: "0.3s",
                    position: "relative",
                    "&:hover": {
                      backgroundColor: muiTheme.palette.mode === "dark" ? "#555" : "#ddd",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: muiTheme.palette.mode === "dark" ? "#fff" : "#999",
                      transition: "0.3s",
                      transform:
                        muiTheme.palette.mode === "dark"
                          ? "translateX(8px)"
                          : "translateX(-8px)",
                    }}
                  />
                </IconButton>

                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0 }}>
                  <Avatar />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                >
                  <MenuItem>Profile</MenuItem>
                  <MenuItem>Account</MenuItem>
                  <MenuItem>Dashboard</MenuItem>
                  <MenuItem>Logout</MenuItem>
                </Menu>
              </Toolbar>
            </AppBar>

            <Drawer variant="permanent" open={open}>
              <DrawerHeader>
                <IconButton onClick={() => setOpen(false)}>
                  {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </DrawerHeader>
              <Divider />

              <List>
                {[
                  { text: "Startseite", icon: <HomeIcon /> },
                  { text: "Klassen", icon: <SchoolIcon /> },
                  { text: "Schüler", icon: <GroupIcon /> },
                  { text: "Aufgaben", icon: <AssignmentIcon /> },
                  { text: "Fragen", icon: <HelpIcon /> },
                  { text: "Noten", icon: <StarIcon /> },
                ].map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              <Divider />

              <List>
                {[
                  { text: "Profil", icon: <AccountCircleIcon /> },
                  { text: "Einstellungen", icon: <SettingsIcon /> },
                  { text: "Abmelden", icon: <LogoutIcon /> },
                ].map((item) => (
                  <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                      sx={{
                        minHeight: 48,
                        justifyContent: open ? "initial" : "center",
                        px: 2.5,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : "auto", justifyContent: "center" }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <DrawerHeader />
              {children}

              <ScrollRestoration />
              <Scripts />
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
