import {useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import Typography from "@mui/material/Typography";
import {AccordionDetails, AccordionSummary, Box, Button, MenuItem, TextField} from "@mui/material";
import API_CONFIG from "~/apiConfig";
import Divider from "@mui/material/Divider";
import Accordion from '@mui/material/Accordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomizedSnackbars from "~/components/snackbar"

/**
 * @author Paul Geisthardt
 *
 * Editing/Creating courses and assigning students
 *
 * @Edited by Noah Bach
 *    Form Validation
 */

type Role = "STUDENT" | "TEACHER" | "ADMIN";

interface Student {
    studentId: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface Teacher {
    teacherId: string;
    username: string;
    firstName: string;
    lastName: string;
}

interface CourseDetailResponse {
    courseId: string,
    courseName: string,
    classTeacher?: Teacher,
    teachers: Teacher[],
    students: Student[]
}

type RetryError = {
    message: string,
    retryMethod: () => Promise<void> | void;
}

type CourseCreateDetails = {
    courseName: string,
    classTeacherId?: string,
    teacherIds: string[],
    studentIds: string[]
}

type CoursePutRequest = {
    courseName: string,
    classTeacherId?: string,
    teacherIds: string[],
    studentIds: string[],
}


interface UserCardProps {
    user: Student | Teacher;
    onRemove?: () => void;
    onAdd?: () => void;
    isRemoving?: boolean;
    isAdding?: boolean;
    mode: 'assigned' | 'available';
    disabled?: boolean;
}

function UserCard({
    user,
    onRemove,
    onAdd,
    isRemoving = false,
    isAdding = false,
    mode,
    disabled = false
}: UserCardProps) {
    const fullName = `${user.firstName} ${user.lastName}`;

    if (mode === 'assigned') {
        return (
            <Box
                mb={2}
                p={2}
                sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isRemoving ? 0.6 : 1,
                    transition: 'opacity 0.2s'
                }}
            >
                <Typography>
                    {fullName}
                </Typography>
                {onRemove && (
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={onRemove}
                        disabled={isRemoving || disabled}
                    >
                        {isRemoving ? '...' : 'Entfernen'}
                    </Button>
                )}
            </Box>
        );
    }

    return (
        <Box
            mb={1}
            p={1.5}
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: isAdding || disabled ? 'default' : 'pointer',
                opacity: isAdding ? 0.6 : 1,
                transition: 'all 0.2s',
                '&:hover': {
                    backgroundColor: isAdding || disabled ? 'transparent' : '#f5f5f5'
                }
            }}
            onClick={() => {
                if (!isAdding && !disabled && onAdd) {
                    onAdd();
                }
            }}
        >
            <Typography>
                {fullName}
            </Typography>
            <Button
                size="small"
                variant="outlined"
                disabled={isAdding || disabled}
            >
                {isAdding ? '...' : '+'}
            </Button>
        </Box>
    );
}

