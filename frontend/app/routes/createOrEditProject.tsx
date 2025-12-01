import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router"
import API_CONFIG from "~/apiConfig";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Card, CardContent, IconButton, Select, TextField} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import AddSubjectToProject, {type Project} from "~/components/addSubjectToProject";

/**
 * @author Paul Geisthardt
 *
 * Editing/Creating projects and assigning groups/students
 *
 */

interface Student {
    studentId: string;
    username: string;
    firstName: string;
    lastName: string;
}

export interface ProjectDetailGroup {
    groupId: string;
    groupName: string;

    members: Student[];
}

export interface ProjectSubjectDTO {
    projectSubjectId: string,
    projectId: string,
    subjectId: string,
    duration: number,
}

export interface ProjectStartDate {
    year: number,
    month: number,
    day: number,
}

export interface ProjectDetailResponse {
    projectId: string;
    projectName: string;

    courseId: string;
    courseName: string;

    teacherId: string;
    teacherName: string;

    projectStartDate: ProjectStartDate;

    groups: ProjectDetailGroup[];
    subjects: ProjectSubjectDTO[];
}

interface CourseDto {
    id: string;
    courseName: string;
    classTeacherName: string;
}

interface GroupCardProps {
    group: ProjectDetailGroup;
    unassignedStudents: Student[];
    onDeleteGroup: (groupId: string) => void;
    onRemoveStudent: (groupId: string, studentId: string) => void;
    onAssignStudent: (groupId: string, student: Student) => void;
}

type ProjectPutRequest = {
    projectName: string,
    projectStartDate: ProjectStartDate,
    groups: ProjectDetailGroup[]
}

