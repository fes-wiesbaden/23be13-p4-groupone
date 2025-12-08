import React, { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import { deleteCourse } from "~/adminfunctions";
import DataTableWithAdd, {
  type DataRow,
} from "../components/dataTableWithAddButton";
import API_CONFIG from "../apiConfig";
import { useNavigate } from "react-router";

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
    { title: "Klassenübersicht" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const columns = [
  { label: "Klasse", key: "courseName" },
  { label: "Klassenlehrer", key: "teacherName" },
];

import type { User, Role, CourseDto } from "../types/models";
import useAlertDialog from "~/components/youSurePopup";

export default function Klassen() {
  const [allCourses, setAllCourses] = useState<CourseRow[]>([]);
  const navigate = useNavigate();

  const [confirm, ConfirmDialog] = useAlertDialog("Wirklich löschen?", "Wollen Sie die Klasse wirklich löschen?")

  async function handleEditClick(row: CourseRow) {
    navigate(`/klassen/${row.id}`);
  }

  async function handleAddClick() {
    navigate("/klassen/new");
  }

  async function handleDeleteClick(id: string) {
    if (!await confirm())
      return;

    await deleteCourse(id);
    await fetchData();
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
  };

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
    </>
  );
}
