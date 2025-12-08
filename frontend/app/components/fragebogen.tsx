/**
 * @author: Noah Bach
 * Component that returns a form of a "Fragebogen" for students to fill out
 *
 * edited: Paul Geisthardt
 * User/Teacher view, Answer view...
 **/

// TODO: popup / dialog "bist du sicher?" wenn nicht alle fragen beantwortet


import React, {useState} from "react";
import DataTableWithAdd, {type DataRow} from "~/components/dataTableWithAddButton";
import {
    AccordionDetails,
    AccordionSummary,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import type {Question} from "~/routes/question";
import {useAuth} from "~/contexts/AuthContext";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router";
import Accordion from "@mui/material/Accordion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export enum QuestionnaireActivityStatus {
    EDITING = "EDITING",
    READY_FOR_ANSWERING = "READY_FOR_ANSWERING",
    ARCHIVED = "ARCHIVED",
    ALREADY_ANSWERED = "ALREADY_ANSWERED"
}

export enum QuestionType {
    GRADE = "GRADE",
    TEXT = "TEXT"
}

export enum ViewType {
    EDIT = "EDIT",
    PREVIEW = "PREVIEW",
    STUDENT_ANSWERS = "STUDENT_ANSWERS"
}

export type StudentAnswer = {
    studentId: string,
    answer?: string | number,
    authorId?: string
}

export interface FragebogenRow extends DataRow {
    id: string;
    question: string;
    type: QuestionType
    answer?: StudentAnswer[]
}

interface SortedQuestions {
    gradeQuestions: FragebogenRow[];
    textQuestions: FragebogenRow[];
}

export type FragebogenStudent = {
    studentId: string,
    studentName: string,
    hasSubmitted?: boolean
}

export interface StudentGradeAverage {
    studentId: string,
    studentName: string,
    averageGrade: number | null,
    totalGrades: number,
    selfAssessment: number | null,
    peerAssessment: number | null
}

interface FragebogenProps {
    rows: FragebogenRow[];
    students: FragebogenStudent[]
    editView?: boolean;
    onSubmit: (rows: FragebogenRow[], status: QuestionnaireActivityStatus) => void;
    status: QuestionnaireActivityStatus
    viewMode: ViewType
    selectedStudentFilter?: string | null
    gradeAverages?: StudentGradeAverage[]
}


export const NO_GRADE_SELECTED = 255;

