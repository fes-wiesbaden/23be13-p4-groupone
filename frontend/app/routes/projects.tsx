import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle, MenuItem, TextField,
} from "@mui/material";
import DataTableWithAdd, {type DataRow} from "~/components/dataTableWithAddButton";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router"
import API_CONFIG from "~/apiConfig";

interface ProjectStartDate {
    year: number,
    month: number,
    day: number,
}

interface ProjectResponse {
    projectId: string;
    projectName: string;

    courseId: string;
    courseName: string;

    teacherId: string;
    teacherName: string;

    groupsAmount: number;

    projectStart: ProjectStartDate,
}

interface ProjectRow extends DataRow {
    projectName: string,
    classTeacherName: string,
    className: string,
    groupsAmount: number,
    projectStart: string,
    original: ProjectResponse
}

interface CourseDto {
    id: string;
    courseName: string;
    classTeacherName: string;
}

const columns = [
    { label: "Projektname", key: "projectName" },
    { label: "Klassenlehrer", key: "classTeacherName" },
    { label: "Klasse", key: "className" },
    { label: "Gruppenanzahl", key: "groupsAmount" },
    { label: "Projekt Start Datum", key: "projectStart"}
];

function mapProjectsToRows(data: ProjectResponse[]): ProjectRow[] {
    return data.map((p) => ({
        id: p.projectId,
        projectName: p.projectName,
        classTeacherName: p.teacherName,
        className: p.courseName,
        groupsAmount: p.groupsAmount ? p.groupsAmount : "nicht initialisiert",
        projectStart: `${p.projectStart.day}.${p.projectStart.month}.${p.projectStart.year}`,
        original: p
    }));
}

export default function Projects () {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | {
        message: string;
        retry?: (() => void);
    }>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [newProject, setNewProject] = useState({
        projectName: "",
        courseId: "",
        projectStart: new Date().toISOString().substring(0, 10)
    });

    const makeRetry = (fn: () => void) => () => {
        setError(null);
        setLoading(true);
        fn();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewProject({ ...newProject, [e.target.name]: e.target.value });
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/all`, {method: "GET",});
            const raw: ProjectResponse[] = await res.json();

            setProjects(raw);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError({
                message: "Failed to fetch projects",
                retry: makeRetry(fetchProjects),
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/all/bare`);
            const coursesDto = await res.json();

            setCourses(coursesDto)
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            // setError({
            //     message: "failed to fetch courses",
            // });
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    const rows = mapProjectsToRows(projects);

    if (loading) return <p>Loading projects...</p>;
    if (error) return (
        <p>
            {error.message}
            {error.retry && (
                <>
                    {" "}
                    <Button onClick={error.retry} variant="contained">Retry</Button>
                </>
            )}
        </p>);


    const handleAddClick = () => {
        fetchCourses()
        setOpenDialog(true);
    }

    const handleCloseDialog = () => setOpenDialog(false);

    const handleEditClick = () => {

    }

    const handleDeleteClick = () => {

    }

    const handleRowClick = (row: ProjectRow) => {
        navigate(`/projekte/${row.original.projectId}`);
    }

    const handleCreateAndGo = async () => {
        if (!newProject.projectName || !newProject.projectStart || !newProject.courseId) {
            alert("Bitte alle Pflichtfelder ausfüllen")
            return;
        }

        const [year, month, day] = newProject.projectStart.split("-").map(Number);
        const startDate: ProjectStartDate = {
            year,
            month,
            day
        }

        const payload = {
            projectName: newProject.projectName,
            courseId: newProject.courseId,
            projectStart: startDate
        };

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                setError({
                    message: "failed to create project",
                    retry: makeRetry(handleCreateAndGo)
                })
                return;
            }

            const created = await res.json();

            console.log(created)

            navigate(`/projekte/${created.projectSummary.projectId}`)

        } catch (err) {
            console.error(err);
            setError({
                message: "failed to create project",
                retry: makeRetry(handleCreateAndGo)
            })
        }
    }

    return (
        <>
            <DataTableWithAdd<ProjectRow>
                columns={columns}
                rows={rows}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onRowClick={handleRowClick}
            />
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Neues Projekt</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        maxRows={4}
                        margin="dense"
                        name="projectName"
                        label="Projekt Name"
                        value ={newProject.projectName}
                        onChange={handleInputChange}
                        type="text"
                        fullWidth
                        multiline
                    />

                    <TextField
                        select
                        label="Klasse"
                        name="courseId"
                        value={newProject.courseId}
                        margin="dense"
                        onChange={handleInputChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="">-- Bitte wählen --</MenuItem>
                        {courses.map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                                {c.courseName} | {c.classTeacherName}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        required
                        label="Projekt Start"
                        name="projectStart"
                        type="date"
                        value={newProject.projectStart}
                        onChange={handleInputChange}
                        fullWidth
                        margin="dense"
                    />

                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Abbrechen</Button>
                    <Button type="submit" onClick={handleCreateAndGo}>
                        Hinzufügen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}