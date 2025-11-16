import React, {useState, useEffect} from "react";
import type {Route} from "./+types/home";
import {postNewTestCourseEntry, deleteCourse, postGreeting} from "../adminfunctions";
import DataTableWithAdd, {type DataRow} from "../components/dataTableWithAddButton";
import Button from '@mui/material/Button';
import API_CONFIG from "../apiConfig";
import {Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField} from "@mui/material";

interface CourseRow extends DataRow{
    id: string;
    courseName: string;
    teacherId: string;
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Klassenübersicht"},
        {name: "description", content: "Welcome to React Router!"},
    ];
}

const columns = [
    {label: "Klasse", key: "courseName"},
    {label: "Klassenlehrer", key: "teacherId"},
// todo: switch to teacher name
];

type Role = "STUDENT" | "TEACHER" | "ADMIN";

interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
}



export default function Klassen() {
    const [allCourses, setAllCourses] = useState<CourseRow[]>([]);
    const [editRow, setEditRow] = useState<CourseRow | null>(null)
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        courseName: "",
        teacherId: "",
    });
// todo: delete later
    function printAllCourses() {
        console.log(allCourses);
    }

    async function handleAddClick() {
        setEditRow(null);
        setForm({courseName: "", teacherId: ""});
        setOpen(true);
        await fetchData();
    }

    async function handleDeleteClick(id: string) {
        await deleteCourse(id);
        await fetchData();
    }

    const fetchData = async () => {
        try {
            const resCourses = await fetch(`${API_CONFIG.BASE_URL}/api/klassen`);
            const coursesData = await resCourses.json();
            setAllCourses(coursesData);
        } catch (e) {
            console.error("Error fetching courses: ", e);
        }
    }

    const onSave = async () => {
        if (editRow) {
            const updateRequest = {
                courseName: form.courseName,
                teacherId: form.teacherId,
            };
            const res = await fetch(`http://localhost:8080/api/klassen/${editRow.id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(updateRequest),
            });
            if (res.ok) {
                await fetchData();
                setOpen(false);
            } else {
                alert("Aktualisieren fehlgeschlagen.");
            }
        }
        else {
            console.log("create");
            const createRequest = {
                courseName: form.courseName,
                teacherId: form.teacherId,
            };
            const res = await fetch("http://localhost:8080/api/klassen", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(createRequest),
            });
        }
    }

    useEffect(() => {
        fetchData();
    }, []);
    return (
        <>
            <Button
                onClick={printAllCourses}
                title="Log all Entries"
            >Log all Entries</Button>
            <DataTableWithAdd<CourseRow>
                columns={columns}
                rows={allCourses}
                onAddClick={handleAddClick}
                onEditClick={postGreeting}
                onDeleteClick={handleDeleteClick}
            />

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{editRow ? "Benutzer bearbeiten" : "Benutzer anlegen"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <TextField
                            label="Klasse"
                            value={form.courseName}
                            onChange={e => setForm(f => ({...f, courseName: e.target.value}))}
                            required
                        />
                        <TextField
                            label="Klassenlehrer"
                            value={form.teacherId}
                            onChange={e => setForm(f => ({...f, teacherId: e.target.value}))}
                            required
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button onClick={onSave} variant="contained">
                        Speichern
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}