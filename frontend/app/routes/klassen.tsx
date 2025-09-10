import React, { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { postNewTestCourseEntry, deleteCourse, postGreeting } from "../adminfunctions.tsx";
import DataTableWithAdd from "../components/DataTableWithAddButton";
import Button from '@mui/material/Button';
import API_CONFIG from "../apiConfig";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Klassenübersicht" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const columns = [
    { label: "Klasse", key: "courseName"},
    // TODO: spalte für anzahl schüler
    // TODO: spalte für Klassenlehrer
];

export default function Klassen() {
    const [allCourses, setAllCourses] = useState<Course[]>([]);

    function printAllCourses() {
        console.log(allCourses);
    }
    async function handleAddClick() {
        await postNewTestCourseEntry();
        await fetchData();
        // sollte eigentlich tabelle updaten, hat nicht funktioniert, muss jemand machen der besser in ui ist
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resCourses = await fetch(`${API_CONFIG.BASE_URL}/api/klassen`);
                const coursesData = await resCourses.json();
                setAllCourses(coursesData);
            } catch (e) {
                console.error("Error fetching courses: ", e);
            }
        }
    fetchData();
    }, []);
    return(
        <>
            <Button
                onClick={printAllCourses}
                title="Log all Entries"
            >Log all Entries</Button>
            <DataTableWithAdd
                columns={columns}
                rows={allCourses.map(q => ({
                    ...q,
                }))}
                onAddClick={postNewTestCourseEntry}
                onEditClick={postGreeting}
                onDeleteClick={deleteCourse}
            />
        </>
    );
}