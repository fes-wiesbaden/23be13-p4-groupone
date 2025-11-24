import { useParams } from 'react-router-dom';
import API_CONFIG from "~/apiConfig";
import {useEffect, useState} from "react";
import {Card, CardContent, Grid, Select, TextField} from '@mui/material';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuItem from "@mui/material/MenuItem";

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

interface ProjectDetailResponse {
    projectId: string;
    projectName: string;

    classId: string;
    className: string;

    teacherId: string;
    teacherName: string;

    groups: ProjectDetailGroup[];
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
    onAssignStudent}: GroupCardProps) {
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


export default function ProjectDetail() {
    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<ProjectDetailResponse | null>(null)
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string |null>(null)
    const [addingGroup, setAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("")

    const fetchProject = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/project/${projectId}`, {method: "GET",});
            const data: ProjectDetailResponse = await res.json();
            console.log(data)
            setProject(data);

            const studentRes = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${data.classId}/students`);
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

    useEffect(() => {
        fetchProject();
    }, []);


    if (loading) return <p>Loading project...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!project) return <p>No project found</p>;

    const handleDeleteGroup = (groupId: string) => {

    }

    const handleAssignStudent = async (groupId: string, student: Student) => {
        if (!groupId.trim() || !student) return;

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

    const handleRemoveStudent = (groupId: string, studentId: string) => {

    }

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !project) return;

        const payload = {
            groupName: newGroupName,
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
        } finally {
            setNewGroupName("");
            setAddingGroup(false);
        }
    }

    return (
        <>
            <Box>
                <Typography variant="h4" gutterBottom>{project.projectName}</Typography>
                <Typography variant="subtitle1" gutterBottom>{project.className} | {project.teacherName}</Typography>

                <Grid container>
                    {project.groups.map(group => (
                        <Grid key={group.groupId}>
                            <GroupCard
                                group={group}
                                unassignedStudents={unassignedStudents}
                                onDeleteGroup={handleDeleteGroup}
                                onAssignStudent={handleAssignStudent}
                                onRemoveStudent={handleRemoveStudent}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Grid>
                    {!addingGroup ? (
                        <Card
                            onClick={() => setAddingGroup(true)}
                        >
                            Add Group
                        </Card>
                    ) : (
                        <Card>
                            <TextField
                                fullWidth
                                label="Gruppen Name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                            />
                            <Box>
                                <Button
                                    onClick={handleCreateGroup}
                                    disabled={!newGroupName.trim()}
                                >
                                    Speichern
                                </Button>
                                <Button
                                    onClick={() => {setAddingGroup(false); setNewGroupName(""); }}
                                >
                                    Abbrechen
                                </Button>
                            </Box>
                        </Card>
                    )}
                </Grid>
            </Box>
        </>
    )
}