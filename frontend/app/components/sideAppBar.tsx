/*
  * @Author: Paul Geisthardt
  * @Date: 09/09/2024
  * Creates a Side + Appbar for the Frontend
*/
import * as React from 'react';
import {type CSSObject, styled, type Theme, useTheme} from '@mui/material/styles';
import Box from '@mui/material/Box';
import PollIcon from '@mui/icons-material/Poll';
import {useNavigate} from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar, {type AppBarProps as MuiAppBarProps} from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import GradeIcon from '@mui/icons-material/Grade';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import QuizIcon from '@mui/icons-material/Quiz';
import HomeIcon from '@mui/icons-material/Home';
import ProjectIcon from '@mui/icons-material/Work';
import LearningIcon from '@mui/icons-material/MenuBook';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ProfileIcon from '../assets/test_profile_icon.jpg'
import {useAuth} from "~/contexts/AuthContext";
import {Role} from '~/types/models';
import ColorModeToggle from './colorModeToggle';

const drawerWidth = 240;


const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div', {shouldForwardProp: (prop) => prop !== 'open'})<{ open: boolean }>(({
                                                                                                           theme,
                                                                                                           open
                                                                                                       }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-end' : 'flex-start',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));


interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({theme}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(8px)',
    variants: [
        {
            props: ({open}) => open,
            style: {
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

const Drawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme}) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({open}) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({open}) => !open,
                style: {
                    ...closedMixin(theme),
                    '& .MuiDrawer-paper': closedMixin(theme),
                },
            },
        ],
    }),
);


interface MenuItem {
    text: string;
    icon: React.ReactNode;
    path: string;
    roles?: Role[];
}

function DrawerMenu({items, open, navigate, onLogout}: {
    items: MenuItem[];
    open: boolean;
    navigate: (path: string) => void;
    onLogout?: () => void
}) {
    return (
        <List>
            {items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{display: "block"}}>
                    <Tooltip
                        title={!open ? (<span style={{fontSize: '1rem'}}>
                        {item.text}</span>) : ('')}
                        placement="right"
                    >
                        <ListItemButton
                            onClick={() => {
                                if (item.text === 'Abmelden' && onLogout) {
                                    onLogout();
                                } else {
                                    navigate(item.path);
                                }
                            }}
                            sx={[
                                {
                                    minHeight: 48,
                                    px: 2.5,
                                    borderRadius: open ? 2 : 0,
                                    mx: open ? 1 : 0,
                                    mb: 0.5,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                        transform: 'translateX(4px)',
                                    },
                                },
                                open
                                    ? {justifyContent: "initial"}
                                    : {justifyContent: "center"}
                            ]}
                        >
                            <ListItemIcon
                                sx={[
                                    {
                                        minWidth: 0,
                                        justifyContent: "center",
                                    },
                                    open
                                        ? {mr: 3}
                                        : {mr: "auto"}
                                ]}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                sx={[
                                    open
                                        ? {opacity: 1}
                                        : {opacity: 0}
                                ]}
                            />
                        </ListItemButton>
                    </Tooltip>
                </ListItem>
            ))}
        </List>
    );
}

interface SideAppBarProps {
    children?: React.ReactNode;
}

