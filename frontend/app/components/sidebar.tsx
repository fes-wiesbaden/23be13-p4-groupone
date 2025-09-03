import * as React from 'react';
import { styled, useTheme, type Theme, type CSSObject } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
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
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradeIcon from '@mui/icons-material/Grade';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import QuizIcon from '@mui/icons-material/Quiz';
import HomeIcon from '@mui/icons-material/Home';

const drawerWidth = 240;

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

const DrawerHeader = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })<{ open: boolean }>(({ theme, open }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: open ? 'flex-end' : 'flex-start',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        variants: [
            {
                props: ({ open }) => open,
                style: {
                    ...openedMixin(theme),
                    '& .MuiDrawer-paper': openedMixin(theme),
                },
            },
            {
                props: ({ open }) => !open,
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
}

function DrawerMenu({ items, open, navigate }: { items: MenuItem[]; open: boolean; navigate: (path: string) => void }) {
    return (
        <List>
            {items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                    <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={[
                            {
                                minHeight: 48,
                                px: 2.5,
                            },
                            open
                                ? {
                                    justifyContent: "initial",
                                }
                                : {
                                    justifyContent: "center",
                                },
                        ]}
                    >
                        <ListItemIcon
                            sx={[
                                {
                                    minWidth: 0,
                                    justifyContent: "center",
                                },
                                open
                                    ? {
                                        mr: 3,
                                    }
                                    : {
                                        mr: "auto",
                                    },
                            ]}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            sx={[
                                open
                                    ? {
                                        opacity: 1,
                                    }
                                    : {
                                        opacity: 0,
                                    },
                            ]}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default function Sidebar() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const menuItems: MenuItem[] = [
        { text: 'Startseite', icon: <HomeIcon />, path: '/' },
        { text: 'Klassen', icon: <SchoolIcon />, path: '/klassen' },
        { text: 'Schüler', icon: <PeopleIcon />, path: '/schueler' },
        { text: 'Aufgaben', icon: <AssignmentIcon />, path: '/aufgaben' },
        { text: 'Fragen', icon: <QuizIcon />, path: '/fragen' },
        { text: 'Noten', icon: <GradeIcon />, path: '/noten' },
    ];

    const bottomItems: MenuItem[] = [
        { text: 'Profil', icon: <AccountCircleIcon />, path: '/profil' },
        { text: 'Einstellungen', icon: <SettingsIcon />, path: '/einstellungen' },
        { text: 'Abmelden', icon: <LogoutIcon />, path: '/logout' },
    ];

    return (
        <Drawer variant="permanent" open={open}>
            <DrawerHeader open={open}>
                <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
                    {open ? (
                        theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />
                    ) : (
                        <MenuIcon />
                    )}
                </IconButton>
            </DrawerHeader>

            <Divider />
            <DrawerMenu items={menuItems} open={open} navigate={navigate} />

            <Divider />
            <DrawerMenu items={bottomItems} open={open} navigate={navigate} />
        </Drawer>
    );
}