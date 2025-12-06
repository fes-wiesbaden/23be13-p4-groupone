import {useEffect, useState} from "react";
import API_CONFIG from "~/apiConfig";
import {useNavigate} from "react-router";
import {DataGrid} from "@mui/x-data-grid";
import {Autocomplete, Box, TextField} from "@mui/material";

interface CourseFilter {
    id: string;
    name: string;
    projects: ProjectFilter[];
}

interface ProjectFilter {
    id: string;
    name: string;
    questionCount: number;
}

interface QuestionbowRow {
    id: string;
    projectId: string;
    projectName: string;
    courseId: string;
    courseName: string;
    questionCount: number;
    amountStudents: number,
    amountSubmitted: number
}

type QuestionnaireResponse = {
    courses: {
        id: string;
        name: string;
        projects: {
            id: string;
            name: string;
            questionCount: number;
            totalStudent: number;
            submittedAnswers: number;
        }[];
    }[];
};

export default function QuestionbowSelection() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState<CourseFilter[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseFilter | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectFilter | null>(null);

    const [allRows, setAllRows] = useState<QuestionbowRow[]>([]);
    const [rows, setRows] = useState<QuestionbowRow[]>([]);

    const fetchQuestionnaires = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/fragebögen`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) return;
            const data: QuestionnaireResponse = await res.json();

            setCourses(data.courses);

            const rows = data.courses.flatMap(course =>
                course.projects.map(project => ({
                    id: project.id,
                    projectId: project.id,
                    projectName: project.name,
                    courseId: course.id,
                    courseName: course.name,
                    questionCount: project.questionCount,
                    amountStudents: project.totalStudent,
                    amountSubmitted: project.submittedAnswers
                }))
            );

            setAllRows(rows);
            setRows(rows);
        } catch (err) {
            console.error("Failed to fetch questionnaires:", err);
        }
    };

    useEffect(() => {
        fetchQuestionnaires();
    }, []);

    // filtering
    useEffect(() => {
        if (!selectedCourse) {
            setRows(allRows);
            return;
        }

        let filtered = allRows.filter(r => r.courseId === selectedCourse.id);

        if (selectedProject)
            filtered = filtered.filter(r => r.projectId === selectedProject.id);

        setRows(filtered);
    }, [selectedCourse, selectedProject]);

    const handleEdit = (row: QuestionbowRow) => {
        navigate(`/fragebogen/${row.id}`);
    };

    return (
        <>
            <Box display="flex" gap={2} mb={2}>
                <Autocomplete
                    options={courses}
                    value={selectedCourse}
                    getOptionLabel={(o) => o?.name ?? ""}
                    onChange={(_, v) => {
                        setSelectedCourse(v);
                        setSelectedProject(null);
                    }}
                    renderInput={(params) => (
                        <TextField {...params} label="Kurs"/>
                    )}
                    sx={{minWidth: 200}}
                />

                <Autocomplete
                    options={selectedCourse?.projects || []}
                    value={selectedProject}
                    getOptionLabel={(o) => o?.name ?? ""}
                    onChange={(_, v) => setSelectedProject(v)}
                    renderInput={(params) => (
                        <TextField {...params} label="Projekt"/>
                    )}
                    sx={{minWidth: 200}}
                    disabled={!selectedCourse}
                />
            </Box>

            <Box sx={{width: "100%"}}>
                <DataGrid<QuestionbowRow>
                    columns={[
                        {field: "projectName", headerName: "Projekt", flex: 1},
                        {field: "courseName", headerName: "Kurs", flex: 1},
                        {field: "questionCount", headerName: "Anzahl Fragen", flex: 1},
                        {field: "amountStudents", headerName: "Anzahl Schüler", flex: 1},
                        {field: "amountSubmitted", headerName: "Antworten", flex: 1}
                    ]}
                    rows={rows}
                    getRowId={(row) => row.id}
                    onRowClick={(params) => handleEdit(params.row)}
                    disableRowSelectionOnClick
                    sx={{width: "100%", cursor: "pointer"}}
                />
            </Box>
        </>
    );
}