function GroupCard({
                       group,
                       unassignedStudents,
                       onDeleteGroup,
                       onRemoveStudent,
                       onAssignStudent
                   }: GroupCardProps) {
    const [selectedStudent, setSelectedStudent] = useState<string>("")

    const handleAssign = () => {
        if (!selectedStudent) return;

        const student = unassignedStudents.find(s => s.studentId === selectedStudent);

        if (student && selectedStudent) {
            onAssignStudent(group.groupId, student);
            setSelectedStudent("");
        }
    };

    return (
        <Card variant="outlined" sx={{mb: 2}}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{group.groupName}</Typography>
                    <IconButton color="error" onClick={() => onDeleteGroup(group.groupId)}>
                        <DeleteIcon/>
                    </IconButton>
                </Box>

                <Box mt={2}>
                    {group.members.map(member => (
                        <Box key={member.studentId} display="flex" justifyContent="space-between" alignItems="center"
                             mb={1}>
                            <Typography>{member.firstName} {member.lastName}</Typography>
                            <IconButton color="error" onClick={() => onRemoveStudent(group.groupId, member.studentId)}>
                                X
                            </IconButton>
                        </Box>
                    ))}
                </Box>

                <Box display="flex" mt={2}>
                    <Select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        displayEmpty
                        sx={{mr: 1, flexGrow: 1}}
                    >
                        <MenuItem value="" disabled>Schüler auswählen</MenuItem>
                        {unassignedStudents.map(s => (
                            <MenuItem key={s.studentId} value={s.studentId}>
                                {s.firstName} {s.lastName}
                            </MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleAssign();
                        }}
                        disabled={!selectedStudent}
                    >
                        Hinzufügen
                    </Button>
                </Box>
            </CardContent>
        </Card>
    )
}

export default function createOrEditProject() {
    let {projectId} = useParams<{ projectId: string }>();

    const [project, setProject] = useState<ProjectDetailResponse | null>(null)
    const [originalProject, setOriginalProject] = useState<ProjectDetailResponse | null>(null)
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [draftGroups, setDraftGroups] = useState<ProjectDetailGroup[]>([]);
    const [draftUnassignedStudents, setDraftUnassignedStudents] = useState<Student[]>([]);
    const [draftSubjects, setDraftSubjects] = useState<ProjectSubjectDTO[]>([]);
    const [groupAmount, setGroupAmount] = useState(5);
    const [creatingGroups, setCreatingGroups] = useState(false);

    const isEdit = !(projectId === "new");
    const navigate = useNavigate();
    const now = new Date();

    const [projectCreateDetails, setProjectCreateDetails] = useState({
        projectName: "",
        courseId: "",
        projectStartDate: {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        } as ProjectStartDate
    })

    const fetchProject = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}`, {
                method: "GET", credentials: "include"
            });
            const data: ProjectDetailResponse = await res.json();
            setProject(data);
            setOriginalProject(JSON.parse(JSON.stringify(data)));

            const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/course/${data.courseId}/students`, {
                credentials: "include"
            });
            const students: Student[] = await studentRes.json();

            const assignedIds = new Set(
                data.groups.flatMap(g => g.members.map(m => m.studentId))
            )

            const unassigned = students.filter(s => !assignedIds.has(s.studentId))

            setUnassignedStudents(unassigned)
        } catch (err: any) {
            console.error(err);
            setError(`Failed to Fetch Project: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/all/bare`, {
                credentials: "include"
            });
            const coursesDto: CourseDto[] = await res.json();

            setCourses(coursesDto)
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        if (isEdit) {
            fetchProject();
        } else {
            setLoading(false);
            setDraftGroups([])
            setDraftUnassignedStudents([])
        }
    }, [])

    if (loading) return <>Loading ...</>

    const handleProjectNameChange = (value: string) => {
        if (isEdit) {
            setProject(prevState =>
                prevState
                    ? {...prevState, projectName: value}
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? {...prevState, projectName: value}
                    : prevState
            )
        }
    }

    const handleProjectClassChange = async (value: string) => {
        if (isEdit) {
            setProject(prevState =>
                prevState
                    ? {...prevState, courseId: value}
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? {...prevState, courseId: value}
                    : prevState
            )

            try {
                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/course/${value}/students`, {
                    credentials: "include"
                });
                const students: Student[] = await studentRes.json();
                setDraftUnassignedStudents(students)
            } catch (err: any) {
                alert(`failed to load students for class ${err.message}`)
                setDraftUnassignedStudents([])
            }
        }
    }

    const handleProjectStartDateChange = (value: string) => {
        if (!value) return;

        const [year, month, day] = value.split("-").map(Number);

        const dateObj: ProjectStartDate = {year, month, day};

        if (isEdit) {
            setProject(prevState =>
                prevState
                    ? {...prevState, projectStartDate: dateObj}
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? {...prevState, projectStartDate: dateObj}
                    : prevState
            )
        }
    }

    const formatDate = (d?: ProjectStartDate) => {
        if (!d || !d.year || !d.month || !d.day) return "";

        const mm = d.month.toString().padStart(2, "0")
        const dd = d.day.toString().padStart(2, "0")
        return `${d.year}-${mm}-${dd}`;
    }

    const addDraftGroup = (name?: string) => {
        const id = typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now())
        setDraftGroups(prev => ([...prev, {groupId: id, groupName: name ?? `Gruppe ${prev.length + 1}`, members: []}]));
    }


    const deleteDraftGroup = (groupId: string) => {
        const removed = draftGroups.find(g => g.groupId === groupId);
        setDraftGroups(prev => prev.filter(g => g.groupId !== groupId));
        if (removed) {
            setDraftUnassignedStudents(prev => [...prev, ...removed.members]);
        }
    }


    const assignStudentToDraft = (groupId: string, student: Student) => {
        setDraftGroups(prev => prev.map(g => g.groupId === groupId ? {...g, members: [...g.members, student]} : g));
        setDraftUnassignedStudents(prev => prev.filter(s => s.studentId !== student.studentId));
    }


    const removeStudentFromDraft = (groupId: string, studentId: string) => {
        let removedStudent: Student | undefined;
        setDraftGroups(prev => prev.map(g => {
            if (g.groupId !== groupId) return g;
            const newMembers = g.members.filter(m => {
                if (m.studentId === studentId) {
                    removedStudent = m;
                    return false;
                }
                return true;
            })
            return {...g, members: newMembers}
        }))


        if (removedStudent) {
            setDraftUnassignedStudents(prev => [...prev, removedStudent!])
        }
    }

    const handleAddSubject = (subjectId: string, duration: number) => {
        const newSubject: ProjectSubjectDTO = {
            projectSubjectId: typeof crypto !== 'undefined' && (crypto as any).randomUUID
                ? (crypto as any).randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(16).slice(2),
            projectId: project?.projectId ?? "new",
            subjectId: subjectId,
            duration: duration
        };

        if (isEdit && project) {
            setProject(prev => prev ? {...prev, subjects: [...prev.subjects, newSubject]} : prev);
        } else {
            setDraftSubjects(prev => [...prev, newSubject]);
        }
    }

    const handleRemoveSubject = (projectSubjectId: string) => {
        if (isEdit && project) {
            setProject(prev => prev ? {
                ...prev,
                subjects: prev.subjects.filter(s => s.projectSubjectId !== projectSubjectId)
            } : prev);
        } else {
            setDraftSubjects(prev => prev.filter(s => s.projectSubjectId !== projectSubjectId));
        }
    }


    const handleDeleteGroup = (groupId: string) => {
        if (!groupId.trim() || !isEdit) return;

        const removedGroup = project?.groups.find(g => g.groupId === groupId);
        const freedStudents = removedGroup ? removedGroup.members : [];

        setProject(prevState =>
            prevState
                ? {...prevState, groups: prevState.groups.filter(g => g.groupId !== groupId)}
                : prevState
        )

        setUnassignedStudents(prevState => [...prevState, ...freedStudents])
    }

    const handleAssignStudent = (groupId: string, student: Student) => {
        if (!groupId.trim() || !student || !isEdit) return;

        setProject(prevState =>
            prevState
                ? {
                    ...prevState,
                    groups: prevState.groups.map(g =>
                        g.groupId === groupId
                            ? {...g, members: [...g.members, student]}
                            : g
                    )
                }
                : prevState
        );

        setUnassignedStudents(prevState =>
            prevState.filter(s => s.studentId !== student.studentId)
        )
    }

    const handleRemoveStudent = (groupId: string, studentId: string) => {
        if (!groupId.trim() || !studentId.trim() || !isEdit) return;

        const student = project?.groups
            .find(g => g.groupId === groupId)
            ?.members.find(s => s.studentId === studentId);

        setProject(prevState =>
            prevState
                ? {
                    ...prevState,
                    groups: prevState.groups.map(g =>
                        g.groupId === groupId
                            ? {...g, members: g.members.filter(m => m.studentId !== studentId)}
                            : g
                    )
                }
                : prevState
        )

        if (student) {
            setUnassignedStudents(prev => [...prev, student]);
        }
    }

    const handleAddGroup = () => {
        if (!project || !isEdit) return;

        const newGroup: ProjectDetailGroup = {
            groupId: typeof crypto !== 'undefined' && (crypto as any).randomUUID
                ? (crypto as any).randomUUID()
                : String(Date.now()) + '-' + Math.random().toString(16).slice(2),
            groupName: `Gruppe ${project.groups.length + 1}`,
            members: []
        };

        setProject(prevState =>
            prevState
                ? {...prevState, groups: [...prevState.groups, newGroup]}
                : prevState
        )
    }

    const leftGroups = isEdit ? (project?.groups ?? []) : draftGroups;
    const rightUnassigned = isEdit ? unassignedStudents : draftUnassignedStudents;


    const handleCreateProject = async () => {
        if (!projectCreateDetails.projectName.trim() || !projectCreateDetails.courseId.trim()) {
            return
        }

        const payload = {
            projectName: projectCreateDetails.projectName,
            courseId: projectCreateDetails.courseId,
            projectStartDate: projectCreateDetails.projectStartDate,
            groups: draftGroups.map(g => ({
                groupName: g.groupName,
                memberIds: g.members.map(m => m.studentId)
            }))
        }

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/create/full`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                alert("Fehler bei der Erstellung")
                return
            }

            const created = await res.json();
            const createdProjectId = created.projectId;

            for (const subject of draftSubjects) {
                try {
                    await fetch(`${API_CONFIG.BASE_URL}/api/project/${createdProjectId}/add/subject`, {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        credentials: "include",
                        body: JSON.stringify({
                            subjectId: subject.subjectId,
                            duration: subject.duration
                        })
                    });
                } catch (err: any) {
                    console.error(`Failed to add subject: ${err.message}`);
                    setSaveError(`Failed to add subject: ${err.message}`)
                }
            }

            navigate(`/projekte`)
        } catch (err: any) {
            alert(`Fehler: ${err.message}`)
        }
    }

    const handleSaveChanges = async () => {
        if (!isEdit || !project) return;
        setSaving(true);
        setSaveError(null);

        try {
            const payload: ProjectPutRequest = {
                projectName: project.projectName,
                projectStartDate: project.projectStartDate,
                groups: project.groups
            }

            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/full`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                setSaveError(`Fehler beim Speichern: ${res.status}`)
                return
            }

            const originalSubjectIds = new Set(originalProject?.subjects.map(s => s.projectSubjectId) ?? []);
            const currentSubjectIds = new Set(project.subjects.map(s => s.projectSubjectId));

            for (const originalSubject of (originalProject?.subjects ?? [])) {
                if (!currentSubjectIds.has(originalSubject.projectSubjectId)) {
                    try {
                        await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/remove/subject/${originalSubject.subjectId}`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            credentials: "include",
                        });
                    } catch (err: any) {
                        console.error(`Failed to remove subject: ${err.message}`);
                    }
                }
            }

            for (const currentSubject of project.subjects) {
                if (!originalSubjectIds.has(currentSubject.projectSubjectId)) {
                    try {
                        await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}/add/subject`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            credentials: "include",
                            body: JSON.stringify({
                                subjectId: currentSubject.subjectId,
                                duration: currentSubject.duration
                            })
                        });
                    } catch (err: any) {
                        console.error(`Failed to add subject: ${err.message}`);
                        setSaveError(`Failed to add subject: ${err.message}`)
                    }
                }
            }

            setOriginalProject(JSON.parse(JSON.stringify(project)));
        } catch (err: any) {
            setSaveError(`Fehler beim Speichern: ${err.message}`)
        } finally {
            setSaving(false);
        }
    }

    const resetChanges = () => {
        setProject(originalProject ? JSON.parse(JSON.stringify(originalProject)) : null)
    }

    const handleCreateRandomGroups = async () => {
        if (!groupAmount || groupAmount < 1) return;

        setCreatingGroups(true);

        try {
            if (isEdit) {
                if (!project?.courseId) return;

                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/course/${project.courseId}/students`, {
                    credentials: "include"
                });
                const students: Student[] = await studentRes.json();

                const shuffled = [...students].sort(() => Math.random() - 0.5);

                const newGroups: ProjectDetailGroup[] = Array.from({length: groupAmount}, (_, i) => ({
                    groupId: typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now()) + '-' + i + '-' + Math.random() + i,
                    groupName: `Gruppe ${i + 1}`,
                    members: []
                }));

                let groupIndex = 0;
                shuffled.forEach(student => {
                    newGroups[groupIndex].members.push(student);
                    groupIndex = (groupIndex + 1) % groupAmount;
                });

                setProject(prevState => prevState ? {...prevState, groups: newGroups} : prevState);

                const assignedIds = new Set(newGroups.flatMap(g => g.members.map(m => m.studentId)));
                setUnassignedStudents(students.filter(s => !assignedIds.has(s.studentId)));

            } else {
                if (!projectCreateDetails.courseId) return;

                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/course/${projectCreateDetails.courseId}/students`, {
                    credentials: "include"
                });
                const students: Student[] = await studentRes.json();

                const shuffled = [...students].sort(() => Math.random() - 0.5);

                const newGroups: ProjectDetailGroup[] = Array.from({length: groupAmount}, (_, i) => ({
                    groupId: String(Date.now()) + i,
                    groupName: `Gruppe ${i + 1}`,
                    members: []
                }));

                let groupIndex = 0;
                shuffled.forEach(student => {
                    newGroups[groupIndex].members.push(student);
                    groupIndex = (groupIndex + 1) % groupAmount;
                });

                setDraftGroups(newGroups);

                const assignedIds = new Set(newGroups.flatMap(g => g.members.map(m => m.studentId)));
                setDraftUnassignedStudents(students.filter(s => !assignedIds.has(s.studentId)));
            }
        } catch (err: any) {
            alert(`Error creating random groups: ${err.message}`);
        } finally {
            setCreatingGroups(false);
        }
    };

    return (
        <Box
            px={4}
            py={2}
        >
            <Typography variant="h5" mb={3}>
                {isEdit ? "Projekt bearbeiten" : "Projekt erstellen"}
            </Typography>

            <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                mb={3}
            >
                <TextField
                    label="Projekt Name"
                    value={isEdit ? project?.projectName : projectCreateDetails.projectName}
                    onChange={e => handleProjectNameChange(e.target.value)}
                    sx={{flex: "1 1 250px"}}
                />

                <TextField
                    select
                    label="Klasse"
                    name="courseId"
                    value={isEdit ? project?.courseId : projectCreateDetails.courseId}
                    onChange={e => handleProjectClassChange(e.target.value)}
                    disabled={isEdit}
                    sx={{flex: "1 1 200px"}}
                >
                    <MenuItem value="">-- Bitte wählen --</MenuItem>
                    {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.courseName} | {c.classTeacherName}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    label="Projekt Start"
                    name="projectStart"
                    type="date"
                    slotProps={{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    value={isEdit ? formatDate(project?.projectStartDate) : formatDate(projectCreateDetails.projectStartDate)}
                    onChange={e => handleProjectStartDateChange(e.target.value)}
                    sx={{flex: "1 1 180px"}}
                />
            </Box>

            <AddSubjectToProject
                projectSubjects={isEdit ? (project?.subjects ?? []) : draftSubjects}
                onAddSubject={handleAddSubject}
                onRemoveSubject={handleRemoveSubject}
            />

            {isEdit ? (
                <Box mt={4} display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                    {saveError && (
                        <Box
                            mb={2}
                            p={2}
                            sx={{
                                backgroundColor: '#ffebee',
                                borderRadius: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1
                            }}
                        >
                            <Typography color="error" gutterBottom>
                                {saveError}
                            </Typography>
                        </Box>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={resetChanges}
                        disabled={saving}
                    >
                        Zurücksetzen
                    </Button>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveChanges}
                        disabled={saving}
                    >
                        {saving ? 'Speichern...' : 'Speichern'}
                    </Button>
                </Box>
            ) : (
                <Box
                    mt={4}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateProject}
                        disabled={!projectCreateDetails.projectName.trim() || !projectCreateDetails.courseId.trim()}
                    >
                        Projekt erstellen
                    </Button>
                </Box>
            )}

            <Box my={2}>
                <Divider/>
            </Box>

            <Box
                display="flex"
                gap={2}
                flexWrap="wrap"
            >
                <Box
                    flex={2}
                    minWidth={300}
                    maxHeight="80vh"
                    overflow="auto"
                >
                    <Typography variant="h6" py={2}>
                        Gruppen
                    </Typography>

                    <Box
                        display="flex"
                        alignItems="center"
                        gap={2}
                        mb={2}
                        width="100%"
                    >
                        <Button
                            variant="contained"
                            onClick={isEdit ? handleAddGroup : () => addDraftGroup()}
                            sx={{flexShrink: 0}}
                        >
                            + Gruppe Hinzufügen
                        </Button>

                        <Box flexGrow={1}/>

                        <TextField
                            label="Anzahl Gruppen"
                            type="number"
                            value={groupAmount}
                            onChange={e => setGroupAmount(Number(e.target.value))}
                            size="small"
                            sx={{flex: "0 0 80px"}}
                            slotProps={{
                                input: {
                                    inputProps: {min: 1},
                                    style: {textAlign: "center"},
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleCreateRandomGroups}
                            disabled={creatingGroups || (!isEdit && (!projectCreateDetails.courseId || groupAmount < 1))}
                            sx={{flexShrink: 0}}
                        >
                            {creatingGroups ? "Lädt..." : "Zufällige Gruppen erstellen"}
                        </Button>
                    </Box>

                    {leftGroups?.map(group => (
                        <GroupCard
                            key={group.groupId}
                            group={group}
                            unassignedStudents={rightUnassigned}
                            onDeleteGroup={isEdit ? handleDeleteGroup : deleteDraftGroup}
                            onAssignStudent={isEdit ? handleAssignStudent : assignStudentToDraft}
                            onRemoveStudent={isEdit ? handleRemoveStudent : removeStudentFromDraft}
                        />
                    ))
                    }
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box
                    flex={1}
                    minWidth={150}
                    maxHeight="80vh"
                    overflow="auto"
                >
                    <Typography variant="h6" py={2}>
                        Unzugeordnete Schüler
                    </Typography>

                    <Box mt={1}>
                        {rightUnassigned.length === 0 && (
                            <Typography color="text.secondary">
                                Alle Schüler zugeordnet
                            </Typography>
                        )}

                        {rightUnassigned.map(s => (
                            <Box
                                key={s.studentId}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={1}
                            >
                                <Typography>{s.firstName} {s.lastName}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
