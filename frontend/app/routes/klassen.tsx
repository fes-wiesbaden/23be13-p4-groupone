import React, {useEffect, useState} from "react";
import type {Route} from "./+types/home";
import {deleteCourse} from "~/adminfunctions";
import DataTableWithAdd, {type DataRow,} from "../components/dataTableWithAddButton";
import Button from "@mui/material/Button";
import API_CONFIG from "../apiConfig";
import {Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,} from "@mui/material";

/**
 * @author Noah Bach
 * @author Daniel Hess
 *
 * UI for the Klassen (courses) administration.
 *
 * - Displays a table of classes.
 * - Allows creating, editing and deleting classes.
 * - Fetches courses from `/api/klassen`.
 *
 * @editetd Paul Geisthardt
 * - change dto
 * - less requests
 * - confirmation for delete
 */

interface CourseRow extends DataRow {
    id: string;
    courseName: string;
    teacherId?: string;
    teacherName?: string;
}

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Klassenübersicht"},
        {name: "description", content: "Welcome to React Router!"},
    ];
}

const columns = [
    {label: "Klasse", key: "courseName"},
    {label: "Klassenlehrer", key: "teacherName"},
];

type Role = "STUDENT" | "TEACHER" | "ADMIN";

interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    role: Role;
}

interface CourseDto {
    id: string;
    courseName: string;
    classTeacher: User;
}

export default function Klassen() {
    const [allCourses, setAllCourses] = useState<CourseRow[]>([]);
    const [editRow, setEditRow] = useState<CourseRow | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        courseName: "",
        teacherId: "",
    });
    const [teachers, setTeachers] = useState<User[]>([]);

    async function handleEditClick(row: CourseRow) {
        await fetchTeachers();
        setEditRow(row);
        setForm({courseName: row.courseName, teacherId: row.teacherId ?? ""});
        setOpen(true);
    }

    async function handleAddClick() {
        await fetchTeachers();
        setEditRow(null);
        setForm({courseName: "", teacherId: ""});
        setOpen(true);
        await fetchData();
    }

    async function handleDeleteClick(id: string) {
        if (!window.confirm("willst du diese klasse wirklich löschen?")) {
            return;
        }

        await deleteCourse(id);
        await fetchData();
    }

    const fetchData = async () => {
        try {
            const resCourses = await fetch(`${API_CONFIG.BASE_URL}/api/klassen`);
            const coursesData = await resCourses.json();

            const mapped: CourseRow[] = coursesData.map((c: CourseDto) => {
                return {
                    id: c.id,
                    courseName: c.courseName,
                    teacherId: c.classTeacher?.id ?? undefined,
                    teacherName: c.classTeacher
                        ? `${c.classTeacher.firstName} ${c.classTeacher.lastName}`
                        : "",
                };
            });
            setAllCourses(mapped);
        } catch (e) {
            console.error("Error fetching courses: ", e);
        }
    };

    const fetchTeachers = async (): Promise<User[]> => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/users?role=TEACHER`);
            if (!res.ok) {
                console.error("Failed to fetch teachers", res.status);
                return [];
            }
            const data: User[] = await res.json();
            setTeachers(data);
            return data;
        } catch (e) {
            console.error("Error fetching teachers: ", e);
            return [];
        }
    };

    const onSave = async () => {
        if (editRow) {
            const updateRequest = {
                courseName: form.courseName,
                teacherId: form.teacherId,
            };
            const res = await fetch(
                `${API_CONFIG.BASE_URL}/api/klassen/${editRow.id}`,
                {
                    method: "PUT",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(updateRequest),
                }
            );
            if (res.ok) {
                await fetchData();
                setOpen(false);
            } else {
                alert("Aktualisieren fehlgeschlagen.");
            }
        } else {
            const createRequest = {
                courseName: form.courseName,
                teacherId: form.teacherId,
            };
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/klassen`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(createRequest),
            });
            if (res.ok) {
                await fetchTeachers();
                await fetchData();
                setOpen(false);
            } else {
                alert("Erstellen fehlgeschlagen.");
            }
        }
    };

    useEffect(() => {
        (async () => {
            await fetchTeachers();
            await fetchData();
        })();
    }, []);
    return (
        <>
            <DataTableWithAdd<CourseRow>
                columns={columns}
                rows={allCourses}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
            />

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editRow ? "Klasse bearbeiten" : "Klasse anlegen"}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <TextField
                            label="Klasse"
                            value={form.courseName}
                            onChange={(e) =>
                                setForm((f) => ({...f, courseName: e.target.value}))
                            }
                            required
                        />
                        <TextField
                            select
                            label="Klassenlehrer"
                            value={form.teacherId}
                            onChange={(e) =>
                                setForm((f) => ({...f, teacherId: e.target.value}))
                            }
                            required
                        >
                            <MenuItem value="">-- Bitte wählen --</MenuItem>
                            {teachers.map((t) => (
                                <MenuItem key={t.id} value={t.id}>
                                    {t.firstName} {t.lastName}{" "}
                                    {t.username ? `(${t.username})` : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button
                        onClick={onSave}
                        variant="contained"
                        disabled={!form.courseName || !form.teacherId}
                    >
                        Speichern
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
