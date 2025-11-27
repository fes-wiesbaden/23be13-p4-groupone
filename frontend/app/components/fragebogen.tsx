/**
 * @author: Naoh Bach
 * Component that returns a form of a "Fragebogen" for students to fill out
 *
 **/

import React, { type JSX } from "react";
import {
    DataGrid,
    type GridColDef
} from "@mui/x-data-grid";
import { Button, FormControl, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";

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
  studentNames
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  rows: FragebogenRow[];
  studentNames: string[];
}) {
    const sortedRows: SortedQuestions = SortQuestions(rowData)
    const noGradeSelectedDefaultValue = 255; // große Zahl als default, damit später auffällt, wenn der Wert fälschlicherweise mitberechnet wird
    studentNames = ["Selbsteinschätzung"].concat(studentNames);
    let columns: GridColDef[] = [
        {
            field: 'question',
            headerName: 'Frage',
            width: 200,
            disableColumnMenu: true,
            disableReorder: true,
            flex: 0.5
        }
    ];
    columns = columns.concat(studentNames.map((name, index) => ({
        field: name,
        headerName: name,
        display: 'flex',
        renderCell: (params) => {
            switch (params.row.type){
                case 'text':
                    return <>this shouldn't be here</>
                case 'grade':
                    return <FormControl style={{flex: 1}}>
                        <Select
                            name={params.id + "answer" + index}
                            defaultValue={noGradeSelectedDefaultValue}
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
                    </FormControl>
                default:
                    return <>default</>
            }
        },
        flex: 1 / studentNames.length,
        disableColumnMenu: true,
        disableReorder: true
    })))
    return <form
        onSubmit={onSubmit}
    >
        <DataGrid
            rows={sortedRows.gradeQuestions}
            columns={columns}
            getRowHeight={() => "auto"}
        />
        <TextQuestions
            questions={sortedRows.textQuestions}
        />

    </form>;
}

function TextQuestions({
    questions
}: {
    questions: FragebogenRow[]
}){
    let fields: JSX.Element[] = questions.map((q) => 
        <TextQuestionField
            text={q.question}
            questionId={q.id}
        />
    );

    return <>{fields}</>
}

function TextQuestionField({
    text: questionText,
    questionId
}: {
    text: string
    questionId: string
}){
    return <>
        <div style={{marginTop: "1em"}}>
            {questionText}
        </div>
        <TextField 
            fullWidth
            placeholder="Antwort eingeben..."
            name={questionId + "answer"}
        />
    </>
}

function SortQuestions(questions: FragebogenRow[]): SortedQuestions{
    let returnObject: SortedQuestions = {
        gradeQuestions: [],
        textQuestions: []
    }
    for (let q of questions)
        (q.type == 'grade' ? returnObject.gradeQuestions.push(q) : returnObject.textQuestions.push(q));
    return returnObject;
}