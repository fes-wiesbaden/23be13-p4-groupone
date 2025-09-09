import type { Route } from "./+types/home";
import { postNewCourseEntry } from "../adminfunctions.tsx";
import Button from '@mui/material/Button';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Klassenübersicht" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Klassen() {
    return(
        <>
            <Button
                onClick={postNewCourseEntry}
                title="Create New Course"
            >Create New Course</Button>
        </>
    );
}