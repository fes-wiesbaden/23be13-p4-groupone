import React, { useState } from "react";
import type { FormEvent } from "react";
import type { LoginResponse } from "../types/api";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
                    username: data.username || data.user?.username || "",
                    role: data.role || data.user?.role || "",
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
            component="form"
            onSubmit={handleSubmit}
            sx={{ maxWidth: 400, mx: "auto", mt: 5, display: "flex", flexDirection: "column", gap: 2 }}
        >
            <Typography variant="h4" align="center" color={"white"}>
                Login
            </Typography>

            <TextField
                label="Username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                required
            />

            <TextField
                label="Passwort"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
            />

            <Button type="submit" variant="contained">
                Login
            </Button>

            {error && (
                <Typography color="error" role="alert">
                    {error}
                </Typography>
            )}
        </Box>
    );
}