export default function CreateOrEditCourse() {
    let {courseId} = useParams<{ courseId: string }>();

    const [course, setCourse] = useState<CourseDetailResponse | null>(null);
    const [originalCourse, setOriginalCourse] = useState<CourseDetailResponse | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
    const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
    const [teacherError, setTeacherError] = useState<string | null>(null)
    const [studentError, setStudentError] = useState<string | null>(null)
    const [creationError, setCreationError] = useState<string | null>(null)
    const [creatingCourse, setCreatingCourse] = useState(false)
    const [loadingTeachers, setLoadingTeachers] = useState(true)
    const [loadingStudents, setLoadingStudents] = useState(true)
    const [loadingCourse, setLoadingCourse] = useState(true)
    const [assigningTeacher, setAssigningTeacher] = useState<string | null>(null)
    const [removingTeacher, setRemovingTeacher] = useState<string | null>(null)
    const [assigningStudent, setAssigningStudent] = useState<string | null>(null)
    const [removingStudent, setRemovingStudent] = useState<string | null>(null)
    const [assignedTeacherSearchQuery, setAssignedTeacherSearchQuery] = useState('')
    const [assignedStudentSearchQuery, setAssignedStudentSearchQuery] = useState('')
    const [availableTeacherSearchQuery, setAvailableTeacherSearchQuery] = useState('')
    const [availableStudentSearchQuery, setAvailableStudentSearchQuery] = useState('')
    const [nameError, setNameError] = useState("")
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const [retryError, setRetryError] = useState<RetryError>({
        message: "",
        retryMethod: () => {}
    })

    const [courseCreateDetails, setCourseCreateDetails] = useState<CourseCreateDetails>({
        courseName: "",
        classTeacherId: "",
        teacherIds: [],
        studentIds: []
    });

    const isEdit = !(courseId === "new");
    const navigate = useNavigate();




    const handleCourseNameChange = (value: string) => {
        if (isEdit) {
            setCourse(prevState =>
                prevState
                    ? {...prevState, courseName: value}
                    : prevState
            );
        } else {
            setCourseCreateDetails(prevState =>
                prevState
                    ? {...prevState, courseName: value}
                    : prevState
            );
        }
    }

    const handleClassTeacherChange = (value: string) => {
        if (isEdit) {
            const newClassTeacher = allTeachers.find(t => t.teacherId === value);

            setCourse(prevState => {
                if (!prevState) return prevState;

                let updatedTeachers = [...prevState.teachers];

                if (newClassTeacher && !updatedTeachers.some(t => t.teacherId === value)) {
                    updatedTeachers.push(newClassTeacher);
                }

                if (!value && prevState.classTeacher) {
                    updatedTeachers = updatedTeachers.filter(t => t.teacherId !== prevState.classTeacher?.teacherId);
                }

                return {
                    ...prevState,
                    classTeacher: newClassTeacher,
                    teachers: updatedTeachers
                };
            });
        } else {
            setCourseCreateDetails(prevState => {
                if (!prevState) return prevState;

                const newClassTeacherId = allTeachers.find(t => t.teacherId === value)?.teacherId;
                let updatedTeacherIds = [...prevState.teacherIds];

                if (newClassTeacherId && !updatedTeacherIds.includes(newClassTeacherId)) {
                    updatedTeacherIds.push(newClassTeacherId);
                }

                if (!value && prevState.classTeacherId) {
                    updatedTeacherIds = updatedTeacherIds.filter(id => id !== prevState.classTeacherId);
                }

                return {
                    ...prevState,
                    classTeacherId: newClassTeacherId,
                    teacherIds: updatedTeacherIds
                };
            });
        }
    }


    const fetchCourse = async () => {
        if (!isEdit) return;

        setLoadingCourse(true)
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/${courseId}`, {
                method: "GET",
                credentials: "include"
            });

            if (!res.ok) {
                setSnackbarMessage(`Fehler beim Laden vom Kurs: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setRetryError({
                    message: "Failed to Load Course",
                    retryMethod: fetchCourse
                });
                return;
            }

            const course: CourseDetailResponse = await res.json();
            setCourse(course);
            setOriginalCourse(JSON.parse(JSON.stringify(course)));
        } catch (err: any) {
            setSnackbarMessage(`Fehler beim Laden vom Kurs: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setRetryError({
                message: `Failed to Load Course: ${err.message}`,
                retryMethod: fetchCourse
            });
        } finally {
            setLoadingCourse(false)
        }
    }

    const fetchTeachers = async () => {
        setLoadingTeachers(true)
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/teachers`, {
              credentials: "include"
            });

            if (!res.ok) {
                console.error(`Failed to fetch teachers: ${res.status}`);
                setSnackbarMessage(`Fehler beim Laden vom Lehrern: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setTeacherError(`Failed to fetch teachers: ${res.status}`)
                return
            }

            const data: Teacher[] = await res.json();
            setAllTeachers(data);
        } catch (err: any) {
            setSnackbarMessage(`Fehler beim Laden vom Lehrern: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            console.error(`Error fetching teachers: ${err.message}`);
            setTeacherError(`Error fetching teachers: ${err.message}`)
        } finally {
            setLoadingTeachers(false)
        }
    }

    const fetchStudents = async () => {
        setLoadingStudents(true)
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/users/free/students`, {
              credentials: "include"
            });

            if (!res.ok) {
                console.error(`Failed to fetch students: ${res.status}`);
                setSnackbarMessage(`Fehler beim Laden vom Schülern: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setStudentError(`Failed to fetch students: ${res.status}`)
                return
            }

            const data: Student[] = await res.json();
            setAvailableStudents(data);
        } catch (err: any) {
            console.error(`Error fetching students: ${err.message}`);
            setSnackbarMessage(`Fehler beim Laden vom Schülern: ${err.message}`);
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            setStudentError(`Error fetching students: ${err.message}`)
        } finally {
            setLoadingStudents(false)
        }
    }

    useEffect(() => {
        fetchTeachers()
        fetchStudents()
        if (isEdit) {
            fetchCourse();
        } else {
            setLoadingCourse(false)
        }
    }, []);

    const handleRemoveTeacher = (teacherId: string) => {
        if (isEdit) {
            setRemovingTeacher(teacherId);
            try {
                setCourse(prevState => {
                    if (!prevState) return prevState;

                    return {
                        ...prevState,
                        teachers: prevState.teachers.filter(t => t.teacherId !== teacherId),
                        classTeacher: prevState.classTeacher?.teacherId === teacherId ? undefined : prevState.classTeacher
                    };
                });
            } finally {
                setRemovingTeacher(null);
            }
        } else {
            setCourseCreateDetails(prevState => ({
                ...prevState,
                teacherIds: prevState.teacherIds.filter(id => id !== teacherId),
                classTeacherId: prevState.classTeacherId === teacherId ? undefined : prevState.classTeacherId
            }));
        }
    };

    const handleAddTeacher = (teacherId: string) => {
        if (isEdit) {
            setAssigningTeacher(teacherId);
            try {
                setCourse(prevState => {
                    if (!prevState) return prevState;

                    const teacher = allTeachers.find(t => t.teacherId === teacherId)
                    if (!teacher) return prevState;

                    if (prevState.teachers.some(t => t.teacherId === teacherId)) return prevState;

                    return {
                        ...prevState,
                        teachers: [...prevState.teachers, teacher]
                    }
                });
            } finally {
                setAssigningTeacher(null);
            }
        } else {
            setCourseCreateDetails(prevState => ({
                ...prevState,
                teacherIds: [...prevState.teacherIds, teacherId]
            }));
        }
    };

    const handleRemoveStudent = (studentId: string) => {
        if (isEdit) {
            setRemovingStudent(studentId);
            try {
                setCourse(prevState =>
                    prevState
                        ? {
                            ...prevState,
                            students: prevState.students.filter(s => s.studentId !== studentId)
                        }
                        : prevState
                );

                const student = course?.students.find(s => s.studentId === studentId);
                if (student) {
                    setAvailableStudents(prev => [...prev, student]);
                }
            } finally {
                setRemovingStudent(null);
            }
        } else {
            setCourseCreateDetails(prevState => ({
                ...prevState,
                studentIds: prevState.studentIds.filter(id => id !== studentId)
            }));
        }
    };

    const handleAddStudent = (studentId: string) => {
        if (isEdit) {
            setAssigningStudent(studentId);
            try {
                setCourse(prevState => {
                    if (!prevState) return prevState;

                    const student = availableStudents.find(s => s.studentId === studentId);
                    if (!student) return prevState;

                    if (prevState.students.some(s => s.studentId === studentId)) return prevState;

                    return {
                        ...prevState,
                        students: [...prevState.students, student]
                    }
                });

                setAvailableStudents(prev => prev.filter(s => s.studentId !== studentId));
            } finally {
                setAssigningStudent(null);
            }
        } else {
            setCourseCreateDetails(prevState => ({
                ...prevState,
                studentIds: [...prevState.studentIds, studentId]
            }));
        }
    };

    const handleCreateCourse = async () => {
        if (isEdit || !courseCreateDetails.courseName.trim()) return;

        if (courseCreateDetails.courseName.length > 100){
            setNameError("Name darf nicht länger als 100 sein")
            return
        }

        setCreatingCourse(true)
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/full`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(courseCreateDetails),
            })

            if (!res.ok) {
                setCreationError(`Fehler beim erstellen vom Kurs: ${res.status}`)
                navigate("/klassen", {
                    state: { snackbarMessage: `Fehler beim Erstellen der Klasse: ${res.status}`, snackbarSeverity: "error" }
                });
                return
            }
            navigate("/klassen", {
                state: { 
                    snackbarMessage: `Die Klasse "${courseCreateDetails.courseName}" wurde erfolgreich erstellt!`, 
                    snackbarSeverity: "success" 
                }
            });
        } catch (err: any) {
            setCreationError(`Fehler beim erstellen vom Kurs: ${err.message}`)
            navigate("/klassen", {
                state: { snackbarMessage: `Fehler beim Erstellen: ${err.message}`, snackbarSeverity: "error" }
            });
        } finally {
            setCreatingCourse(false)
        }
    }

    const handleSaveChanges = async () => {
        if (!isEdit || !course || !originalCourse) return;
        setSaving(true);
        setSaveError(null);

        try {
            const payload: CoursePutRequest = {
                classTeacherId: course.classTeacher?.teacherId ?? "",
                courseName: course.courseName,
                teacherIds: course.teachers.map(t => t.teacherId),
                studentIds: course.students.map(s => s.studentId)
            }

            const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/${courseId}/full`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                setSaveError(`Fehler beim Speicher: ${res.status}`)
                navigate("/klassen", {
                    state: { snackbarMessage: `Fehler beim Bearbeiten: ${res.status}`, snackbarSeverity: "error" }
                });
                return
            }

            setOriginalCourse(course);
            navigate("/klassen", {
                state: { 
                    snackbarMessage: `Die Klasse "${course?.courseName}" wurde erfolgreich bearbeitet!`, 
                    snackbarSeverity: "success" 
                }
            });
        } catch (err: any) {
            setSaveError(`Fehler beim Speichern: ${err.message}`)
            navigate("/klassen", {
                state: { snackbarMessage: `Fehler beim Bearbeiten: ${err.message}`, snackbarSeverity: "error" }
            });
        } finally {
            setSaving(false);
        }
    }

    const resetChanges = () => {
        setCourse(originalCourse);
        setOriginalCourse(course);
        setSnackbarMessage(`Zurückgesetzt`);
        setSnackbarSeverity("success");
    }

    if (loadingCourse) return <>Loading ...</>
    if (retryError.message && retryError.retryMethod) {
        return (
            <>
                <Typography>
                    Loading Error: {retryError.message}
                </Typography>
                <Button
                    onClick={async () => {
                        setRetryError({message: "", retryMethod: () => {}})
                        await retryError.retryMethod()
                    }}
                    variant="contained"
                >
                    Retry
                </Button>
            </>
        )
    }

    const baseAssignedTeachers: Teacher[] = isEdit
        ? (course?.teachers ?? [])
        : allTeachers.filter(t =>
            courseCreateDetails.teacherIds.includes(t.teacherId)
        );

    const assignedTeachers: Teacher[] = baseAssignedTeachers.filter(t => {
        if (!assignedTeacherSearchQuery.trim()) return true;
        const query = assignedTeacherSearchQuery.toLowerCase();
        const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
        return fullName.includes(query) || t.username.toLowerCase().includes(query);
    });

    const rightAvailableTeachers: Teacher[] = allTeachers
        .filter(t => !baseAssignedTeachers.some(at => at.teacherId === t.teacherId))
        .filter(t => {
            if (!availableTeacherSearchQuery.trim()) return true;
            const query = availableTeacherSearchQuery.toLowerCase();
            const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
            return fullName.includes(query) || t.username.toLowerCase().includes(query);
        });


    const baseAssignedStudents: Student[] = isEdit
        ? (course?.students ?? [])
        : availableStudents.filter(s =>
            courseCreateDetails.studentIds.includes(s.studentId)
        );

    const assignedStudents: Student[] = baseAssignedStudents.filter(s => {
        if (!assignedStudentSearchQuery.trim()) return true;
        const query = assignedStudentSearchQuery.toLowerCase();
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return fullName.includes(query) || s.username.toLowerCase().includes(query);
    });

    const rightAvailableStudents: Student[] = availableStudents
        .filter(s => !baseAssignedStudents.some(as => as.studentId === s.studentId))
        .filter(s => {
            if (!availableStudentSearchQuery.trim()) return true;
            const query = availableStudentSearchQuery.toLowerCase();
            const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
            return fullName.includes(query) || s.username.toLowerCase().includes(query);
        });

    return (
        <Box p={2}>
            <Box>
                <Typography variant="h5" py={2}>
                    {isEdit ? "Klasse bearbeiten" : "Klasse erstellen"}
                </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
                <TextField
                    label="Klassen Name"
                    required
                    value={isEdit ? course?.courseName : courseCreateDetails.courseName}
                    onChange={e => handleCourseNameChange(e.target.value)}
                    disabled={creatingCourse}
                    sx={{flex: "1 1 250px"}}
                    helperText={nameError}
                    error={Boolean(nameError)}
                />

                <TextField
                    select
                    label="Klassenlehrer"
                    value={isEdit ? course?.classTeacher?.teacherId : courseCreateDetails.classTeacherId}
                    onChange={e => handleClassTeacherChange(e.target.value)}
                    disabled={creatingCourse}
                    sx={{flex: "1 1 250px"}}
                >
                    <MenuItem value="">Kein Klassenlehrer</MenuItem>
                    {allTeachers.map((t) => (
                        <MenuItem key={t.teacherId} value={t.teacherId}>
                            {t.firstName} {t.lastName}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
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
                <Box mt={4} display="flex" justifyContent="flex-end">
                    {creationError && (
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
                                {creationError}
                            </Typography>

                            <Button
                                variant="outlined"
                                onClick={() => {
                                    setCreationError("");
                                    handleCreateCourse();
                                }}
                            >
                                Erneut versuchen
                            </Button>
                        </Box>
                    )}
                    {!creationError && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateCourse}
                            disabled={!courseCreateDetails.courseName.trim() || creatingCourse}
                        >
                            {creatingCourse ? "Erstelle..." : "Klasse erstellen"}
                        </Button>
                    )}
                </Box>
            )}

            <Box my={2}>
                <Divider/>
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap"> { /* bottom */ }
                <Box flex={2} minWidth={300} maxHeight="80vh" overflow="auto"> { /* left assigned users */ }
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography variant="h6" component="span">
                                Zugeordnete Lehrer ({assignedTeachers.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Lehrer suchen..."
                                value={assignedTeacherSearchQuery}
                                onChange={(e) => setAssignedTeacherSearchQuery(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            {teacherError && (
                                <Box mb={2} p={2} sx={{ backgroundColor: '#ffebee', borderRadius: 1}}>
                                    <Typography color="error" gutterBottom>
                                        {teacherError}
                                    </Typography>
                                    <Button
                                        onClick={() => {
                                            setTeacherError("");
                                            if (isEdit) {
                                                fetchCourse()
                                            } else {
                                                fetchTeachers()
                                            }
                                        }}
                                        variant="outlined">
                                        Erneut versuchen
                                    </Button>
                                </Box>
                            )}

                            {loadingTeachers && (
                                <Typography color="text.secondary" mb={3}>
                                    Lade Lehrer...
                                </Typography>
                            )}

                            {!loadingTeachers && !teacherError && assignedTeachers.length === 0 && (
                                <Typography color="text.secondary" mb={3}>
                                    Keine Lehrer zugeordnet
                                </Typography>
                            )}

                            {!loadingTeachers && assignedTeachers.map(t => (
                                <UserCard
                                    key={t.teacherId}
                                    user={t}
                                    mode="assigned"
                                    onRemove={() => handleRemoveTeacher(t.teacherId)}
                                    isRemoving={removingTeacher === t.teacherId}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>

                    <Box my={2}>
                        <Divider/>
                    </Box>

                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography variant="h6" pb={2}>
                                Zugeordnete Schüler ({assignedStudents.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Schüler suchen..."
                                value={assignedStudentSearchQuery}
                                onChange={(e) => setAssignedStudentSearchQuery(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            {studentError && (
                                <Box mb={2} p={2} sx={{ backgroundColor: '#ffebee', borderRadius: 1}}>
                                    <Typography color="error" gutterBottom>
                                        {studentError}
                                    </Typography>
                                    <Button
                                        onClick={() => {
                                            setStudentError("");
                                            if (isEdit) {
                                                fetchCourse()
                                            } else {
                                                fetchStudents()
                                            }
                                        }}
                                        variant="outlined">
                                        Erneut versuchen
                                    </Button>
                                </Box>
                            )}

                            {loadingStudents && (
                                <Typography color="text.secondary" mb={3}>
                                    Lade Schüler...
                                </Typography>
                            )}

                            {!loadingStudents && !studentError && assignedStudents.length === 0 && (
                                <Typography color="text.secondary" mb={3}>
                                    Keine Schüler zugeordnet
                                </Typography>
                            )}

                            {!loadingStudents && assignedStudents.map(s => (
                                <UserCard
                                    key={s.studentId}
                                    user={s}
                                    mode="assigned"
                                    onRemove={() => handleRemoveStudent(s.studentId)}
                                    isRemoving={removingStudent === s.studentId}
                                />
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </Box>

                <Divider orientation="vertical" flexItem/>

                <Box flex={1} minWidth={150} maxHeight="80vh" overflow="auto"> { /* left assignable */ }

                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography variant="h6">
                                Verfügbare Lehrer ({rightAvailableTeachers.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Lehrer suchen..."
                                value={availableTeacherSearchQuery}
                                onChange={(e) => setAvailableTeacherSearchQuery(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <Box mt={1} mb={4}>

                                {teacherError && (
                                    <Box mb={2} p={2} sx={{ backgroundColor: '#ffebee', borderRadius: 1}}>
                                        <Typography color="error" gutterBottom>
                                            {teacherError}
                                        </Typography>
                                    </Box>
                                )}

                                {loadingTeachers && (
                                    <Typography color="text.secondary" mb={3}>
                                        Lade Lehrer...
                                    </Typography>
                                )}

                                {!loadingTeachers && !teacherError && rightAvailableTeachers.length === 0 && (
                                    <Typography color="text.secondary" mb={3}>
                                        Alle Lehrer zugeordnet
                                    </Typography>
                                )}

                                {!loadingTeachers && rightAvailableTeachers.map(t => (
                                    <UserCard
                                        key={t.teacherId}
                                        user={t}
                                        mode="available"
                                        onAdd={() => handleAddTeacher(t.teacherId)}
                                        isAdding={assigningTeacher === t.teacherId}
                                    />
                                ))}
                            </Box>
                        </AccordionDetails>
                    </Accordion>


                    <Box my={2}>
                        <Divider/>
                    </Box>

                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Typography variant="h6" pb={2}>
                                Verfügbare Schüler ({rightAvailableStudents.length})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Schüler suchen..."
                                value={availableStudentSearchQuery}
                                onChange={(e) => setAvailableStudentSearchQuery(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <Box mt={1} mb={4}>

                                {studentError && (
                                    <Box mb={2} p={2} sx={{ backgroundColor: '#ffebee', borderRadius: 1}}>
                                        <Typography color="error" gutterBottom>
                                            {studentError}
                                        </Typography>
                                    </Box>
                                )}

                                {loadingStudents && (
                                    <Typography color="text.secondary" mb={3}>
                                        Lade Freie Schüler...
                                    </Typography>
                                )}

                                {!loadingStudents && !studentError && rightAvailableStudents.length === 0 && (
                                    <Typography color="text.secondary" mb={3}>
                                        Alle Schüler zugeordnet
                                    </Typography>
                                )}

                                {!loadingStudents && rightAvailableStudents.map(s => (
                                    <UserCard
                                        key={s.studentId}
                                        user={s}
                                        mode="available"
                                        onAdd={() => handleAddStudent(s.studentId)}
                                        isAdding={assigningStudent === s.studentId}
                                    />
                                ))}

                            </Box>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </Box>
    )
}