export default function Fragebogen({
                                       rows,
                                       students,
                                       editView = false,
                                       onSubmit,
                                       status,
                                       viewMode,
                                       selectedStudentFilter,
                                       gradeAverages = []
                                   }: FragebogenProps) {
    const {user, isLoading} = useAuth()

    if (isLoading) return <>Loading User...</>

    if (!user) return <>Fehler beim Authentifizieren, bitte lade die Seite neu</>;

    const myId = user.id

    if (!myId || !myId.trim()) return <>Fehler beim Authentifizieren, bitte lade die Seite neu</>;


    const initializeAnswers = (row: FragebogenRow): FragebogenRow => {
        if (!row.answer || row.answer.length === 0) {
            return {
                ...row,
                answer: students.map(s => ({
                    studentId: s.studentId,
                    answer: row.type === QuestionType.GRADE ? NO_GRADE_SELECTED : ""
                }))
            };
        }
        const existingStudentIds = row.answer.map(a => a.studentId);
        const missingStudents = students.filter(s => !existingStudentIds.includes(s.studentId));
        if (missingStudents.length > 0) {
            return {
                ...row,
                answer: [
                    ...row.answer,
                    ...missingStudents.map(s => ({
                        studentId: s.studentId,
                        answer: row.type === QuestionType.GRADE ? NO_GRADE_SELECTED : ""
                    }))
                ]
            };
        }

        if (myId && !row.answer.some(s => s.studentId === myId)) {
            row = {
                ...row,
                answer: [
                    ...(row.answer || []),
                    {
                        studentId: myId,
                        answer: row.type === QuestionType.GRADE ? NO_GRADE_SELECTED : ""
                    }
                ]
            }
        }
        return row;
    };

    const [questions, setQuestions] = useState<FragebogenRow[]>(rows.map(initializeAnswers))
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newQuestion, setNewQuestion] = useState("")
    const [newType, setNewType] = useState<QuestionType>(QuestionType.GRADE)
    const [dialogMode, setDialogMode] = useState<"new" | "premade" | "">("new")
    const [draftQuestions, setDraftQuestions] = useState<Question[]>([])
    const [selectedPremade, setSelectedPremade] = useState<Question>()
    const [editingQuestion, setEditingQuestion] = useState<FragebogenRow | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [questionBowStatus, setQuestionBowStatus] = useState<QuestionnaireActivityStatus>(status)

    const navigate = useNavigate();


    const visibleQuestions: FragebogenRow[] = [
        ...questions,
        ...draftQuestions.map(q => ({
            id: q.id,
            question: q.text,
            type: q.type,
            answer: students.map(s => ({
                studentId: s.studentId,
                answer: q.type === QuestionType.GRADE ? NO_GRADE_SELECTED : ""
            }))
        }))
    ];

    const sorted: SortedQuestions = SortQuestions(visibleQuestions);

    const allStudents = viewMode === ViewType.STUDENT_ANSWERS && selectedStudentFilter
        ? students.filter(s => s.studentId === selectedStudentFilter)
        : [...students];

    const QUESTION_COL_WIDTH = "320px";
    const STUDENT_COL_WIDTH = `${Math.max(120, 800 / allStudents.length)}px`;

    const allAnsweredFilled = questions.every(q => {
        if (!q.answer) return false;

        if (q.type === QuestionType.GRADE) {
            return q.answer.every(a => typeof a.answer === "number" && a.answer !== NO_GRADE_SELECTED);
        }

        if (q.type === QuestionType.TEXT) {
            const myAnswer = q.answer.find(a => a.studentId === myId);
            return myAnswer && typeof myAnswer.answer === "string" && myAnswer.answer.trim() !== "";
        }

        return false;
    });

    const columns = [
        {key: "question", label: "Frage"},
        {key: "type", label: "Frage Typ"}
    ]

    const randomUUID = (): string => {
        return typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
    }

    const addQuestion = () => {
        setIsEditMode(false)
        setEditingQuestion(null)
        setNewQuestion("")
        setNewType(QuestionType.GRADE)
        setDialogMode("new")
        setDialogOpen(true)
    }

    const handleNewQuestion = () => {
        if (isEditMode && editingQuestion) {
            const isDraft = draftQuestions.some(q => q.id === editingQuestion.id);

            if (isDraft) {
                setDraftQuestions(prevState =>
                    prevState.map(q =>
                        q.id === editingQuestion.id
                            ? {...q, text: newQuestion, type: newType}
                            : q
                    )
                );
            } else {
                setQuestions(prevState =>
                    prevState.map(q =>
                        q.id === editingQuestion.id
                            ? {...q, question: newQuestion, type: newType}
                            : q
                    )
                );
            }
        } else {
            if (dialogMode === "new" && newQuestion.trim()) {
                setDraftQuestions(prevState => [
                        ...prevState,
                        {
                            id: randomUUID(),
                            text: newQuestion,
                            type: newType,
                            subjects: []
                        }
                    ]
                )
            }

            if (dialogMode === "premade" && selectedPremade) {
                setDraftQuestions(prevState => [
                    ...prevState,
                    {
                        id: randomUUID(),
                        text: selectedPremade.text,
                        type: selectedPremade.type,
                        subjects: []
                    }
                ])
            }
        }

        setDialogOpen(false);
        setNewQuestion("");
        setDialogMode("new");
        setSelectedPremade(undefined);
        setIsEditMode(false);
        setEditingQuestion(null);
    }

    const editQuestion = (row: FragebogenRow) => {
        setIsEditMode(true)
        setEditingQuestion(row)
        setNewQuestion(row.question)
        setNewType(row.type)
        setDialogMode("new")
        setDialogOpen(true)
    }

    const deleteQuestion = (questionId: string) => {
        if (!window.confirm(`Möchtest du die Frage wirklich löschen?`)) {
            return;
        }

        const isDraft = draftQuestions.some(q => q.id === questionId);

        if (isDraft) {
            setDraftQuestions(prevState => prevState.filter(q => q.id !== questionId));
        } else {
            setQuestions(prevState => prevState.filter(q => q.id !== questionId));
        }
    }

    const handleReset = () => {
        if (window.confirm("Willst du wirklich deine jetzigen Änderungen zurücksetzten?"))
            setDraftQuestions([])
    }

    const handleSubmit = () => {
        onSubmit(visibleQuestions, questionBowStatus)
    }

    if (!editView && status === QuestionnaireActivityStatus.EDITING && viewMode !== ViewType.PREVIEW) {
        return (
            <>
                <Typography>
                    Dieser Fragebogen ist noch nicht für die Beantwortung freigegeben
                </Typography>
                <Button variant="contained" onClick={() => {
                    navigate("/fragebogen")
                }}>
                    Return
                </Button>
            </>
        )
    }

    if (!editView && status == QuestionnaireActivityStatus.ALREADY_ANSWERED) {
        return (
            <>
                <Typography>
                    Du hast diesen Fragebogen bereits geantwortet
                </Typography>
                <Button variant="contained" onClick={() => {
                    navigate("/fragebogen")
                }}>
                    Zurück
                </Button>
            </>
        )
    }

    if (!editView && status === QuestionnaireActivityStatus.ARCHIVED && viewMode !== ViewType.PREVIEW) {
        return (
            <>
                <Typography>
                    Dieser Fragebogen ist archiviert
                </Typography>
                <Button variant="contained" onClick={() => {
                    navigate("/fragebogen")
                }}>
                    Return
                </Button>
            </>
        )
    }

    return (
        <>
            {editView && (
                <>
                    <DataTableWithAdd
                        columns={columns}
                        rows={visibleQuestions}
                        onAddClick={() => addQuestion()}
                        onEditClick={(row) => editQuestion(row as FragebogenRow)}
                        onDeleteClick={(id) => deleteQuestion(id)}
                        isDisabled={questionBowStatus !== QuestionnaireActivityStatus.EDITING}
                    />

                    <Box display="flex" flexDirection="column" gap={2} pt={2}>
                        <TextField
                            select
                            label="Fragebogen Status"
                            value={questionBowStatus}
                            onChange={(e) => setQuestionBowStatus(e.target.value as QuestionnaireActivityStatus)}
                        >
                            <MenuItem key={QuestionnaireActivityStatus.EDITING}
                                      value={QuestionnaireActivityStatus.EDITING}>Bearbeiten</MenuItem>
                            <MenuItem key={QuestionnaireActivityStatus.READY_FOR_ANSWERING}
                                      value={QuestionnaireActivityStatus.READY_FOR_ANSWERING}>Bereit für Schüler zum
                                Antworten</MenuItem>
                            <MenuItem key={QuestionnaireActivityStatus.ARCHIVED}
                                      value={QuestionnaireActivityStatus.ARCHIVED}>Archiviert</MenuItem>
                        </TextField>

                        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                            <Button variant="contained" onClick={handleReset}>
                                Zurücksetzen
                            </Button>
                            <Button variant="contained" onClick={handleSubmit}>
                                Speichern
                            </Button>
                        </Box>
                    </Box>

                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                        <DialogTitle>{isEditMode ? "Frage bearbeiten" : "Neue Frage hinzufügen"}</DialogTitle>
                        <DialogContent>
                            {!isEditMode && (
                                <TextField
                                    autoFocus
                                    select
                                    margin="dense"
                                    label="Fragequelle"
                                    fullWidth
                                    value={dialogMode}
                                    onChange={(e) => setDialogMode(e.target.value as "new" | "premade")}
                                >
                                    <MenuItem value="new">Neue Frage erstellen</MenuItem>
                                    <MenuItem value="premade" disabled={true}>Bestehende auswählen</MenuItem>
                                </TextField>
                            )}

                            {!isEditMode && dialogMode !== "" && (
                                <Box py={2}>
                                    <Divider/>
                                </Box>
                            )}

                            {(dialogMode === "new" || isEditMode) && (
                                <>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Frage"
                                        fullWidth
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Fragetyp"
                                        select
                                        fullWidth
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as QuestionType)}
                                    >
                                        <MenuItem value={QuestionType.TEXT}>Text</MenuItem>
                                        <MenuItem value={QuestionType.GRADE}>Note</MenuItem>
                                    </TextField>
                                </>
                            )}

                            {dialogMode === "premade" && (
                                <>
                                    TODO: Fragen fetchen und filtern
                                </>
                            )}

                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                            <Button
                                variant="contained"
                                onClick={handleNewQuestion}
                                disabled={isEditMode ? !newQuestion : (dialogMode === "new" ? !newQuestion : !selectedPremade || dialogMode === "")}
                            >
                                {isEditMode ? "Speichern" : "Hinzufügen"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}


            {(!editView && viewMode === ViewType.STUDENT_ANSWERS) && (
                <>
                    {(sorted.gradeQuestions.length === 0 && sorted.textQuestions.length === 0) && (
                        <Box>
                            Es existieren keine Fragen
                        </Box>
                    )}

                    {selectedStudentFilter && (
                        <Box mb={4}>
                            <Typography variant="h6" gutterBottom
                                        sx={{borderBottom: '2px solid #1976d2', pb: 1, mb: 2}}>
                                Antworten von: {students.find(s => s.studentId === selectedStudentFilter)?.studentName}
                            </Typography>

                            {sorted.gradeQuestions.length > 0 && (
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>Noten-Fragen:</Typography>
                                    {sorted.gradeQuestions.map(q => {
                                        const answersFromStudent = (q.answer || []).filter(a => a.authorId === selectedStudentFilter);
                                        return (
                                            <Box key={q.id} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                    {q.question}
                                                </Typography>
                                                {answersFromStudent.length > 0 ? (
                                                    answersFromStudent.map((ans, idx) => {
                                                        const recipientName = students.find(s => s.studentId === ans.studentId)?.studentName || "Unknown";
                                                        return (
                                                            <Box key={idx} ml={2} mb={1}>
                                                                <Typography variant="body2">
                                                                    <strong>Für {recipientName}:</strong> {typeof ans.answer === 'number' && ans.answer !== 255 ? ans.answer : 'Keine Antwort'}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" ml={2}>
                                                        Noch keine Antworten
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {sorted.textQuestions.length > 0 && (
                                <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom>Text-Fragen:</Typography>
                                    {sorted.textQuestions.map(q => {
                                        const selfAnswer = (q.answer || []).find(a => a.authorId === selectedStudentFilter && a.studentId === selectedStudentFilter);
                                        return (
                                            <Box key={q.id} mb={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
                                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                                    {q.question}
                                                </Typography>
                                                {selfAnswer && typeof selfAnswer.answer === 'string' && selfAnswer.answer.trim() ? (
                                                    <Typography variant="body2" ml={2} fontStyle="italic">
                                                        {selfAnswer.answer}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" ml={2}>
                                                        Keine Antwort
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    )}

                    {!selectedStudentFilter && sorted.gradeQuestions.length > 0 && (
                        <Box py={2}>
                            <Accordion defaultExpanded>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon/>}
                                    aria-controls="panel1-content"
                                    id="panel1-header">
                                    <Typography variant="h6" gutterBottom
                                                sx={{borderBottom: '2px solid #1976d2', pb: 1, mb: 2}}>
                                        Übersicht aller Noten-Antworten
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {sorted.gradeQuestions.map(q => (
                                        <Box key={q.id} mb={4}>
                                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                                {q.question}
                                            </Typography>
                                            <TableContainer component={Paper} sx={{overflowX: 'auto'}}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell
                                                                sx={{
                                                                    fontWeight: 'bold',
                                                                    bgcolor: 'grey.100'
                                                                }}
                                                            >
                                                                Von ↓ / Für →
                                                            </TableCell>
                                                            {students.map(s => (
                                                                <TableCell
                                                                    key={s.studentId}
                                                                    align="center"
                                                                    sx={{
                                                                        bgcolor: 'grey.100',
                                                                        fontSize: '0.85em'
                                                                    }}
                                                                >
                                                                    {s.studentName}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {students.map(author => (
                                                            <TableRow key={author.studentId}>
                                                                <TableCell
                                                                    sx={{
                                                                        fontWeight: 'bold',
                                                                        bgcolor: 'grey.50'
                                                                    }}
                                                                >
                                                                    {author.studentName}
                                                                </TableCell>
                                                                {students.map(recipient => {
                                                                    const answer = (q.answer || []).find(a =>
                                                                        a.authorId === author.studentId &&
                                                                        a.studentId === recipient.studentId
                                                                    );
                                                                    const value = answer && typeof answer.answer === 'number' && answer.answer !== NO_GRADE_SELECTED
                                                                        ? answer.answer
                                                                        : '-';
                                                                    return (
                                                                        <TableCell
                                                                            key={recipient.studentId}
                                                                            align="center"
                                                                            sx={{
                                                                                bgcolor: author.studentId === recipient.studentId ? 'rgba(255, 228, 225, 0.5)' : 'inherit'
                                                                            }}
                                                                        >
                                                                            {value}
                                                                        </TableCell>
                                                                    );
                                                                })}
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                    ))}

                                    {gradeAverages.length > 0 && (
                                        <Box mt={4}>
                                            <Accordion defaultExpanded>
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon/>}
                                                    aria-controls="panel1-content"
                                                    id="panel1-header"
                                                >
                                                    <Typography variant="h6" gutterBottom
                                                                sx={{borderBottom: '2px solid #1976d2', pb: 1, mb: 2}}>
                                                        Notendurchschnitte (Selbst- und Fremdbewertung)
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <TableContainer component={Paper} sx={{overflowX: 'auto'}}>
                                                        <Table sx={{minWidth: 500}}>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell
                                                                        sx={{
                                                                            bgcolor: 'primary.main',
                                                                            color: 'primary.contrastText',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        Student
                                                                    </TableCell>
                                                                    <TableCell
                                                                        align="center"
                                                                        sx={{
                                                                            bgcolor: 'primary.main',
                                                                            color: 'primary.contrastText',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        Gesamtdurchschnitt
                                                                    </TableCell>
                                                                    <TableCell
                                                                        align="center"
                                                                        sx={{
                                                                            bgcolor: 'primary.main',
                                                                            color: 'primary.contrastText',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        Selbsteinschätzung
                                                                    </TableCell>
                                                                    <TableCell
                                                                        align="center"
                                                                        sx={{
                                                                            bgcolor: 'primary.main',
                                                                            color: 'primary.contrastText',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        Fremdbewertung
                                                                    </TableCell>
                                                                    <TableCell
                                                                        align="center"
                                                                        sx={{
                                                                            bgcolor: 'primary.main',
                                                                            color: 'primary.contrastText',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                    >
                                                                        Anzahl Bewertungen
                                                                    </TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {gradeAverages.map((avg, idx) => (
                                                                    <TableRow
                                                                        key={avg.studentId}
                                                                        sx={{
                                                                            '&:nth-of-type(odd)': {bgcolor: 'grey.50'}
                                                                        }}
                                                                    >
                                                                        <TableCell sx={{fontWeight: 'bold'}}>
                                                                            {avg.studentName}
                                                                        </TableCell>
                                                                        <TableCell
                                                                            align="center"
                                                                            sx={{
                                                                                fontWeight: 'bold',
                                                                                fontSize: '1.1em'
                                                                            }}
                                                                        >
                                                                            {avg.averageGrade !== null ? avg.averageGrade.toFixed(2) : '-'}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {avg.selfAssessment !== null ? avg.selfAssessment.toFixed(2) : '-'}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {avg.peerAssessment !== null ? avg.peerAssessment.toFixed(2) : '-'}
                                                                        </TableCell>
                                                                        <TableCell align="center">
                                                                            {avg.totalGrades}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </AccordionDetails>
                                            </Accordion>
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    )}

                    <Box py={2}>
                        <Divider/>
                    </Box>

                    {!selectedStudentFilter && sorted.textQuestions.length > 0 && (
                        <Accordion defaultExpanded>
                            <AccordionSummary>
                                <Typography variant="h6" gutterBottom
                                            sx={{borderBottom: '2px solid #1976d2', pb: 1, mb: 2}}>
                                    Text-Fragen
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {sorted.textQuestions.map(q => (
                                    <Box key={q.id} mb={3}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            {q.question}
                                        </Typography>
                                        {students.map(student => {
                                            const selfAnswer = (q.answer || []).find(a =>
                                                a.authorId === student.studentId &&
                                                a.studentId === student.studentId
                                            );
                                            return (
                                                <Box key={student.studentId} mb={2} p={2} bgcolor="#f5f5f5"
                                                     borderRadius={1}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {student.studentName}:
                                                    </Typography>
                                                    {selfAnswer && typeof selfAnswer.answer === 'string' && selfAnswer.answer.trim() ? (
                                                        <Typography variant="body2" ml={2} fontStyle="italic">
                                                            {selfAnswer.answer}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" ml={2}>
                                                            Keine Antwort
                                                        </Typography>
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    )}
                </>
            )}

            {(!editView && (status === QuestionnaireActivityStatus.READY_FOR_ANSWERING || viewMode === ViewType.PREVIEW) && viewMode !== ViewType.STUDENT_ANSWERS) && (
                <>
                    {(sorted.gradeQuestions.length === 0 && sorted.textQuestions.length === 0) && (
                        <Box>
                            Es existieren keine Fragen
                        </Box>
                    )}
                    {sorted.gradeQuestions.length > 0 && (
                        <TableContainer component={Paper} sx={{mb: 4}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            sx={{
                                                fontWeight: 'bold',
                                                width: QUESTION_COL_WIDTH,
                                                bgcolor: 'grey.100'
                                            }}
                                        >
                                            Frage
                                        </TableCell>
                                        {allStudents.map((s) => (
                                            <TableCell
                                                key={s.studentId}
                                                align="center"
                                                sx={{
                                                    width: STUDENT_COL_WIDTH,
                                                    bgcolor: 'grey.100'
                                                }}
                                            >
                                                {s.studentName}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {sorted.gradeQuestions.map(q => (
                                        <TableRow key={q.id}>
                                            <TableCell>
                                                {q.question}
                                            </TableCell>

                                            {allStudents.map((s, index) => (
                                                <TableCell
                                                    key={s.studentId + index}
                                                    align="center"
                                                    sx={{p: 0.5}}
                                                >
                                                    <TextField
                                                        select
                                                        disabled={status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING}
                                                        name={`${q.id}-${s.studentId}`}
                                                        value={q.answer?.find(a => a.studentId === s.studentId)?.answer ?? NO_GRADE_SELECTED}
                                                        fullWidth
                                                        sx={{
                                                            "& .MuiSelect-select": {
                                                                padding: "8px",
                                                                textAlign: "center"
                                                            }
                                                        }}
                                                        onChange={(e) => {
                                                            setQuestions(prevState =>
                                                                prevState.map(item =>
                                                                    item.id === q.id
                                                                        ? {
                                                                            ...item,
                                                                            answer: item.answer?.map(a =>
                                                                                a.studentId === s.studentId
                                                                                    ? {...a, answer: e.target.value}
                                                                                    : a
                                                                            ) || [{
                                                                                studentId: s.studentId,
                                                                                answer: e.target.value
                                                                            }]
                                                                        }
                                                                        : item
                                                                )
                                                            )
                                                        }}
                                                    >
                                                        <MenuItem value={NO_GRADE_SELECTED}>
                                                            Note wählen
                                                        </MenuItem>
                                                        <MenuItem value={1}>1</MenuItem>
                                                        <MenuItem value={2}>2</MenuItem>
                                                        <MenuItem value={3}>3</MenuItem>
                                                        <MenuItem value={4}>4</MenuItem>
                                                        <MenuItem value={5}>5</MenuItem>
                                                        <MenuItem value={6}>6</MenuItem>
                                                    </TextField>
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {sorted.textQuestions.map(q => (
                        <Box key={q.id} mb={3}>
                            <div>
                                {q.question}
                            </div>

                            <TextField
                                fullWidth
                                multiline
                                disabled={status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING}
                                placeholder="Antwort eingeben..."
                                name={`${q.id}`}
                                value={q.answer?.find(a => a.studentId === myId)?.answer || ""}
                                onChange={(e) => {
                                    if (!myId) return

                                    setQuestions(prevState =>
                                        prevState.map(item =>
                                            item.id === q.id
                                                ? {
                                                    ...item,
                                                    answer: item.answer?.map(a =>
                                                        a.studentId === myId
                                                            ? {...a, answer: e.target.value}
                                                            : a
                                                    ) || [{studentId: myId, answer: e.target.value}]
                                                }
                                                : item
                                        )
                                    )
                                }}
                            />
                        </Box>
                    ))}
                    {/*Slay ist cool*/}
                    <Button
                        variant="contained"
                        sx={{mt: 2}}
                        onClick={handleSubmit}
                        disabled={!allAnsweredFilled || status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING}
                    >
                        Abgeben
                    </Button>
                </>
            )}
        </>
    )
}

function SortQuestions(questions: FragebogenRow[]): SortedQuestions {
    let returnObject: SortedQuestions = {
        gradeQuestions: [],
        textQuestions: []
    }
    for (let q of questions)
        (q.type === QuestionType.GRADE ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
    return returnObject;
}
