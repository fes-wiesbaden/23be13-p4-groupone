import React, { useState } from "react";
import type { FormEvent } from "react";
import type { LoginResponse } from "../types/api";
import { TextField, Button, Typography, Box, Paper, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import type {Role} from "~/types/models";

/**
 * @author: Daniel Hess
 * <p>
 * UI for login page. Uses the login endpoint of the backend to authenticate the user.
 * </p>
 *
 **/

interface EnvConfig {
    VITE_API_URL?: string;
}

export default function Login(): React.ReactElement {
    const apiUrl = (import.meta.env as unknown as EnvConfig).VITE_API_URL ?? "http://localhost:8080";
    const { login } = useAuth();

    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch(`${apiUrl}/api/users/login`, {
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
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <LockOutlinedIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    
                    <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                        GradeSave
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                        <TextField
                            label="Username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            fullWidth
                            autoComplete="username"
                            autoFocus
                        />

                        <TextField
                            label="Passwort"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            fullWidth
                            autoComplete="current-password"
                        />

                        <Button 
                            type="submit" 
                            variant="contained" 
                            fullWidth
                            size="large"
                            sx={{ mt: 2, py: 1.5 }}
                        >
                            Login
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
        </Box>
    );
}