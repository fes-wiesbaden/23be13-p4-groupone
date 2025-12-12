import React, {useEffect, useState} from "react";
import type {Route} from "./+types/home";
// import {deleteCourse} from "~/adminfunctions";
import DataTableWithAdd, {type DataRow,} from "../components/dataTableWithAddButton";
import API_CONFIG from "../apiConfig";
import { useNavigate } from "react-router";
import CustomizedSnackbars from "../components/snackbar";
import { useLocation } from "react-router";
import useAlertDialog from "~/components/youSurePopup";
import type { CourseDto } from "~/types/models";

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
    teacherName?: string;
}

interface CourseBareDto {
    id: string,
    courseName: string,
    classTeacherName: string
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.snackbarMessage) {
      setSnackbarMessage(location.state.snackbarMessage);
      setSnackbarSeverity(location.state.snackbarSeverity || "success");
      setSnackbarOpen(true);
    }
  }, [location.state]);

    const [confirm, ConfirmDialog] = useAlertDialog("Wirklich löschen?", "Wollen Sie die Klasse wirklich löschen?")
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
    if (!await confirm()) return;
  
    try {
      await deleteCourse(id, showSnackbar);
      await fetchData();
    } catch (error) {
      console.error(error);
    }
  }



  const fetchData = async () => {
    try {
      const resCourses = await fetch(`${API_CONFIG.BASE_URL}/api/course`, {
        method: "GET",
        credentials: "include",
      });
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
  }

  const deleteCourse = async function(id: string, showSnackbar: (message: string, severity: "success" | "error") => void) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        showSnackbar(`Fehler beim Löschen der Klasse! ${res.status}`, "error");
        return;
      }

      showSnackbar("Die Klasse wurde erfolgreich gelöscht!", "success");
    } catch (e) {
      console.error("Request failed: ", e);
      showSnackbar("Fehler beim Löschen der Klasse!", "error");
    }
  }

  useEffect(() => {
    (async () => {
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
      {ConfirmDialog}
      <CustomizedSnackbars
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
}
