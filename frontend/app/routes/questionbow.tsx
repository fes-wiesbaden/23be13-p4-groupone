import {useAuth} from "~/contexts/AuthContext";
import {Role} from "~/types/models";
import {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import FragebogenTable, {type FragebogenRow, QuestionType} from "~/components/fragebogen";
import Box from "@mui/material/Box";
import {useParams} from "react-router-dom";
import {Autocomplete, TextField} from "@mui/material";
import API_CONFIG from "~/apiConfig";
import type {ProjectDetailGroup} from "~/routes/createOrEditProject";
import Divider from "@mui/material/Divider";

export type QuestionnaireActivityStatus = "EDITING" | "READY_FOR_ANSWERING" | "ARCHIVED";

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

    const groupMembers = (() => {
        if (!selectedGroup) return [];

        const fullNames = selectedGroup.members.map(s => `${s.firstName} ${s.lastName}`);

        const counts: Record<string, number> = {};
        for (const name of fullNames) {
            counts[name] = (counts[name] ?? 0) + 1;
        }

        return selectedGroup.members.map(member => {
            if (user && member.username === user.username) {
                return "Selbsteinschätzung";
            }

            const fullName = `${member.firstName} ${member.lastName}`;
            if (counts[fullName] > 1) {
                return `${fullName} (${member.username})`;
            }
            return fullName;
        });
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

    const saveQuestions = async (rows: FragebogenRow[]) => {
        setSaving(true);

        try {
            const payload: FragebogenPutRequest = {
                questions: rows.map((r): Question => ({
                    id: r.id,
                    text: r.question,
                    type: r.type
                }))
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
        console.log("SUBMITTIII")
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
                                studentNames={groupMembers}
                                editView={!previewAsStudent}
                            />
                        )}
                    </Box>
                )
                :
                (
                    <>
                        <FragebogenTable
                            rows={projectQuestions}
                            studentNames={groupMembers}
                            onSubmit={submitAnswers}
                            editView={false}
                        />
                    </>
                )
            }
        </>
    )
}