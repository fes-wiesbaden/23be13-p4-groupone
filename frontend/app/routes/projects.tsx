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
    unassignedStudentsAmount: number;

    projectStart: ProjectStartDate,
}

interface ProjectRow extends DataRow {
    projectName: string,
    classTeacherName: string,
    className: string,
    groupsAmount: number,
    projectStart: string,
    unassignedStudentsAmount: number;
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
    { label: "Start Datum", key: "projectStart"},
    { label: "Nicht zugewiesen Schüler", key: "unassignedStudentsAmount"}
];

function mapProjectsToRows(data: ProjectResponse[]): ProjectRow[] {
    return data.map((p) => ({
        id: p.projectId,
        projectName: p.projectName,
        classTeacherName: p.teacherName,
        className: p.courseName,
        groupsAmount: p.groupsAmount ? p.groupsAmount : 0,
        projectStart: `${p.projectStart.day}.${p.projectStart.month}.${p.projectStart.year}`,
        unassignedStudentsAmount: p.unassignedStudentsAmount,
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

    const makeRetry = (fn: () => void) => () => {
        setError(null);
        setLoading(true);
        fn();
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
        navigate(`/projekte/new`)
    }

    const handleEditClick = (row: ProjectRow) => {
        navigate(`/projekte/${row.original.projectId}`)
    }

    const handleDeleteClick = async (id: string) => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/delete/${id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                alert("Failed to delete project")
                return
            }

            setProjects(prevState => prevState.filter(p => p.projectId !== id))
        } catch (err: any) {
            alert(`Failed to delete project: ${err.message}`)
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
            />
        </>
    );
}