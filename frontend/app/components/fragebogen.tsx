/**
 * @author: Noah Bach
 * Component that returns a form of a "Fragebogen" for students to fill out
 *
 **/

// TODO: popup / dialog "bist du sicher?" wenn nicht alle fragen beantwortet


import React, {useState} from "react";
import DataTableWithAdd, {type DataRow} from "~/components/dataTableWithAddButton";
import {Dialog, DialogActions, DialogContent, DialogTitle, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import type {Question} from "~/routes/question";

export enum QuestionType {
    GRADE = "GRADE",
    TEXT = "TEXT"
}

export interface FragebogenRow extends DataRow {
    id: string;
    question: string;
    type: QuestionType
}

interface SortedQuestions {
    gradeQuestions: FragebogenRow[];
    textQuestions: FragebogenRow[];
}

interface FragebogenProps {
    rows: FragebogenRow[];
    studentNames: string[];
    editView?: boolean;
    onSubmit: (rows: FragebogenRow[]) => void;
}

export default function Fragebogen({rows, studentNames, editView = false, onSubmit}: FragebogenProps) {
    const [questions, setQuestions] = useState<FragebogenRow[]>([...rows])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [newQuestion, setNewQuestion] = useState("")
    const [newType, setNewType] = useState<QuestionType>(QuestionType.GRADE)
    const [dialogMode, setDialogMode] = useState<"new" | "premade" | "">("")
    const [draftQuestions, setDraftQuestions] = useState<Question[]>([])
    const [selectedPremade, setSelectedPremade] = useState<Question>()


    const visibleQuestions: FragebogenRow[] = [
        ...questions,
        ...draftQuestions.map(q => ({
            id: q.id,
            question: q.text,
            type: q.type
        }))
    ];

    const sorted = SortQuestions(visibleQuestions);
    const NO_GRADE_SELECTED = 255;
    const allStudents = ["Selbsteinschätzung", ...studentNames];

    const QUESTION_COL_WIDTH = "320px";
    const STUDENT_COL_WIDTH = `${Math.max(120, 800 / allStudents.length)}px`;

    const columns = [
        {key: "question", label: "Frage"},
        {key: "type", label: "Frage Typ"}
    ]

    const randomUUID = (): string => {
        return typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
    }

    const addQuestion = () => {
        setDialogOpen(true)
    }

    const editQuestion = () => {

    }

    const deleteQuestion = () => {

    }

    const handleNewQuestion = () => {
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

        setDialogOpen(false);
        setNewQuestion("");
        setDialogMode("");
        setSelectedPremade(undefined);
    }

    const handleReset = () => {
        if (!window.confirm("Willst du wirklich deine jetzigen Änderungen zurücksetzten?"))
            setDraftQuestions([])
    }

    const handleSubmit = () => {

    }

    return (
        <>
            {editView && (
                <>
                    <DataTableWithAdd
                        columns={columns}
                        rows={visibleQuestions}
                        onAddClick={() => addQuestion()}
                        onEditClick={editQuestion}
                        onDeleteClick={deleteQuestion}
                    />

                    <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
                        <Button variant="contained" onClick={handleReset}>
                            Zurücksetzten
                        </Button>
                        <Button variant="contained" onClick={handleSubmit}>
                            Speichern
                        </Button>
                    </Box>

                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                        <DialogTitle>Neue Frage hinzufügen</DialogTitle>
                        <DialogContent>
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

                            {dialogMode !== "" && (
                                <Box py={2}>
                                    <Divider/>
                                </Box>
                            )}

                            {dialogMode === "new" && (
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
                                disabled={dialogMode === "new" ? !newQuestion : !selectedPremade || dialogMode === ""}
                            >
                                Hinzufügen
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}

            {!editView && (
                <>
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
                                    {allStudents.map((name) => (
                                        <th
                                            key={name}
                                            style={{
                                                textAlign: "center",
                                                padding: "8px 4px",
                                                borderBottom: "1px solid #ccc"
                                            }}
                                        >
                                            {name}
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

                                        {allStudents.map((name, index) => (
                                            <td
                                                key={name + index}
                                                style={{
                                                    padding: "4px",
                                                    textAlign: "center"
                                                }}
                                            >
                                                <TextField
                                                    select
                                                    name={`${q.id}-grade-${index}`}
                                                    defaultValue={NO_GRADE_SELECTED}
                                                    fullWidth
                                                    sx={{
                                                        "& .MuiSelect-select": {
                                                            padding: "8px",
                                                            textAlign: "center"
                                                        }
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
                                placeholder="Antwort eingeben..."
                                name={`${q.id}-text-answer`}
                            />
                        </Box>
                    ))}

                    <Button
                        variant="contained"
                        sx={{mt: 2}}
                    >
                        Abgeben
                    </Button>
                </>
            )}
        </>
    )
}


// function AddButton(){
//     return <IconButton onClick={onAddClick} aria-label="add">
//                 <AddIcon/>
//             </IconButton>
// }

function SortQuestions(questions: FragebogenRow[]): SortedQuestions {
    let returnObject: SortedQuestions = {
        gradeQuestions: [],
        textQuestions: []
    }
    for (let q of questions)
        (q.type === QuestionType.GRADE ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
    return returnObject;
}

// export default function FragebogenTable({
//                                             onSubmit,
//                                             rows: rowData,
//                                             studentNames,
//                                             editView: isEditView,
//                                             subject
//                                         }: {
//     onSubmit: React.FormEventHandler<HTMLFormElement>;
//     rows: FragebogenRow[];
//     studentNames: string[];
//     editView?: boolean;
//     subject?: string
// }) {
//
//     const sortedRows: SortedQuestions = SortQuestions(rowData)
//
//     const [gradeRows, setGradeRows] = useState<FragebogenRow[]>([...sortedRows.gradeQuestions]);
//     const [textRows, setTextRows] = useState<FragebogenRow[]>([...sortedRows.textQuestions]);
//
//     const randomUUID = (): string => {
//         return typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now());
//     }
//
//     const deleteQuestion = function (id: string) {
//         for (let index = 0; index < gradeRows.length; index++) {
//             if (gradeRows[index].id == id) {
//                 setGradeRows(gradeRows.filter((_, i) => i !== index));
//                 return;
//             }
//         }
//         for (let index = 0; index < textRows.length; index++) {
//             if (textRows[index].id === id) {
//                 setTextRows(textRows.filter((_, i) => i !== index));
//                 return;
//             }
//         }
//     }
//
//     const NO_GRADE_SELECTED = 255; // große Zahl als default, damit später auffällt, wenn der Wert fälschlicherweise mitberechnet wird
//     studentNames = ["Selbsteinschätzung"].concat(studentNames);
//
//     const TextQuestionField = function ({
//                                             text: questionText,
//                                             questionId
//                                         }: {
//         text: string
//         questionId: string
//     }) {
//         return (
//             <>
//                 <div style={{marginTop: "1em"}}>
//                     {isEditView ? "Frage " + questionId : questionText}
//                 </div>
//                 <span style={{display: "flex"}}>
//                     <TextField
//                         fullWidth
//                         defaultValue={isEditView ? questionText : null}
//                         placeholder={isEditView ? "Frage eingeben..." : "Antwort eingeben..."}
//                         name={questionId + (isEditView ? "question" : "answer")}
//                     />
//                     {
//                         isEditView &&
//                         <IconButton
//                             onClick={() => deleteQuestion(questionId)}
//                         >
//                             <DeleteIcon/>
//                         </IconButton>
//                     }
//                 </span>
//             </>
//         )
//     }
//
//     const TextQuestions = function ({
//                                         questions
//                                     }: {
//         questions: FragebogenRow[]
//     }) {
//         let fields: JSX.Element[] = questions.map((q) =>
//             <TextQuestionField
//                 text={q.question}
//                 questionId={q.id}
//                 key={q.id}
//             />
//         );
//
//         return <>{fields}</>
//     }
//
//     let columns: GridColDef[] = [
//         {
//             field: 'question',
//             headerName: 'Frage',
//             width: 200,
//             disableColumnMenu: true,
//             disableReorder: true,
//             flex: 0.3,
//             editable: isEditView,
//             renderCell: (params) => {
//                 return <TextField
//                     fullWidth
//                     multiline
//                     defaultValue={params.row.question}
//                     name={params.row.id + "question"}
//                 />
//             }
//         }
//     ];
//     columns = columns.concat(studentNames.map((name, index) => ({
//         field: name,
//         headerName: name,
//         display: 'flex',
//         renderCell: (params) => {
//             if (params.row.type === 'grade')
//                 return <Select
//                     name={isEditView ? "" : (params.id + "answer" + index)}
//                     defaultValue={NO_GRADE_SELECTED}
//                     style={{flex: 1}}
//                 >
//                     <MenuItem value={NO_GRADE_SELECTED}
//                     >Note wählen</MenuItem>
//                     <MenuItem value={1}>1</MenuItem>
//                     <MenuItem value={2}>2</MenuItem>
//                     <MenuItem value={3}>3</MenuItem>
//                     <MenuItem value={4}>4</MenuItem>
//                     <MenuItem value={5}>5</MenuItem>
//                     <MenuItem value={6}>6</MenuItem>
//                 </Select>
//             return <>error</>;
//         },
//         flex: 1 / studentNames.length,
//         disableColumnMenu: true,
//         disableReorder: true
//     })))
//
//     const addGradeQuestion = function () {
//         setGradeRows(prev => [
//             ...prev,
//             {
//                 id: randomUUID(),
//                 question: "Neue Frage",
//                 type: 'grade'
//             }
//         ])
//     }
//
//     const addTextQuestion = function () {
//         setTextRows(prev => [
//             ...prev,
//             {
//                 id: randomUUID(),
//                 question: "Neue Frage",
//                 type: 'text'
//             }
//         ])
//     }
//
//     return <form
//         onSubmit={onSubmit}
//     >
//         {
//             isEditView &&
//             (subject == undefined)
//                 ? <span>Kein Fach oder Lernfeld zugewiesen</span>
//                 : <span>{subject}</span>
//         }
//         <DataGrid
//             rows={gradeRows}
//             columns={columns}
//             getRowHeight={() => "auto"}
//         />
//         {
//             isEditView &&
//             <div style={{width: "100%", display: "flex"}}>
//                 <IconButton
//                     onClick={addGradeQuestion}
//                     aria-label="Notenfrage Hinzufügen"
//                     style={{width: "100%"}}
//                 >
//                     <AddIcon/>
//                 </IconButton>
//             </div>
//         }
//         <TextQuestions
//             questions={textRows}
//         />
//         {
//             isEditView &&
//             <div style={{width: "100%", display: "flex"}}>
//                 <IconButton
//                     onClick={addTextQuestion}
//                     aria-label="Textfrage Hinzufügen"
//                     style={{width: "100%"}}
//                 >
//                     <AddIcon/>
//                 </IconButton>
//             </div>
//         }
//
//         <Button
//             type="submit"
//             variant="contained"
//             style={{marginTop: "1em"}}
//
//         >
//             {isEditView ? "Speichern" : "Abgeben"}
//         </Button>
//
//     </form>;
// }
//
//
// // function AddButton(){
// //     return <IconButton onClick={onAddClick} aria-label="add">
// //                 <AddIcon/>
// //             </IconButton>
// // }
//
// function SortQuestions(questions: FragebogenRow[]): SortedQuestions {
//     let returnObject: SortedQuestions = {
//         gradeQuestions: [],
//         textQuestions: []
//     }
//     for (let q of questions)
//         (q.type === 'grade' ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
//     return returnObject;
// }