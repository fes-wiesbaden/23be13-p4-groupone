import React, { type JSX } from "react";
import {
    DataGrid,
    type GridColDef
} from "@mui/x-data-grid";
import { Button, FormControl, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";

export interface FragebogenRow {
    id: number;
    question: string;
    type: 'text' | 'grade';
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
    rowData = SortQuestions(rowData);
    studentNames = ["Du"].concat(studentNames);
    const columns: GridColDef[] = [
        {field: 'question', headerName: 'Frage', flex: 1},
        {
            field: 'type',
            renderCell: (params) => {
                console.log(params);
                switch (params.value) {
                    case 'text':
                        return <TextField
                            fullWidth
                            name={params.id + "answer"}
                            label="Antwort"
                            type="text"
                        />;
                    case 'grade':
                        return <GradeAnswerOptions
                            amount={studentNames.length}
                            questionId={params.id as number}
                        />;
                    default:
                        return null;
                }
            },
            renderHeader: () => {
                var spans = studentNames.map((name) =>
                    <span style={{flexGrow: 1}}>
                        {name}
                    </span>
                );
                return <>{spans}</>;
            },
            flex: 2
        }
    ];
    return <form
        onSubmit={onSubmit}
    >
        <DataGrid
            rows={rowData}
            columns={columns}
            sx={{
                '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                    width: "100%"
                }
            }}
        ></DataGrid>
    </form>;
}

function GradeAnswerOptions({
    amount,
    questionId
}: {
    amount: number,
    questionId: number
}){
    var formControls: JSX.Element[] = [];
    for (var index = 0; index < amount; index++)
        formControls.push(
            <FormControl style={{flex: 1}}>
                <Select
                    name={questionId + "answer" + index}
                    defaultValue={255}
                >
                    <MenuItem value={255} // große Zahl als default, damit später auffällt, wenn der Wert fälschlicherweise mitberechnet wird
                    >Note wählen</MenuItem>
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                    <MenuItem value={4}>4</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={6}>6</MenuItem>
                </Select>
            </FormControl>
        );
    return <div style={{display: "flex"}}>{formControls}</div>;
}

function SortQuestions(questions: FragebogenRow[]): FragebogenRow[] {
    var returnQuestions: FragebogenRow[] = [];
    var textQuestions: FragebogenRow[] = [];
    for (var i = 0; i < questions.length; i++)
        (questions[i].type == 'grade') ? returnQuestions.push(questions[i]) : textQuestions.push(questions[i]);
    return returnQuestions.concat(textQuestions);

}