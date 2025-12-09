import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Container,
    TextField,
    Typography
} from "@mui/material";
import {useAuth} from "~/contexts/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import type {CourseDto, User} from "~/types/models";
import CustomizedSnackbars from "~/components/snackbar"
import API_CONFIG from "~/apiConfig";


/**
 * @author: Kebba Ceesay
 * <p>
 *    Created Profil Page
 * </p>
 */


interface Course {
    id: string | number;
    courseName: string;
}

interface UserProfile {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    courses?: Course[];
}

export default function Profile(): React.ReactElement {
    const {user: authUser} = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [role, setRole] = useState("");
    const [courses, setCourses] = useState("");
    const [username, setUsername] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/me`, {
                    credentials: "include",
                });
                if (!res.ok) {
                    setSnackbarMessage(`Fehler beim Laden der Profildaten: ${res.status}`);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                    return
                }

                const data: User = await res.json();
                setProfile(data);
                setFirstName(data.firstName ?? "");
                setLastName(data.lastName ?? "");
                setRole(data.role ?? "");
                setCourses(data.courses ? data.courses.map((c: CourseDto) => c.courseName).join(", ") : "");
                setUsername(data.username ?? "");
            } catch (err: any) {
                setSnackbarMessage(`Fehler beim Laden der Profildaten: ${err.message}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordChange = async () => {
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Neues Passwort stimmt nicht mit Bestätigung überein");
            return;
        }
        if (!currentPassword) {
            setError("Bitte aktuelles Passwort eingeben");
            return;
        }

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/me/update-password`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify({currentPassword, newPassword}),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Fehler beim Speichern");
                setSnackbarMessage(`Fehler beim Speichern: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }

            setSnackbarMessage(`Passwort erfolgreich geändert!: ${res.status}`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError("Server nicht erreichbar");
            setSnackbarMessage(`Fehler beim Speichern: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    if (loading) return <CircularProgress/>;
    if (!profile) return <Typography>Keine Profildaten verfügbar</Typography>;

    return (
        <>
            <Container maxWidth="sm" sx={{mt: 4}}>
                <Card sx={{p: 2, borderRadius: 3, boxShadow: 4}}>
                    <CardHeader
                        avatar={
                            <AccountCircleIcon sx={{fontSize: 50}} color="primary"/>
                        }
                        title={
                            <Typography variant="h4" fontWeight={600}>
                                Profil
                            </Typography>
                        }
                    />

                    <CardContent>
                        <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
                            <TextField
                                label="Vorname"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                fullWidth
                                disabled={true}
                            />

                            <TextField
                                label="Nachname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                fullWidth
                                disabled={true}
                            />

                            <TextField
                                label="Rolle"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                fullWidth
                                disabled={true}
                            />

                            <TextField
                                label="Klasse"
                                value={courses}
                                onChange={(e) => setCourses(e.target.value)}
                                fullWidth
                                disabled={true}
                            />

                            <TextField
                                label="Benutzername"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                fullWidth
                                disabled={true}
                            />

                            <Typography variant="h5" gutterBottom fontWeight={600}>
                                Passwort ändern
                            </Typography>

                            <TextField
                                label="Aktuelles Passwort"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                label="Neues Passwort"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                fullWidth
                            />

                            <TextField
                                label="Passwort bestätigen"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                            />

                            {error && <Typography color="error">{error}</Typography>}

                            <Button variant="contained" onClick={handlePasswordChange}>
                                Passwort ändern
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </>
    );
}