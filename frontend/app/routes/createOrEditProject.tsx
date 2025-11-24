import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router"
import API_CONFIG from "~/apiConfig";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Card, CardContent, IconButton, Select, TextField} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";

interface Student {
    studentId: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface ProjectDetailGroup {
    groupId: string;
    groupName: string;

    members: Student[];
}

interface ProjectStartDate {
    year: number,
    month: number,
    day: number,
}

interface ProjectDetailResponse {
    projectId: string;
    projectName: string;

    courseId: string;
    courseName: string;

    teacherId: string;
    teacherName: string;

    projectStartDate: ProjectStartDate;

    groups: ProjectDetailGroup[];
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
        <Card variant="outlined" sx={{ mb: 2}}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{group.groupName}</Typography>
                    <IconButton color="error" onClick={() => onDeleteGroup(group.groupId)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>

                <Box mt={2}>
                    {group.members.map(member => (
                        <Box key={member.studentId} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
                        sx={{ mr: 1, flexGrow: 1 }}
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
    let { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<ProjectDetailResponse | null>(null)
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string |null>(null)
    const [courses, setCourses] = useState<CourseDto[]>([]);
    const [draftGroups, setDraftGroups] = useState<ProjectDetailGroup[]>([]);
    const [draftUnassignedStudents, setDraftUnassignedStudents] = useState<Student[]>([]);
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
            console.log(`Fetcing ${projectId}`)
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}`, {method: "GET",});
            const data: ProjectDetailResponse = await res.json();
            console.log(data)
            setProject(data);

            const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${data.courseId}/students`);
            const students: Student[] = await studentRes.json();

            const assignedIds = new Set(
                data.groups.flatMap(g => g.members.map(m => m.studentId))
            )

            const unassigned = students.filter(s => !assignedIds.has(s.studentId))

            console.log(unassigned)
            setUnassignedStudents(unassigned)
        } catch (err: any) {
            console.log(err);
            setError(`Failed to Fetch Project: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/all/bare`);
            const coursesDto: CourseDto[] = await res.json();

            setCourses(coursesDto)
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            // setError({
            //     message: "failed to fetch courses",
            // });
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
                    ? { ...prevState, projectName: value }
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? { ...prevState, projectName:  value }
                    : prevState
            )
        }
    }

