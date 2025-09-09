// app/routes/users.tsx (or any page/component)
import * as React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Stack
} from "@mui/material";
import DataGridWithAdd, {type Column, type DataRow} from "../components/dataTableWithAddButton";
import {useCallback, useEffect, useState} from "react";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

interface UserRow extends DataRow {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
}

const columns: Column[] = [
    {key: "username", label: "Benutzername"},
    {key: "firstName", label: "Vorname"},
    {key: "lastName", label: "Nachname"},
    {key: "role", label: "Rolle"},
];

export default function UsersPage() {
    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);

    const [editRow, setEditRow] = useState<UserRow | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        role: "STUDENT" as Role,
        password: "",
    });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:8080/api/users");
            if (!res.ok) throw new Error(`GET /api/users ${res.status}`);
            const data: Array<{
                id: string; username: string; firstName: string; lastName: string; role: Role;
            }> = await res.json();
            setRows(data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const onAddClick = () => {
        setEditRow(null);
        setForm({username: "", firstName: "", lastName: "", role: "STUDENT", password: ""});
        setOpen(true);
    };

    const onEditClick = (row: UserRow) => {
        setEditRow(row);
        setForm({
            username: row.username,
            firstName: row.firstName,
            lastName: row.lastName,
            role: row.role,
            password: "",
        });
        setOpen(true);
    };

    const onDeleteClick = async (id: string) => {
        if (!confirm("Diesen Benutzer wirklich löschen?")) return;
        const res = await fetch(`http://localhost:8080/api/users/${id}`, {method: "DELETE"});
        if (res.ok) {
            setRows(prev => prev.filter(r => r.id !== id));
        } else {
            alert("Löschen fehlgeschlagen.");
        }
    };

    const onSave = async () => {
        if (editRow) {
            // UPDATE
            const body: any = {
                username: form.username,
                firstName: form.firstName,
                lastName: form.lastName,
                role: form.role,
            };
            if (form.password.trim().length > 0) body.password = form.password;

            const res = await fetch(`http://localhost:8080/api/users/${editRow.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
            if (res.ok) {
                await load();
                setOpen(false);
            } else {
                alert("Aktualisieren fehlgeschlagen.");
            }
        } else {
            // CREATE
            const res = await fetch("http://localhost:8080/api/users", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(form),
            });
            if (res.ok) {
                await load();
                setOpen(false);
            } else {
                alert("Erstellen fehlgeschlagen.");
            }
        }
    };

    return (
        <>
            <DataGridWithAdd
                columns={columns}
                rows={rows}
                onAddClick={onAddClick}
                onEditClick={onEditClick}
                onDeleteClick={(id) => onDeleteClick(String(id))} // ensure string id
            />

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editRow ? "Benutzer bearbeiten" : "Benutzer anlegen"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <TextField
                            label="Benutzername"
                            value={form.username}
                            onChange={e => setForm(f => ({...f, username: e.target.value}))}
                            required
                        />
                        <TextField
                            label="Vorname"
                            value={form.firstName}
                            onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                            required
                        />
                        <TextField
                            label="Nachname"
                            value={form.lastName}
                            onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                            required
                        />
                        <TextField
                            label="Rolle"
                            select
                            value={form.role}
                            onChange={e => setForm(f => ({...f, role: e.target.value as Role}))}
                            required
                        >
                            {["STUDENT", "TEACHER", "ADMIN"].map(r => (
                                <MenuItem key={r} value={r}>{r}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={editRow ? "Neues Passwort (optional)" : "Passwort"}
                            type="password"
                            value={form.password}
                            onChange={e => setForm(f => ({...f, password: e.target.value}))}
                            required={!editRow}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button onClick={onSave} variant="contained" disabled={loading}>
                        Speichern
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
