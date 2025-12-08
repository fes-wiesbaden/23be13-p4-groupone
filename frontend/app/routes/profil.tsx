import React, { useEffect, useState } from "react";
import { Box, TextField, Typography, Button, Container, CircularProgress } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";


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
  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
  const { user: authUser } = useAuth();

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/users/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFirstName(data.firstName ?? "");
          setLastName(data.lastName ?? "");
          setRole(data.role ?? "");
          setCourses(data.courses ? data.courses.map((c: Course) => c.courseName).join(", ") : "");
          setUsername(data.username ?? "");
        } else {
          setError("Fehler beim Laden der Profildaten");
        }
      } catch {
        setError("Server nicht erreichbar");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setError("");

    if (authUser?.role !== "ADMIN") return;

    const payload: any = {
      firstName,
      lastName,
      role,
      courses,
    };

    try {
      const res = await fetch(`${apiUrl}/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        alert("Profil erfolgreich gespeichert!");
      } else {
        setError("Fehler beim Speichern");
      }
    } catch {
      setError("Server nicht erreichbar");
    }
  };

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
      const res = await fetch(`${apiUrl}/api/users/me/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler beim Speichern");
        return;
      }

      alert("Passwort erfolgreich geändert!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("Server nicht erreichbar");
    }
  };

  if (loading) return <CircularProgress />;
  if (!profile) return <Typography>Keine Profildaten verfügbar</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card sx={{ p: 2, borderRadius: 3, boxShadow: 4 }}>
        <CardHeader
          avatar={
            <AccountCircleIcon sx={{ fontSize: 50 }} color="primary" />
          }
          title={
            <Typography variant="h4" fontWeight={600}>
              Profil
            </Typography>
          }
        />

        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              disabled={authUser?.role !== "ADMIN"}
            />

            <TextField
              label="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              fullWidth
              disabled={authUser?.role !== "ADMIN"}
            />

            <TextField
              label="Rolle"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              disabled={authUser?.role !== "ADMIN"}
            />

            <TextField
              label="Klasse"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              fullWidth
              disabled={authUser?.role !== "ADMIN"}
            />

            <TextField
              label="Benutzername"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              disabled={authUser?.role !== "ADMIN"}
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
  );
}