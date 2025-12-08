import React, { useState, useEffect } from "react";
import DataGridWithAdd, {
  type DataRow,
} from "../components/dataTableWithAddButton";
import API_CONFIG from "../apiConfig";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import useAlertDialog from "~/components/youSurePopup";
import CustomizedSnackbars from "../components/snackbar";

/**
 * @author: Michael Holl
 * <p>
 *   Component to add, edit & delete subjects
 * </p>
 *
 * @Edited by Kebba Ceesay
 * <p>
 *    Snackbar integration completed
 * </p>
 *
 * @Edited by Noah Bach
 * <p>
 *    Add Dialog integration
 * </p>
 *
 **/

export interface Subject extends DataRow {
  id: string;
  name: string;
  shortName: string;
  description: string;
  learningField: boolean;
}

export default function Subject() {
  const [openDialog, setOpenDialog] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [originalSubject, setOriginalSubject] = useState<Subject | null>(null);
  const [confirm, ConfirmDialog] = useAlertDialog("Wirklich löschen?", "Wollen Sie das Fach wirklich löschen?");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // load all subjects
        const resSubjects = await fetch(
          `${API_CONFIG.BASE_URL}/api/subject/findAll`, {
            credentials: "include" });
        const subjectsData = await resSubjects.json();
        setAllSubjects(subjectsData);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchData();
  }, []);

  const handleCloseDialog = () => setOpenDialog(false);

  const handleAddClick = () => {
    const newSubject: Subject = {
      id: "",
      name: "",
      shortName: "",
      description: "",
      learningField: true,
    };
    setEditingSubject(newSubject);
    setOriginalSubject(null);
    setOpenDialog(true);
  };

  const handleEditClick = (row: Subject) => {
    setEditingSubject({ ...row });
    setOriginalSubject({ ...row });
    setOpenDialog(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!await confirm())
      return;

    try {
      //delete subject
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/subject/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        setSnackbarMessage(`Fehler beim Löschen: ${res.status}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        alert("Löschen fehlgeschlagen.");
        return;
      }
      setAllSubjects((prev) => prev.filter((subject) => subject.id !== id));
      setSnackbarMessage("Der Eintrag wurde erfolgreich gelöscht!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error("Error deleting subject:", err);
      setSnackbarMessage(`Fehler beim Löschen: ${err.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      alert("Löschen fehlgeschlagen.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingSubject) return;

    if (
      originalSubject &&
      editingSubject.name === originalSubject.name &&
      editingSubject.shortName === originalSubject.shortName &&
      editingSubject.description === originalSubject.description &&
      editingSubject.learningField === originalSubject.learningField
    ) {
      setOpenDialog(false);
      return;
    }

    try {
      let res;
      if (editingSubject.id) {
        //update subject
        res = await fetch(
          `${API_CONFIG.BASE_URL}/api/subject/${editingSubject.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(editingSubject),
          }
        );
        if (res.ok) {
          const updated = await res.json();
          setAllSubjects((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
          );
          showSnackbar(`Das ${updated.learningField ? "Lernfeld" : "Schulfach"} "${updated.name}" wurde erfolgreich bearbeitet!`);
        }
      } else {
        // Create subject
        res = await fetch(`${API_CONFIG.BASE_URL}/api/subject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editingSubject),
        });
        if (res.ok) {
          const newSubject = await res.json();
          setAllSubjects((prev) => [...prev, newSubject]);
          showSnackbar(`Das ${newSubject.learningField ? "Lernfeld" : "Schulfach"} "${newSubject.name}" wurde erfolgreich erstellt!`);
        } else {
          showSnackbar("Fehler beim Erstellen des Lernbereichs!", "error");
        }
      }
    } catch (err) {
      console.error("Error submitting subject:", err);
    }

    setOpenDialog(false);
  };

  return (
    <>
      <DataGridWithAdd<Subject>
        columns={[
          { label: "Name", key: "name" },
          { label: "Abkürzung", key: "shortName" },
          { label: "Beschreibung", key: "description" },
          { label: "Typ", key: "type" },
        ]}
        rows={allSubjects.map((s) => ({
          ...s,
          type: s.learningField ? "Lernfeld" : "Schulfach",
        }))}
        onAddClick={handleAddClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingSubject?.id ? "Bearbeite Lernbereich" : "Neuer Lernbereich"}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} id="newSubjectForm">
            <TextField
              autoFocus
              required
              margin="dense"
              label="Name"
              fullWidth
              multiline
              value={editingSubject?.name || ""}
              onChange={(e) =>
                editingSubject &&
                setEditingSubject({ ...editingSubject, name: e.target.value })
              }
            />
            <TextField
                autoFocus
                required
                margin="dense"
                label="Abkürzung"
                fullWidth
                value={editingSubject?.shortName || ""}
                onChange={(e) =>
                    editingSubject &&
                    setEditingSubject({ ...editingSubject, shortName: e.target.value })
                }
            />
            <TextField
              margin="dense"
              label="Beschreibung"
              fullWidth
              multiline
              value={editingSubject?.description || ""}
              onChange={(e) =>
                editingSubject &&
                setEditingSubject({
                  ...editingSubject,
                  description: e.target.value,
                })
              }
            />
            <FormControl>
              <FormLabel required id="type-label">
                Typ
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="type-label"
                value={editingSubject?.learningField ? "true" : "false"}
                onChange={(e) =>
                  editingSubject &&
                  setEditingSubject({
                    ...editingSubject,
                    learningField: e.target.value === "true",
                  })
                }
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Lernfeld"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="Schulfach"
                />
              </RadioGroup>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Abbrechen</Button>
          <Button type="submit" form="newSubjectForm">
            {editingSubject?.id ? "Speichern" : "Hinzufügen"}
          </Button>
        </DialogActions>
      </Dialog>
      <CustomizedSnackbars
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
      {ConfirmDialog}
    </>
  );
}
