import React, {useEffect, useState} from "react";
import type {Route} from "./+types/home";
import {deleteCourse} from "~/adminfunctions";
import DataTableWithAdd, {type DataRow,} from "../components/dataTableWithAddButton";
import API_CONFIG from "../apiConfig";
import {useNavigate} from "react-router";
import type {CourseDto} from "~/types/models";
import useAlertDialog from "~/components/youSurePopup";
import CustomizedSnackbars from "~/components/snackbar"

/**
 * @author Noah Bach
 * @author Daniel Hess
 *
 * UI for courses administration.
 *
 * - Displays a table of classes.
 * - Allows creating, editing and deleting classes.
 * - Fetches courses from `/api/course`.
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

export default function Klassen() {
    const [allCourses, setAllCourses] = useState<CourseRow[]>([]);
    const navigate = useNavigate();

    const [confirm, ConfirmDialog] = useAlertDialog("Wirklich löschen?", "Wollen Sie die Klasse wirklich löschen?")
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    async function handleEditClick(row: CourseRow) {
        navigate(`/klassen/${row.id}`);
    }

    async function handleAddClick() {
        navigate("/klassen/new");
    }

    async function handleDeleteClick(id: string) {
        if (!await confirm())
            return;

        if (!await deleteCourse(id)) {
            setSnackbarMessage(`Fehler beim Löschen vom Kurs`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return
        }
        await fetchData();
    }

    const fetchData = async () => {
        try {
            const resCourses = await fetch(`${API_CONFIG.BASE_URL}/api/course`, {
                method: "GET",
                credentials: "include",
            });
            if (!resCourses.ok) {
                setSnackbarMessage(`Fehler beim Laden vom Kursen: ${resCourses.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
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
        } catch (e: any) {
            console.error("Error fetching courses: ", e);
            setSnackbarMessage(`Fehler beim Laden vom Kursen: ${e.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        (async () => {
            await fetchData();
        })();
    }, []);
    return (
        <>
            <DataTableWithAdd<CourseRow>
                title="Klassen"
                addButtonLabel="Neue Klasse"
                columns={columns}
                rows={allCourses}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
            />
            {ConfirmDialog}
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </>
    );
}
