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
        const trimmedPassword: string = newPassword.trim();
            if (trimmedPassword.length < 8 || trimmedPassword.length > 50) {
                setError("Passwort muss zwischen 8 und 50 Zeichen lang sein");
                setSnackbarMessage("Passwort muss zwischen 8 und 50 Zeichen lang sein");
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
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
                },
            }}
        >
            <Container component="main" maxWidth="xs">
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 1,
                    }}
                >
                    <Paper
                        elevation={24}
                        sx={{
                            padding: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(102, 126, 234, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Avatar 
                            sx={{ 
                                m: 1, 
                                mb: 2,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                width: 64, 
                                height: 64,
                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.5)',
                            }}
                        >
                            <LockResetIcon sx={{ fontSize: 36 }} />
                        </Avatar>
                        
                        <Typography 
                            component="h1" 
                            variant="h4" 
                            sx={{ 
                                mb: 1, 
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Passwort ändern
                        </Typography>

                        <Typography 
                            variant="body2" 
                            sx={{ 
                                mb: 4, 
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.7)',
                            }}
                        >
                            Bitte ändern Sie Ihr Passwort, um fortzufahren
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handlePasswordChange}
                            sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        transition: 'all 0.3s',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            '& fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px',
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Neues Passwort"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                fullWidth
                                autoComplete="new-password"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        transition: 'all 0.3s',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            '& fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px',
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />

                            <TextField
                                label="Passwort bestätigen"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                fullWidth
                                autoComplete="new-password"
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#ffffff',
                                        transition: 'all 0.3s',
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                        },
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                            '& fieldset': {
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                            },
                                        },
                                        '&.Mui-focused': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            '& fieldset': {
                                                borderColor: '#667eea',
                                                borderWidth: '2px',
                                            },
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        '&.Mui-focused': {
                                            color: '#667eea',
                                        },
                                    },
                                }}
                            />

                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth
                                size="large"
                                disabled={saving}
                                sx={{ 
                                    mt: 2, 
                                    py: 1.8,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #7b8ff0 0%, #8a5cb2 100%)',
                                        boxShadow: '0 6px 25px rgba(102, 126, 234, 0.7)',
                                        transform: 'translateY(-2px)',
                                    },
                                    transition: 'all 0.3s',
                                }}
                            >
                                {saving ? "Ändern..." : "Passwort ändern"}
                            </Button>

                            {error && (
                                <Typography 
                                    role="alert" 
                                    sx={{ 
                                        mt: 1, 
                                        textAlign: 'center',
                                        p: 2,
                                        bgcolor: 'rgba(244, 67, 54, 0.1)',
                                        borderRadius: 2,
                                        fontSize: '0.9rem',
                                        border: '1px solid rgba(244, 67, 54, 0.3)',
                                        color: '#ff6b6b',
                                    }}
                                >
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