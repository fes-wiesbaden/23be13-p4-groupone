import {useAuth} from "~/contexts/AuthContext";
import {Role} from "~/types/models";
import {useEffect, useState} from "react";
import FragebogenTable, {
    type FragebogenRow,
    type FragebogenStudent,
    NO_GRADE_SELECTED,
    QuestionnaireActivityStatus,
    QuestionType,
    ViewType
} from "~/components/fragebogen";
import Box from "@mui/material/Box";
import {useParams} from "react-router-dom";
import {Autocomplete, LinearProgress, TextField, ToggleButton, ToggleButtonGroup, Typography} from "@mui/material";
import API_CONFIG from "~/apiConfig";
import type {ProjectDetailGroup} from "~/routes/createOrEditProject";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import {useNavigate} from "react-router";
import CustomizedSnackbars from '~/components/snackbar';


interface ProjectWithQuestionAndGroups {
    projectId: string;
    projectName: string;
    groups: ProjectDetailGroup[];
    questions: Question[];
    status: QuestionnaireActivityStatus;
}


interface Question {
    id: string;
    text: string;
    type: QuestionType;
}

type FragebogenPutRequest = {
    questions: Question[],
    status: QuestionnaireActivityStatus
}

export interface StudentAnswerDTO {
    studentId: string,
    answer: string | number
}

export interface ProjectQuestionAnswerDTO {
    questionId: string,
    answers: StudentAnswerDTO[]
}

export interface ProjectQuestionAnswersDTO {
    questions: ProjectQuestionAnswerDTO[]
}

export interface DetailedStudentAnswerDTO {
    authorId: string,
    recipientId: string,
    answer: string | number
}

export interface DetailedProjectQuestionAnswerDTO {
    questionId: string,
    answers: DetailedStudentAnswerDTO[]
}

export interface DetailedProjectQuestionAnswersDTO {
    questions: DetailedProjectQuestionAnswerDTO[]
}

export interface StudentGradeAverageDTO {
    studentId: string,
    studentName: string,
    averageGrade: number | null,
    totalGrades: number,
    selfAssessment: number | null,
    peerAssessment: number | null
}

export interface ProjectGradeAveragesDTO {
    studentAverages: StudentGradeAverageDTO[]
}

