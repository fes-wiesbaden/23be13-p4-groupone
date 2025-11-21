import React from "react";
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
    // TODO: sortieren, dass Textfragen zum Schluss
const mockRowData: Row[] = [
    {id: 1, question: "do your teammates wear wigs?", type: 'grade'},
    {id: 2, question: "will your teammates wear wigs?", type: 'grade'},
    {id: 3, question: "when will they wear wigs?", type: 'text'},
];

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
                            id={params.id + "answer"}
                            label="Antwort"
                            type="text"
                        />;
                    case 'grade':
                        return <GradeAnswerOptions
                            names={studentNames}
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

function GradeAnswerOptions({ // TODO: statt string array eine anzahl
    names,
    questionId
}: {
    names: string[],
    questionId: number
}){
    const spans = names.map((name, index) => ( // TODO: eine zeile am anfang immer wo nur "Du" steht
        <FormControl style={{flex: 1}}>
            <Select
                id={questionId + "answer" + index}
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
    ));
    return <div style={{display: "flex"}}>{spans}</div>;
}