    const handleProjectClassChange = async (value: string) => {
        if (isEdit) {
            setProject(prevState =>
                prevState
                    ? { ...prevState, courseId: value }
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? { ...prevState, courseId:  value }
                    : prevState
            )

            try{
                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${value}/students`);
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

        const dateObj: ProjectStartDate = { year, month, day };

        if (isEdit) {
            setProject(prevState =>
                prevState
                    ? { ...prevState, projectStartDate: dateObj }
                    : prevState
            )
        } else {
            setProjectCreateDetails(prevState =>
                prevState
                    ? { ...prevState, projectStartDate:  dateObj }
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
        setDraftGroups(prev => ([...prev, { groupId: id, groupName: name ?? `Gruppe ${prev.length + 1}`, members: [] }]));
    }


    const deleteDraftGroup = (groupId: string) => {
        const removed = draftGroups.find(g => g.groupId === groupId);
        setDraftGroups(prev => prev.filter(g => g.groupId !== groupId));
        if (removed) {
            setDraftUnassignedStudents(prev => [...prev, ...removed.members]);
        }
    }


    const assignStudentToDraft = (groupId: string, student: Student) => {
        setDraftGroups(prev => prev.map(g => g.groupId === groupId ? { ...g, members: [...g.members, student] } : g));
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
            return { ...g, members: newMembers }
        }))


        if (removedStudent) {
            setDraftUnassignedStudents(prev => [...prev, removedStudent!])
        }
    }


    const handleDeleteGroup = async (groupId: string) => {
        if (!groupId.trim() || !isEdit) return;

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/group/${groupId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                alert("Failed to delete group");
                return;
            }

            const removedGroup = project?.groups.find(g => g.groupId === groupId);
            const freedStudents = removedGroup ? removedGroup.members : [];

            setProject(prevState =>
                prevState
                    ? { ...prevState, groups: prevState.groups.filter(g => g.groupId !== groupId) }
                    : prevState
            )

            setUnassignedStudents(prevState => [...prevState, ...freedStudents])
        } catch (err: any) {
            alert(`Failed to delete group: ${err.message}`)
        }
    }

    const handleAssignStudent = async (groupId: string, student: Student) => {
        if (!groupId.trim() || !student || !isEdit) return;


        const payload = {
            groupId: groupId,
            studentId: student.studentId
        }

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/group/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                alert("failed to add student to group")
                return;
            }
            const updated: ProjectDetailGroup = await res.json();

            console.log(updated)
            setProject(prevState =>
                prevState
                    ? { ...prevState,
                        groups: prevState.groups.map(g =>
                            g.groupId === updated.groupId ? updated : g
                        )
                    }
                    : prevState
            );

            setUnassignedStudents(prevState =>
                prevState.filter(s => s.studentId != student.studentId)
            )
        } catch (err: any) {
            alert(`Failed to add student to group: ${err.message}`)
        }
    }

    const handleRemoveStudent = async (groupId: string, studentId: string) => {
        if (!groupId.trim() || !studentId.trim() || !isEdit) return;

        const payload = {
            groupId,
            studentId
        };

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/group/remove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                alert("Fehler beim entfernen")
                return
            }

            const updatedGroup: ProjectDetailGroup = await res.json();

            setProject(prevState =>
                prevState
                    ? {
                        ...prevState,
                        groups: prevState.groups.map(g =>
                            g.groupId === updatedGroup.groupId ? updatedGroup : g
                        )
                    }
                    : prevState
            )

            const removed = updatedGroup.members.length <
                project?.groups.find(g => g.groupId === groupId)?.members.length!;

            if (removed) {
                const student = project?.groups
                    .find(g => g.groupId === groupId)
                    ?.members.find(s => s.studentId === studentId);

                if (student) {
                    setUnassignedStudents(prev => [...prev, student]);
                }
            }
        } catch(err: any) {
            alert(`Error: ${err.message}`)
        }
    }

    const handleAddGroup = async () => {
        if (!project || !isEdit) return;

        const payload = {
            groupName: `Gruppe ${project.groups.length + 1}`,
            projectId: project.projectId
        }

        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/group/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                alert("failed to create group")
                return;
            }

            const created: ProjectDetailGroup = await res.json();

            setProject(prevState =>
                prevState
                    ? { ...prevState, groups: [...prevState.groups, created ] }
                    : prevState
            )

        } catch (err: any) {
            console.error(err);
            alert(`failed to create group: ${err.message}`)
        }
    }

    const leftGroups = isEdit ? (project?.groups ?? []) : draftGroups;
    const rightUnassigned = isEdit ? unassignedStudents : draftUnassignedStudents;


    const handleCreateProject = async () => {
        if (!projectCreateDetails.projectName.trim()  || !projectCreateDetails.courseId.trim()) {
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                alert("Fehler bei der Erstellung")
                return
            }

            const created = await res.json();
            projectId = created.projectId
            fetchProject()
            navigate(`/projekte`)
        } catch (err: any) {
            alert(`Fehler: ${err.message}`)
        }
    }

    const handleCreateRandomGroups = async () => {
        if (!groupAmount || groupAmount < 1) return;

        setCreatingGroups(true);

        try {
            if (isEdit) {
                if (!project?.projectId || !project?.courseId) return;

                const res = await fetch(`${API_CONFIG.BASE_URL}/api/group/create/fromClass`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        courseId: project.courseId,
                        projectId: project.projectId,
                        groupAmount
                    })
                });

                if (!res.ok) {
                    alert("Failed to create random groups");
                    return;
                }

                const groups: ProjectDetailGroup[] = await res.json();
                setProject(prevState => prevState ? { ...prevState, groups } : prevState);

                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${project.courseId}/students`);
                const students: Student[] = await studentRes.json();
                const assignedIds = new Set(groups.flatMap(g => g.members.map(m => m.studentId)));
                const unassigned = students.filter(s => !assignedIds.has(s.studentId));
                setUnassignedStudents(unassigned);

            } else {
                if (!projectCreateDetails.courseId) return;

                const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${projectCreateDetails.courseId}/students`);
                const students: Student[] = await studentRes.json();

                const shuffled = [...students].sort(() => Math.random() - 0.5);

                const newGroups: ProjectDetailGroup[] = Array.from({ length: groupAmount }, (_, i) => ({
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
                    sx={{ flex: "1 1 250px" }}
                />

                <TextField
                    select
                    label="Klasse"
                    name="courseId"
                    value={isEdit ? project?.courseId : projectCreateDetails.courseId}
                    onChange={e => handleProjectClassChange(e.target.value)}
                    sx={{ flex: "1 1 200px" }}
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
                    slotProps = {{
                        inputLabel: {
                            shrink: true
                        }
                    }}
                    value={isEdit ? formatDate(project?.projectStartDate) : formatDate(projectCreateDetails.projectStartDate)}
                    onChange={e => handleProjectStartDateChange(e.target.value)}
                    sx={{ flex: "1 1 180px" }}
                />
            </Box>

            {!isEdit && (
                <Box
                    mt={4}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateProject}
                        disabled={!projectCreateDetails.projectName.trim()  || !projectCreateDetails.courseId.trim()}
                    >
                        Projekt erstellen
                    </Button>
                </Box>
            )}

            <Box my={2}>
                <Divider />
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
                        Groups
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
                            sx={{ flexShrink: 0 }}
                        >
                            + Gruppe Hinzufügen
                        </Button>

                        <Box flexGrow={1} />

                        <TextField
                            label="Anzahl Gruppen"
                            type="number"
                            value={groupAmount}
                            onChange={e => setGroupAmount(Number(e.target.value))}
                            size="small"
                            sx={{ flex: "0 0 80px" }}
                            slotProps={{
                                input: {
                                    inputProps: { min: 1 },
                                    style: { textAlign: "center" },
                                },
                            }}
                        />

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleCreateRandomGroups}
                            disabled={creatingGroups || (!isEdit && (!projectCreateDetails.courseId || groupAmount < 1))}
                            sx={{ flexShrink: 0 }}
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