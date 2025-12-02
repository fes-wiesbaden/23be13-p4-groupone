import {useAuth} from "~/contexts/AuthContext";
import {Role} from "~/types/models";
import {useState} from "react";
import Button from "@mui/material/Button";
import FragebogenTable, {type FragebogenRow, QuestionType} from "~/components/fragebogen";
import Box from "@mui/material/Box";

export default function Questionbow() {
    const {user, isAuthenticated, isLoading} = useAuth();
    const [previewAsStudent, setPreviewAsStudent] = useState(false);

    if (isLoading) return <>Loading User...</>
    if (!isAuthenticated) return <>:( unauthenticated</>
    const togglePreview = () => setPreviewAsStudent(prev => !prev);

    const saveQuestions = async () => {

    }

    const sampleQuestions: FragebogenRow[] = [
        {
            id: "1",
            question: "wie zufrieden bist du?",
            type: QuestionType.GRADE
        }
    ]

    return (
        <>
            {(user?.role === Role.ADMIN || user?.role === Role.TEACHER) ? (
                <Box
                    px={2}
                    py={2}
                >
                    <Button onClick={togglePreview} variant="contained">
                        {previewAsStudent ? "Edit Mode" : "Preview as Student"}
                    </Button>
                    <FragebogenTable
                        rows={sampleQuestions}
                        onSubmit={saveQuestions}
                        studentNames={["Alice","Bob"]}
                        editView={!previewAsStudent}
                    />
                </Box>
            ) : (
                <>
                    <FragebogenTable
                        rows={sampleQuestions}
                        studentNames={["Alice","Bob"]}
                        onSubmit={saveQuestions}
                        editView={false}
                    />
                </>
            )}
        </>
    )
}