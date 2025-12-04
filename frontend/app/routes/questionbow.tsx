import {useAuth} from "~/contexts/AuthContext";
import {Role} from "~/types/models";
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import FragebogenTable, {
    type FragebogenRow,
    type FragebogenStudent,
    QuestionnaireActivityStatus,
    QuestionType
} from "~/components/fragebogen";
import Box from "@mui/material/Box";
import {useParams} from "react-router-dom";
import {Autocomplete, TextField} from "@mui/material";
import API_CONFIG from "~/apiConfig";
import type {ProjectDetailGroup} from "~/routes/createOrEditProject";
import Divider from "@mui/material/Divider";


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

export default function Questionbow() {
    let {projectId} = useParams<{ projectId: string }>();
    const {user, isAuthenticated, isLoading} = useAuth();

    const [previewAsStudent, setPreviewAsStudent] = useState(false);
    const [projectGroups, setProjectGroups] = useState<ProjectDetailGroup[] | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<ProjectDetailGroup | null>(null);
    const [projectQuestions, setProjectQuestions] = useState<FragebogenRow[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false)
    const [questionBowStatus, setQuestionBowStatus] = useState<QuestionnaireActivityStatus | null>(null)

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
                studentId: member.studentId
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
                if (!res.ok) return;

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
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProject(false)
            }
        };

        fetchProjectData();
    }, [projectId, user]);

    const togglePreview = () => setPreviewAsStudent(prev => !prev);

    if (isLoading) return <>Loading User...</>
    if (loadingProject) return <>Loading Project...</>
    if (!isAuthenticated) return <>:( unauthenticated</>

    const saveQuestions = async (rows: FragebogenRow[], status: QuestionnaireActivityStatus) => {
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
                return
            }
        } catch (err: any) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const submitAnswers = async (rows: FragebogenRow[]) => {
        if (user?.role != Role.STUDENT) return

        console.log("SUBMITTIII")
        console.log(rows)

        try {
            const payload: ProjectQuestionAnswersDTO = {
                questions: rows.map(r => ({
                    questionId:  r.id,
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
                return;
            }
        } catch (err: any) {
            console.error(err)
        } finally {

        }
    }

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

                        <Box py={2}>
                            <Divider/>
                        </Box>

                        {previewAsStudent && (
                            <Autocomplete
                                value={selectedGroup}
                                options={projectGroups || []}
                                getOptionLabel={(option) => option.groupName}
                                onChange={(_, v) => setSelectedGroup(v)}
                                renderInput={(params) =>
                                    <TextField {...params} label="Gruppe"/>}
                                sx={{minWidth: 200}}
                            />
                        )}
                        {(selectedGroup && previewAsStudent || !previewAsStudent) && (
                            <FragebogenTable
                                rows={projectQuestions}
                                onSubmit={saveQuestions}
                                students={groupMembers}
                                editView={!previewAsStudent}
                                status={questionBowStatus || QuestionnaireActivityStatus.ARCHIVED}
                                isPreview={true}
                            />
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
                            isPreview={false}
                        />
                    </>
                )
            }
        </>
    )
}