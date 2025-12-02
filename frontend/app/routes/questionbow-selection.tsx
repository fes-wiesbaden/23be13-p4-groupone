import DataTableWithAdd, {type DataRow} from "~/components/dataTableWithAddButton";
import {useEffect, useState} from "react";
import API_CONFIG from "~/apiConfig";
import {useNavigate} from "react-router";

interface QuestionbowRow extends DataRow {
    id: string;
    projectName: string;
    courseName: string;
    questionCount: number;
}

type QuestionnaireResponse = {
    projectId: string,
    projectName: string,
    courseId: string,
    courseName: string,
    questionCount: number
}

export default function QuestionbowSelection() {
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState<QuestionbowRow[]>([]);


    const fetchQuestionnaires = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/with-questions`, {method: "GET", credentials: "include"});

            if (!res.ok) {
                return;
            }

            const data: QuestionnaireResponse[] = await res.json();
            const rows: QuestionbowRow[] = data.map((item) => ({
                id: item.projectId,
                projectName: item.projectName,
                courseName: item.courseName,
                questionCount: item.questionCount,
            }));
            setQuestionnaires(rows);
        } catch (err: any) {
            console.error("Failed to fetch questionnaires:", err);
        }
    }

    useEffect(() => {
        fetchQuestionnaires()
    }, []);

    const handleAdd = () => {
        navigate(`/fragebogen/new`)
    };

    const handleDelete = () => {
    };

    const handleEdit = (row: QuestionbowRow) => {
        navigate(`/fragebogen/${row.id}`);
    };

    return (
        <>
            <DataTableWithAdd<QuestionbowRow>
                columns={[
                    {key: "projectName", label: "Projekt"},
                    {key: "courseName", label: "Kurs"},
                    {key: "questionCount", label: "Anzahl Fragen"},
                ]}
                rows={questionnaires}
                onAddClick={handleAdd}
                onDeleteClick={handleDelete}
                onEditClick={handleEdit}
            />
        </>
    )
}