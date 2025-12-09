import {useAuth} from "~/contexts/AuthContext";
import {useNavigate} from "react-router";
import React, {useState} from "react";
import CustomizedSnackbars from "~/components/snackbar"
import {Button, CircularProgress, TextField, Typography, Paper, Container, Avatar} from "@mui/material";
import Box from "@mui/material/Box";
import API_CONFIG from "~/apiConfig";
import LockResetIcon from '@mui/icons-material/LockReset';

export default function ChangePassword() {
    const {user, checkAuth, isLoading} = useAuth()
    const navigate = useNavigate()

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false)

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    const [error, setError] = useState<string>("");

    const handlePasswordChange = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Die Passwörter stimmen nicht überein");
            setSnackbarMessage(`Die Passwörter stimmen nicht überein`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        if (!currentPassword) {
            setError("Bitte geben Sie Ihr aktuelles Passwort ein");
            setSnackbarMessage(`Bitte geben Sie Ihr aktuelles Passwort ein`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        setSaving(true)

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

            setSnackbarMessage(`Passwort erfolgreich geändert!`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

            await checkAuth()
            navigate("/");
        } catch (err: any) {
            setError("Server nicht erreichbar");
            setSnackbarMessage(`Fehler beim Speichern: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setSaving(false)
        }
    };

    if (!user || isLoading) return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <CircularProgress/>
        </Box>
    )

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Paper
                        elevation={6}
                        sx={{
                            padding: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 2,
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'warning.main', width: 56, height: 56 }}>
                            <LockResetIcon sx={{ fontSize: 32 }} />
                        </Avatar>
                        
                        <Typography component="h1" variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
                            Passwort ändern
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                            Bitte ändern Sie Ihr Passwort, um fortzufahren
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handlePasswordChange}
                            sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            <TextField
                                label="Aktuelles Passwort"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                fullWidth
                                autoComplete="current-password"
                                autoFocus
                            />

                            <TextField
                                label="Neues Passwort"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                fullWidth
                                autoComplete="new-password"
                            />

                            <TextField
                                label="Passwort bestätigen"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                fullWidth
                                autoComplete="new-password"
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth
                                size="large"
                                disabled={saving}
                                sx={{ mt: 2, py: 1.5 }}
                            >
                                {saving ? "Ändern..." : "Passwort ändern"}
                            </Button>

                            {error && (
                                <Typography color="error" role="alert" sx={{ mt: 1, textAlign: 'center' }}>
                                    {error}
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Container>

            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </Box>
    )
}