export default function Questionbow() {
    let {projectId} = useParams<{ projectId: string }>();
    const {user, isAuthenticated, isLoading} = useAuth();

    const [projectGroups, setProjectGroups] = useState<ProjectDetailGroup[] | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<ProjectDetailGroup | null>(null);
    const [projectQuestions, setProjectQuestions] = useState<FragebogenRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false)
    const [questionBowStatus, setQuestionBowStatus] = useState<QuestionnaireActivityStatus | null>(null)
    const [viewMode, setViewMode] = useState<ViewType>(ViewType.EDIT)
    const [loadingAnswers, setLoadingAnswers] = useState(false)
    const [selectedStudentFilter, setSelectedStudentFilter] = useState<string | null>(null)
    const [submissionStatus, setSubmissionStatus] = useState<Map<string, boolean>>(new Map())
    const [gradeAverages, setGradeAverages] = useState<StudentGradeAverageDTO[]>([])
    const [loadingAverages, setLoadingAverages] = useState(false)
    const [submittedAnswers, setSubmittedAnswers] = useState(false)
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const navigate = useNavigate();

    const groupMembers: FragebogenStudent[] = (() => {
        if (!selectedGroup) return [];

        const fullNames = selectedGroup.members.map(s => `${s.firstName} ${s.lastName}`);

        const counts: Record<string, number> = {};
        for (const name of fullNames) {
            counts[name] = (counts[name] ?? 0) + 1;
        }

        const members: FragebogenStudent[] = selectedGroup.members.map(member => {
            let studentName: string;

            if (user && member.username === user.username) {
                studentName = "Selbsteinschätzung";
            } else {
                const fullName = `${member.firstName} ${member.lastName}`;
                studentName = counts[fullName] > 1 ? `${fullName} (${member.username})` : fullName;
            }

            return {
                studentName: studentName,
                studentId: member.studentId,
                hasSubmitted: submissionStatus.get(member.studentId) ?? false
            }
        });

        members.sort((a, b) => {
            if (a.studentName === "Selbsteinschätzung") return -1;
            if (b.studentName === "Selbsteinschätzung") return 1;
            return 0;
        });

        return members;
    })();

    useEffect(() => {
        if (!projectId) return;

        const fetchProjectData = async () => {
            setLoadingProject(true)
            try {
                const url =
                    user?.role === Role.STUDENT
                        ? `${API_CONFIG.BASE_URL}/api/project/${projectId}/myGroup`
                        : `${API_CONFIG.BASE_URL}/api/project/${projectId}/groups`;

                const res = await fetch(url, {credentials: "include"});

                if (!res.ok) {
                    setSnackbarMessage(`Fehler beim Laden vom Projekt: ${res.status}`);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                    return;
                }

                const data: ProjectWithQuestionAndGroups = await res.json();

                data.groups = data.groups.filter(g => g.members && g.members.length > 0);

                setProjectGroups(data.groups);

                if (user?.role === Role.STUDENT) {
                    const myGroup = data.groups.find(group =>
                        group.members.some(member => member.username === user.username)
                    );
                    setSelectedGroup(myGroup ?? null);
                }

                const questions: FragebogenRow[] = data.questions.map(q => ({
                    id: q.id,
                    question: q.text,
                    type: q.type
                }))
                setProjectQuestions(questions)

                setQuestionBowStatus(data.status)
            } catch (err: any) {
                console.error(err);
                setSnackbarMessage(`Fehler beim Laden vom Projekt: ${err.message}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
            } finally {
                setLoadingProject(false)
            }
        };

        fetchProjectData();
    }, [projectId, user]);

    useEffect(() => {
        if (viewMode === ViewType.STUDENT_ANSWERS && selectedGroup && projectId) {
            const fetchAnswers = async () => {
                setLoadingAnswers(true);
                try {
                    const res = await fetch(
                        `${API_CONFIG.BASE_URL}/api/project/${projectId}/group/${selectedGroup.groupId}/fragebogenAnswers`,
                        {credentials: "include"}
                    );
                    if (!res.ok) {
                        setSnackbarMessage(`Fehler beim Laden vom Fragebogen: ${res.status}`);
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                        return;
                    }

                    const data: DetailedProjectQuestionAnswersDTO = await res.json();

                    const statusMap = new Map<string, boolean>();
                    if (selectedGroup.members) {
                        selectedGroup.members.forEach(member => {
                            const hasSubmitted = data.questions.some(q =>
                                q.answers.some(a =>
                                    a.authorId === member.studentId &&
                                    ((typeof a.answer === 'number' && a.answer !== NO_GRADE_SELECTED) ||
                                        (typeof a.answer === 'string' && a.answer.trim() !== ''))
                                )
                            );
                            statusMap.set(member.studentId, hasSubmitted);
                        });
                    }
                    setSubmissionStatus(statusMap);

                    setProjectQuestions(prevQuestions =>
                        prevQuestions.map(q => {
                            const answerData = data.questions.find(qa => qa.questionId === q.id);
                            if (answerData) {
                                const answersByRecipient = answerData.answers.map(a => ({
                                    studentId: a.recipientId,
                                    authorId: a.authorId,
                                    answer: a.answer
                                }));

                                return {
                                    ...q,
                                    answer: answersByRecipient
                                };
                            }
                            return q;
                        })
                    );
                } catch (err: any) {
                    console.error(err);
                    setSnackbarMessage(`Fehler beim Laden vom Fragebogen: ${err.message}`);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                } finally {
                    setLoadingAnswers(false);
                }
            };

            fetchAnswers();
        }
    }, [viewMode, selectedGroup, projectId]);

    useEffect(() => {
        if (viewMode === ViewType.STUDENT_ANSWERS && projectId) {
            const fetchAverages = async () => {
                if (loadingAverages) return

                setLoadingAverages(true);
                try {
                    const res = await fetch(
                        `${API_CONFIG.BASE_URL}/api/project/${projectId}/gradeAverages`,
                        {credentials: "include"}
                    );
                    if (!res.ok) {
                        setSnackbarMessage(`Fehler beim Laden von Noten: ${res.status}`);
                        setSnackbarSeverity("error");
                        setSnackbarOpen(true);
                        return;
                    }

                    const data: ProjectGradeAveragesDTO = await res.json();
                    setGradeAverages(data.studentAverages);
                } catch (err: any) {
                    console.error(err);
                    setSnackbarMessage(`Fehler beim Laden von Noten: ${err.message}`);
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                } finally {
                    setLoadingAverages(false);
                }
            };

            fetchAverages();
        }
    }, [viewMode, projectId]);

    if (isLoading) return <>Loading User...</>
    if (loadingProject) return <>Loading Project...</>
    if (!isAuthenticated) return <>:( unauthenticated</>

    const saveQuestions = async (rows: FragebogenRow[], status: QuestionnaireActivityStatus) => {
        if (saving) return;

        setSaving(true);

        try {
            const payload: FragebogenPutRequest = {
                questions: rows.map((r): Question => ({
                    id: r.id,
                    text: r.question,
                    type: r.type
                })),
                status: status,
            }

            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/fragebogen`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                setSnackbarMessage(`Fehler beim Speichern vom Fragebogen: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return
            }

            setSnackbarMessage(`Erfolgreich Gespeichert`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err: any) {
            console.error(err)
            setSnackbarMessage(`Fehler beim Speichern vom Fragebogen: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {
            setSaving(false)
        }
    }

    const submitAnswers = async (rows: FragebogenRow[]) => {
        if (user?.role !== Role.STUDENT) return

        try {
            const payload: ProjectQuestionAnswersDTO = {
                questions: rows.map(r => ({
                    questionId: r.id,
                    answers: (r.answer || []).map(a => ({
                        studentId: a.studentId,
                        answer: a.answer ? a.answer : (r.type === QuestionType.GRADE ? 0 : "")
                    }))
                }))
            }

            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/fragebogenAnswers`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                setSnackbarMessage(`Fehler beim Speichern den Antworten: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }

            setSubmittedAnswers(true)

            setSnackbarMessage(`Erfolgreich Gespeichert`);
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err: any) {
            console.error(err)
            setSnackbarMessage(`Fehler beim Speichern den Antworten: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        } finally {

        }
    }

    const submitted = groupMembers.filter(m => m.hasSubmitted).length;
    const total = groupMembers.length;
    const percentage = (submitted / total) * 100;

    if (submittedAnswers) {
        return (
            <>
                <Typography>
                    Erfolgreich abgeschickt
                </Typography>

                <Button
                    variant="contained"
                    onClick={() => {
                        navigate("/fragebogen")
                    }}
                >
                    Zurück zu Fragebogen Auswahl
                </Button>
            </>
        )
    }

    return (
        <>
            {(user?.role === Role.ADMIN || user?.role === Role.TEACHER) ? (
                    <Box
                        px={2}
                        py={2}
                    >
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(_, newMode) => {
                                if (newMode !== null) setViewMode(newMode);
                            }}
                        >
                            <ToggleButton value={ViewType.EDIT}>Fragen bearbeiten</ToggleButton>
                            <ToggleButton value={ViewType.PREVIEW}>Vorschau als Schüler</ToggleButton>
                            <ToggleButton value={ViewType.STUDENT_ANSWERS}>Schüler Antworten</ToggleButton>
                        </ToggleButtonGroup>

                        <Box py={2}>
                            <Divider/>
                        </Box>

                        {(viewMode === ViewType.PREVIEW || viewMode === ViewType.STUDENT_ANSWERS) && (
                            <Box display="flex" gap={2} flexWrap="wrap">
                                <Autocomplete
                                    value={selectedGroup}
                                    options={projectGroups || []}
                                    getOptionLabel={(option) => option.groupName}
                                    onChange={(_, v) => {
                                        setSelectedGroup(v);
                                        setSelectedStudentFilter(null);
                                    }}
                                    renderInput={(params) =>
                                        <TextField {...params} label="Gruppe"/>}
                                    sx={{minWidth: 200, flexGrow: 1}}
                                />
                                {viewMode === ViewType.STUDENT_ANSWERS && selectedGroup && (
                                    <Autocomplete
                                        value={groupMembers.find(m => m.studentId === selectedStudentFilter) || null}
                                        options={groupMembers}
                                        getOptionLabel={(option) => {
                                            const statusIcon = option.hasSubmitted ? "👍" : "👎";
                                            return `${statusIcon} ${option.studentName}`;
                                        }}
                                        onChange={(_, v) => setSelectedStudentFilter(v?.studentId || null)}
                                        renderInput={(params) =>
                                            <TextField {...params} label="Nach Schüler filtern"/>}
                                        sx={{minWidth: 250, flexGrow: 1}}
                                        renderOption={(props, option) => (
                                            <li {...props}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <span>{option.studentName}</span>
                                                    <span style={{fontSize: '0.85em', color: '#666'}}>
                                                        {option.hasSubmitted ? "(Eingereicht)" : "(Nicht Eingereicht)"}
                                                    </span>
                                                </Box>
                                            </li>
                                        )}
                                    />
                                )}
                            </Box>
                        )}

                        {viewMode === ViewType.STUDENT_ANSWERS && selectedGroup && !loadingAnswers && (

                            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Einreich Status
                                </Typography>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography>{submitted}/{total}</Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={percentage}
                                        sx={{flexGrow: 1, borderRadius: 1, height: 8}}
                                    />
                                </Box>
                            </Box>
                        )}

                        {(selectedGroup && (viewMode === ViewType.PREVIEW || viewMode === ViewType.STUDENT_ANSWERS) || viewMode === ViewType.EDIT) && (
                            loadingAnswers ? (
                                <div>Loading answers...</div>
                            ) : (
                                <FragebogenTable
                                    rows={projectQuestions}
                                    onSubmit={saveQuestions}
                                    students={groupMembers}
                                    editView={viewMode === ViewType.EDIT}
                                    status={questionBowStatus || QuestionnaireActivityStatus.ARCHIVED}
                                    viewMode={viewMode}
                                    selectedStudentFilter={selectedStudentFilter}
                                    gradeAverages={gradeAverages}
                                />
                            )
                        )}
                    </Box>
                )
                :
                (
                    <>
                        <FragebogenTable
                            rows={projectQuestions}
                            students={groupMembers}
                            onSubmit={submitAnswers}
                            editView={false}
                            status={questionBowStatus || QuestionnaireActivityStatus.ARCHIVED}
                            viewMode={ViewType.PREVIEW}
                            selectedStudentFilter={null}
                        />
                    </>
                )
            }
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </>
    )
}