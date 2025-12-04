/**
 * @author: Noah Bach
 * Component that returns a form of a "Fragebogen" for students to fill out
 *
 **/

// TODO: popup / dialog "bist du sicher?" wenn nicht alle fragen beantwortet


import React, {useEffect, useState} from "react";
import DataTableWithAdd, {type DataRow} from "~/components/dataTableWithAddButton";
import {Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import type {Question} from "~/routes/question";
import {useAuth} from "~/contexts/AuthContext";
import Typography from "@mui/material/Typography";
import {useNavigate} from "react-router";

export enum QuestionnaireActivityStatus {
    EDITING = "EDITING",
    READY_FOR_ANSWERING = "READY_FOR_ANSWERING",
    ARCHIVED = "ARCHIVED"
}

export enum QuestionType {
    GRADE = "GRADE",
    TEXT = "TEXT"
}

export type StudentAnswer = {
    studentId: string,
    answer?: string | number
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
    studentName: string
}

interface FragebogenProps {
    rows: FragebogenRow[];
    students: FragebogenStudent[]
    editView?: boolean;
    onSubmit: (rows: FragebogenRow[], status: QuestionnaireActivityStatus) => void;
    status: QuestionnaireActivityStatus
    isPreview: boolean
}

export default function Fragebogen({rows, students, editView = false, onSubmit, status, isPreview}: FragebogenProps) {
    const {user, isLoading} = useAuth()

    if (isLoading) return <>Loading User...</>

    const NO_GRADE_SELECTED = 255;
    const myId = user?.userId;
    if (!myId) return <>Log in</>

    const initializeAnswers = (row: FragebogenRow): FragebogenRow => {
        if (row.type === QuestionType.GRADE) {
            if (!row.answer || row.answer.length === 0) {
                return {
                    ...row,
                    answer: students.map(s => ({
                        studentId: s.studentId,
                        answer: NO_GRADE_SELECTED
                    }))
                };
            }

            const existingIds = row.answer.map(a => a.studentId);
            const missingStudents = students.filter(s => !existingIds.includes(s.studentId));

            return {
                ...row,
                answer: [
                    ...row.answer,
                    ...missingStudents.map(s => ({
                        studentId: s.studentId,
                        answer: NO_GRADE_SELECTED
                    }))
                ]
            };
        }

        if (row.type === QuestionType.TEXT) {
            const myAnswer = row.answer?.find(a => a.studentId === myId);

            if (myAnswer) return row;

            return {
                ...row,
                answer: [{
                    studentId: myId,
                    answer: ""
                }]
            };
        }

        return row;
    };

    const [questions, setQuestions] = useState<FragebogenRow[]>(() => rows.map(initializeAnswers))
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newQuestion, setNewQuestion] = useState("")
    const [newType, setNewType] = useState<QuestionType>(QuestionType.GRADE)
    const [dialogMode, setDialogMode] = useState<"new" | "premade" | "">("")
    const [draftQuestions, setDraftQuestions] = useState<Question[]>([])
    const [selectedPremade, setSelectedPremade] = useState<Question>()
    const [editingQuestion, setEditingQuestion] = useState<FragebogenRow | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [questionBowStatus, setQuestionBowStatus] = useState<QuestionnaireActivityStatus>(QuestionnaireActivityStatus.EDITING)

    const navigate = useNavigate();

    useEffect(() => {
        setQuestions(rows.map(initializeAnswers));
    }, [rows, students]);

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
    const allStudents = [...students];

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
        setDialogMode("")
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
        setDialogMode("");
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
        if (!window.confirm("Willst du wirklich deine jetzigen Änderungen zurücksetzten?"))
            setDraftQuestions([])
    }

    const handleSubmit = () => {
        onSubmit(visibleQuestions, questionBowStatus)
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
                    />

                    <Box display="flex" flexDirection="column" gap={2} pt={2}>
                        <TextField
                            select
                            label="Fragebogen Status"
                            value={questionBowStatus}
                            onChange={(e) => setQuestionBowStatus(e.target.value as QuestionnaireActivityStatus)}
                        >
                            {Object.values(QuestionnaireActivityStatus).map(qs => (
                                <MenuItem key={qs} value={qs}>
                                    {qs}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                            <Button variant="contained" onClick={handleReset}>
                                Zurücksetzten
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
                                    <MenuItem value="premade">Bestehende auswählen</MenuItem>
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
                                    TODO: fetch FRAGI UND MACH FILTERING
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

            {!editView && status === QuestionnaireActivityStatus.EDITING && !isPreview && (
                <>
                    <Typography>
                        You do not belong here, it is still being editied by teachers
                    </Typography>
                    <Button variant="contained" onClick={() => {
                        navigate("/fragebogen")
                    }}>
                        Return
                    </Button>
                </>
            )}

            {!editView && status === QuestionnaireActivityStatus.ARCHIVED && !isPreview && (
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
            )}

            {(!editView && status === QuestionnaireActivityStatus.READY_FOR_ANSWERING || !editView && isPreview) && (
                <>
                    {(sorted.gradeQuestions.length === 0 && sorted.textQuestions.length === 0) && (
                        <Box>
                            Es existieren keine Fragen
                        </Box>
                    )}
                    {sorted.gradeQuestions.length > 0 && (
                        <Box mb={4}>
                            <table
                                style={{
                                    width: "100%",
                                }}
                            >
                                <colgroup>
                                    <col style={{width: QUESTION_COL_WIDTH}}/>
                                    {allStudents.map((_, i) => (
                                        <col
                                            key={i}
                                            style={{width: STUDENT_COL_WIDTH}}
                                        />
                                    ))}
                                </colgroup>

                                <thead>
                                <tr>
                                    <th
                                        style={{
                                            textAlign: "left",
                                            padding: "8px 4px",
                                            borderBottom: "1px solid #ccc"
                                        }}
                                    >
                                        Frage
                                    </th>
                                    {allStudents.map((s) => (
                                        <th
                                            key={s.studentId}
                                            style={{
                                                textAlign: "center",
                                                padding: "8px 4px",
                                                borderBottom: "1px solid #ccc"
                                            }}
                                        >
                                            {s.studentName}
                                        </th>
                                    ))}
                                </tr>
                                </thead>

                                <tbody>
                                {sorted.gradeQuestions.map(q => (
                                    <tr
                                        key={q.id}
                                        style={{
                                            borderBottom: "1px solid #eee"
                                        }}
                                    >
                                        <td style={{padding: "8px 4px"}}>
                                            {q.question}
                                        </td>

                                        {allStudents.map((s, index) => (
                                            <td
                                                key={s.studentId + index}
                                                style={{
                                                    padding: "4px",
                                                    textAlign: "center"
                                                }}
                                            >
                                                <TextField
                                                    select
                                                    disabled={status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING && !isPreview}
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
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </Box>
                    )}

                    {sorted.textQuestions.map(q => (
                        <Box key={q.id} mb={3}>
                            <div>
                                {q.question}
                            </div>

                            <TextField
                                fullWidth
                                multiline
                                disabled={status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING && !isPreview}
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
                        disabled={!allAnsweredFilled || status !== QuestionnaireActivityStatus.READY_FOR_ANSWERING && !isPreview}
                    >
                        Abgeben
                    </Button>
                </>
            )}
        </>
    )
}

// Riven ist Arsch
function SortQuestions(questions: FragebogenRow[]): SortedQuestions {
    let returnObject: SortedQuestions = {
        gradeQuestions: [],
        textQuestions: []
    }
    for (let q of questions)
        (q.type === QuestionType.GRADE ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
    return returnObject;
}