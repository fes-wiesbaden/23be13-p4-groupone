import {useAuth} from "~/contexts/AuthContext";
import {useNavigate} from "react-router";
import React, {use, useState} from "react";
import CustomizedSnackbars from "~/components/snackbar"
import {Button, CardContent, CircularProgress, TextField, Typography} from "@mui/material";
import Box from "@mui/material/Box";
import API_CONFIG from "~/apiConfig";

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

    if (!user || isLoading) return <CircularProgress/>

    return (
        <>
            <CardContent>
                <Box sx={{display: "flex", flexDirection: "column", gap: 2}}>
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

                    <Button variant="contained" onClick={handlePasswordChange} disabled={saving}>
                        {saving ? "Andern..." : "Passwort ändern"}
                    </Button>
                </Box>
            </CardContent>
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </>
    )
}