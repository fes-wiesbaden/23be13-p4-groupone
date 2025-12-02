/**
 * @author: Naoh Bach
 * Component that returns a form of a "Fragebogen" for students to fill out
 *
 **/

// TODO: popup / dialog "bist du sicher?" wenn nicht alle fragen beantwortet

import React, { type JSX } from "react";
import {
    DataGrid,
    type GridColDef
} from "@mui/x-data-grid";
import { Button, FormControl, IconButton, MenuItem, Select, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

export interface FragebogenRow {
    id: string;
    question: string;
    type: 'text' | 'grade';
}

interface SortedQuestions {
    gradeQuestions: FragebogenRow[];
    textQuestions: FragebogenRow[];
}

export default function FragebogenTable({
  onSubmit,
  rows: rowData,
  studentNames,
  editView: isEditView,
  subject
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  rows: FragebogenRow[];
  studentNames: string[];
  editView?: boolean;
  subject?: string
}) {
    
    const sortedRows: SortedQuestions = SortQuestions(rowData)

    const [gradeRows, setGradeRows] = useState<FragebogenRow[]>([...sortedRows.gradeQuestions]);
    const [textRows, setTextRows] = useState<FragebogenRow[]>([...sortedRows.textQuestions]);

    const [newQuestions, setNewQuestions] = useState(0);

    const deleteQuestion = function(id: string){
        for (let index = 0; index < gradeRows.length; index++){
            if (gradeRows[index].id == id){
                console.log(gradeRows[index].id + " == " + id)
                setGradeRows(gradeRows.splice(index, 1));
                return;
            }
        }
        for (let index = 0; index < textRows.length; index++){
            if (textRows[index].id == id){
                console.log(textRows[index].id + " == " + id)
                setTextRows(textRows.splice(index, 1));
                return;
            }
        }
    }

    const noGradeSelectedDefaultValue = 255; // große Zahl als default, damit später auffällt, wenn der Wert fälschlicherweise mitberechnet wird
    studentNames = ["Selbsteinschätzung"].concat(studentNames);

    const TextQuestionField = function({
        text: questionText,
        questionId
    }: {
        text: string
        questionId: string
    }){
        return <>
            {
                <>
                    <div style={{marginTop: "1em"}}>
                        {isEditView ? "Frage " + questionId : questionText}
                    </div>
                    <span style={{display:"flex"}}>
                        <TextField 
                            fullWidth
                            defaultValue={isEditView ? questionText : null}
                            placeholder={isEditView ? "Frage eingeben..." : "Antwort eingeben..."}
                            name={questionId + (isEditView ? "question" : "answer")}
                        />
                        {
                            isEditView &&
                            <IconButton
                                onClick={() => deleteQuestion(questionId)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        }
                    </span>
                </>
            }
        </>
    }

    const TextQuestions = function({
        questions
    }: {
        questions: FragebogenRow[]
    }){
        let fields: JSX.Element[] = questions.map((q) => 
            <TextQuestionField
                text={q.question}
                questionId={q.id}
                key={q.id}
            />
        );

        return <>{fields}</>
    }

    let columns: GridColDef[] = [
        {
            field: 'question',
            headerName: 'Frage',
            width: 200,
            disableColumnMenu: true,
            disableReorder: true,
            flex: 0.3,
            editable: isEditView,
            renderCell: (params) => {
                return <TextField
                    fullWidth
                    multiline
                    defaultValue={params.row.question}
                    name={params.row.id + "question"}
                />
            }
        }
    ];
    columns = columns.concat(studentNames.map((name, index) => ({
        field: name,
        headerName: name,
        display: 'flex',
        renderCell: (params) => {
            if (params.row.type == 'grade')
                return <Select
                    name={isEditView ? "" : (params.id + "answer" + index)}
                    defaultValue={noGradeSelectedDefaultValue}
                    style={{flex: 1}}
                >
                    <MenuItem value={noGradeSelectedDefaultValue}
                    >Note wählen</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                </Select>
            return <>error</>;
        },
        flex: 1 / studentNames.length,
        disableColumnMenu: true,
        disableReorder: true
    })))

    const addGradeQuestion = function(params:any) {
        setGradeRows(prev =>[
            ...prev,
            {
                id: newQuestions + "new",
                question: "Neue Frage",
                type: 'grade'
            }
        ])
        setNewQuestions(prev=>prev+1)
    }
    
    const addTextQuestion = function(params:any) {
        setTextRows(prev =>[
            ...prev,
            {
                id: newQuestions + "new",
                question: "Neue Frage",
                type: 'text'
            }
        ])
        setNewQuestions(prev=>prev+1)
    }

    return <form
        onSubmit={onSubmit}
    >
        {
            isEditView &&
            (subject == undefined)
                ? <span>Kein Fach oder Lernfeld zugewiesen</span>
                : <span>{subject}</span>
        }
        <DataGrid
            rows={gradeRows}
            columns={columns}
            getRowHeight={() => "auto"}
        />
        {
            isEditView &&
            <div style={{width: "100%", display: "flex"}}>
                <IconButton
                    onClick={addGradeQuestion}
                    aria-label="Textfrage Hinzufügen"
                    style={{width: "100%"}}
                >
                    <AddIcon/>
                </IconButton>
            </div>
        }
        <TextQuestions
            questions={textRows}
        />
        {
            isEditView &&
            <div style={{width: "100%", display: "flex"}}>
                <IconButton
                    onClick={addTextQuestion}
                    aria-label="Textfrage Hinzufügen"
                    style={{width: "100%"}}
                >
                    <AddIcon/>
                </IconButton>
            </div>
        }

        <Button 
            type="submit"
            variant="contained"
            style={{marginTop: "1em"}}
            
        >
            {isEditView ? "Speichern" : "Abgeben"}
        </Button>

    </form>;
}





// function AddButton(){
//     return <IconButton onClick={onAddClick} aria-label="add">
//                 <AddIcon/>
//             </IconButton>
// }

function SortQuestions(questions: FragebogenRow[]): SortedQuestions{
    let returnObject: SortedQuestions = {
        gradeQuestions: [],
        textQuestions: []
    }
    for (let q of questions)
        (q.type == 'grade' ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
    return returnObject;
}