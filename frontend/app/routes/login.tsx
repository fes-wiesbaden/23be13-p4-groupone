import React, { useState } from "react";
import type { FormEvent } from "react";
import type { LoginResponse } from "../types/api";
import { TextField, Button, Typography, Box, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import API_CONFIG from "~/apiConfig";
import type {Role} from "~/types/models";

/**
 * @author: Daniel Hess
 * <p>
 * UI for login page. Uses the login endpoint of the backend to authenticate the user.
 * </p>
 *
 **/

export default function Login(): React.ReactElement {
    const { login } = useAuth();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username, password }),
                credentials: "include",
            });

            if (res.ok) {
                const data: LoginResponse = await res.json();

                login({
                    id: data.id || "",
                    username: data.username || data.user?.username || "",
                    role: data.role as Role || data.user?.role as Role
                });

                navigate("/");
            } else {
                let msg = "Login failed";
                try {
                    const data: LoginResponse = await res.json();
                    msg = data.error || msg;
                } catch {
                    const text = await res.text();
                    msg = text || msg;
                }
                setError(msg);
            }
        } catch (err) {
            if (err instanceof TypeError && err.message === "Failed to fetch") {
                setError("Network error: Unable to connect to server. Is the backend running?");
            } else if (err instanceof Error) {
                setError(`Error: ${err.message}`);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

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
                        <LockOutlinedIcon sx={{ fontSize: 36 }} />
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
                        GradeSave
                    </Typography>
                    
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mb: 4, 
                            fontWeight: 500,
                            color: 'rgba(255, 255, 255, 0.7)',
                        }}
                    >
                        Melden Sie sich an, um fortzufahren
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}
                    >
                        <TextField
                            label="Username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            fullWidth
                            autoComplete="username"
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
                            label="Passwort"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            fullWidth
                            autoComplete="current-password"
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
                            Anmelden
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
        </Box>
    );
}