export default function SideAppBar({children}: SideAppBarProps) {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    const {user, isAuthenticated, logout} = useAuth();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const menuItems: MenuItem[] = [
        {text: 'Startseite', icon: <HomeIcon/>, path: '/'},
        {text: 'Klassen', icon: <SchoolIcon/>, path: '/klassen', roles: [Role.ADMIN]},
        {text: 'PDFs', icon: <PictureAsPdfIcon/>, path: '/pdfs', roles: [Role.ADMIN]},
        {text: 'Benutzer', icon: <PeopleIcon/>, path: '/user', roles: [Role.ADMIN]},
        {text: 'Fragen', icon: <QuizIcon/>, path: '/fragen', roles: [Role.ADMIN, Role.TEACHER]},
        {text: 'Noten', icon: <GradeIcon/>, path: '/noten', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT]},
        {text: 'Projekte', icon: <ProjectIcon/>, path: '/projekte', roles: [Role.ADMIN]},
        {text: 'Lernbereich', icon: <LearningIcon/>, path: '/lernbereich', roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT]},
        {text: 'Fragebogen', icon: <PollIcon/>, path: '/fragebogen', roles: [Role.STUDENT, Role.TEACHER, Role.ADMIN]},
    ];

    const bottomItems: MenuItem[] = [
        {text: 'Profil', icon: <AccountCircleIcon/>, path: '/profil'},
        {text: 'Einstellungen', icon: <SettingsIcon/>, path: '/einstellungen'},
        {text: 'Abmelden', icon: <LogoutIcon/>, path: '/logout'},
    ];

    const filteredMenuItems = menuItems.filter(item => {
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        return user && item.roles.includes(user.role);
    });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            {isAuthenticated && (
                <>
                    <AppBar position="fixed" open={open}>
                        <Toolbar>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerOpen}
                                edge="start"
                                sx={[
                                    {
                                        marginRight: 5,
                                    },
                                    open && {display: 'none'},
                                ]}
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Typography
                                variant="h5"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    mr: 2,
                                    display: {xs: 'none', md: 'flex'},
                                    fontWeight: 800,
                                    letterSpacing: '0.05rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            >
                                GradeSave
                            </Typography>

                            <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                                <IconButton
                                    size="large"
                                    aria-label="account of current user"
                                    aria-controls="menu-appbar"
                                    aria-haspopup="true"
                                    onClick={handleOpenNavMenu}
                                    color="inherit"
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <Menu
                                    id="menu-appbar"
                                    anchorEl={anchorElNav}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'left',
                                    }}
                                    open={Boolean(anchorElNav)}
                                    onClose={handleCloseNavMenu}
                                    sx={{display: {xs: 'block', md: 'none'}}}
                                >
                                </Menu>
                            </Box>
                            <Typography
                                variant="h6"
                                noWrap
                                component="a"
                                href="/"
                                sx={{
                                    mr: 2,
                                    display: {xs: 'flex', md: 'none'},
                                    flexGrow: 1,
                                    fontWeight: 800,
                                    letterSpacing: '0.05rem',
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    background: 'linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                GradeSave
                            </Typography>
                            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
                            </Box>
                            <Box sx={{flexGrow: 0, display: 'flex', alignItems: 'center', gap: 1}}>
                                <ColorModeToggle />
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                                        <Avatar alt="Remy Sharp"
                                                src={ProfileIcon}/> {/* TODO: logic to get user icons */}
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{mt: '45px'}}
                                    id="menu-appbar-user"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem
                                            key={setting}
                                            onClick={() => {
                                                handleCloseUserMenu();
                                                if (setting === 'Logout') {
                                                    handleLogout();
                                                }
                                            }}
                                        >
                                            <Typography sx={{textAlign: 'center'}}>{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        </Toolbar>
                    </AppBar>
                    <Drawer variant="permanent" open={open}>
                        <DrawerHeader open={open}>
                            <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
                                {open ? (
                                    theme.direction === "rtl" ? <ChevronRightIcon/> : <ChevronLeftIcon/>
                                ) : (
                                    <MenuIcon/>
                                )}
                            </IconButton>
                        </DrawerHeader>
                        <Divider/>
                        <DrawerMenu items={filteredMenuItems} open={open} navigate={navigate}/>

                        <Divider/>
                        <DrawerMenu items={bottomItems} open={open} navigate={navigate} onLogout={handleLogout}/>
                    </Drawer>
                </>
            )}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                }}>
                {isAuthenticated && <Toolbar/>}
                {children}
            </Box>
        </Box>
    );
}
