/*
 * @Author: Daniel Hess
 * @Date: 09/09/2024
 * Creates overview of all users with actions to edit, delete and add new users
 *
 * @Edited by Kebba Ceesay
 * @Date: 03/12/2025
 * Snackbar integration completed
 *
 * @Edited by Kebba Ceesay
 * @Date: 08/12/2025
 * Add dialog integration
 * 
 * @Edited by Noah Bach
 * @Date: 05/12/2025
 * Better usability for CSV import
 * (Snackbar, remove file from form on submit, reload on success)
 */
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import DataGridWithAdd, {
  type Column,
  type DataRow,
} from "../components/dataTableWithAddButton";
import { useCallback, useEffect, useState } from "react";
import API_CONFIG from "~/apiConfig";
import FileUpload from "~/components/fileUpload";
import CsvType from "~/types/csvType";
import useAlertDialog from "~/components/youSurePopup";
import CustomizedSnackbars from "../components/snackbar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

type Role = "STUDENT" | "TEACHER" | "ADMIN";

interface UserRow extends DataRow {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  password: string;
}

interface UpdateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  password?: string;
}

const columns: Column[] = [
  { key: "username", label: "Benutzername" },
  { key: "firstName", label: "Vorname" },
  { key: "lastName", label: "Nachname" },
  { key: "role", label: "Rolle" },
];

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const handleSnackbarClose = () => { setSnackbarOpen(false);};

  const [editRow, setEditRow] = useState<UserRow | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    role: "STUDENT" as Role,
    password: "",
  });
  const [error, setError] = useState<Record<string, string>>({});
  const [confirm, ConfirmDialog] = useAlertDialog("Wirklich löschen?", "Wollen Sie den Benutzer wirklich löschen?");
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) {
      newErrors.username = "Benutzername ist erforderlich";
    } else if (form.username.length < 3 || form.username.length > 50) {
      newErrors.username =
        "Benutzername muss zwischen 3 und 50 Zeichen lang sein";
    }

    if (!form.firstName.trim()) {
      newErrors.firstName = "Vorname ist erforderlich";
    } else if (form.firstName.length < 3 || form.firstName.length > 50) {
      newErrors.firstName = "Vorname muss zwischen 3 und 50 Zeichen lang sein";
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = "Nachname ist erforderlich";
    } else if (form.lastName.length < 3 || form.lastName.length > 50) {
      newErrors.lastName = "Nachname muss zwischen 3 und 50 Zeichen lang sein";
    }
    if (!form.role) {
      newErrors.role = "Rolle ist erforderlich";
    }
    if (
      form.password.trim().length > 0 &&
      (form.password.length < 8 || form.password.length > 50)
    ) {
      newErrors.password = "Passwort muss zwischen 8 und 50 Zeichen lang sein";
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`GET /api/users ${res.status}`);
      const data: Array<{
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        role: Role;
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
    setForm({
      username: "",
      firstName: "",
      lastName: "",
      role: "STUDENT",
      password: "",
    });
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
    if (!await confirm())
      return;

    const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      console.error("Fehler beim Löschen des Benutzers:", res.statusText);

      setSnackbarMessage(`Fehler beim Löschen! Code: ${res.status}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpen(false);
    setSnackbarMessage("Benutzer wurde erfolgreich gelöscht!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const onSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (editRow) {
      const updateRequest: UpdateUserRequest = {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
      };

      if (form.password.trim().length > 0) {
        updateRequest.password = form.password;
      }

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/${editRow.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateRequest),
      });

      if (!res.ok) {
        console.error("Fehler beim Aktualisieren des Benutzers:", res.statusText);

        setSnackbarMessage(`Fehler beim Bearbeiten! Code: ${res.status}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      await load();
      setOpen(false);
      setSnackbarMessage("Benutzer wurde erfolgreich bearbeitet!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } else {
      const createRequest: CreateUserRequest = {
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        role: form.role,
        password: form.password,
      };

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(createRequest),
      });
      if (!res.ok) {
        console.error("Fehler beim Erstellen des Benutzers:", res.statusText);
        setSnackbarMessage(`Fehler beim Erstellen! Code: ${res.status}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      await load();
      setOpen(false);
      setSnackbarMessage("Benutzer wurde erfolgreich erstellt!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  return (
    <Box p={2}>
      <FileUpload
        accept={".csv"}
        type={CsvType.USERS}
        url={`${API_CONFIG.BASE_URL}/api/csv/upload`}
        upload_name={"Hochladen der CSV"}
        select_name={"Wählen Sie eine Nutzer-CSV aus"}
        doAfterUpload={load}
      />

      <Box py={2}>
        <Divider/>
      </Box>

      <DataGridWithAdd<UserRow>
        title="Benutzer"
        addButtonLabel="Neuer Benutzer"
        columns={columns}
        rows={rows}
        onAddClick={onAddClick}
        onEditClick={onEditClick}
        onDeleteClick={(id) => onDeleteClick(String(id))}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editRow ? "Benutzer bearbeiten" : "Benutzer anlegen"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Benutzername"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
              error={!!error.username}
              helperText={error.username}
            />
            <TextField
              label="Vorname"
              value={form.firstName}
              onChange={(e) =>
                setForm((f) => ({ ...f, firstName: e.target.value }))
              }
              required
              error={!!error.firstName}
              helperText={error.firstName}
            />
            <TextField
              label="Nachname"
              value={form.lastName}
              onChange={(e) =>
                setForm((f) => ({ ...f, lastName: e.target.value }))
              }
              required
              error={!!error.lastName}
              helperText={error.lastName}
            />
            <TextField
              label="Rolle"
              select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as Role }))
              }
              required
              error={!!error.role}
              helperText={error.role}
            >
              {["STUDENT", "TEACHER", "ADMIN"].map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label={editRow ? "Neues Passwort (optional)" : "Passwort"}
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required={!editRow}
              error={!!error.password}
              helperText={error.password}
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
      <CustomizedSnackbars
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
      />
      {ConfirmDialog}
    </Box>
  );
}
