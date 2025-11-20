import React from "react";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import { Button, FormControl, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
// import DataTableWithAdd, {
//   type DataRow,
// } from "../components/dataTableWithAddButton";


interface Row {
    id: number;
    question: string;
    type: 'text' | 'grade';
}

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
                    var Names: string[] = ["Jimbo James", "Big Badinky Bones", "The Cartel"];
                    return <GradeAnswerOptions
                        names={Names}
                        questionId={params.id as number}
                    />;
                default:
                    return null;
            }
        },
        renderHeader: (params) => {
            var Names: string[] = ["Jimbo James", "Big Badinky Bones", "The Cartel"];
            var spans = Names.map((name) =>
                <span style={{flexGrow: 1}}>
                    {name}
                </span>
            );
            return <>{spans}</>;
        },
        flex: 2
    }
]

export default function FragebogenTable({
  onSubmit,
}: {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
    return <form
        onSubmit={onSubmit}
    >
        <DataGrid
            rows={mockRowData}
            columns={columns}
            sx={{
                '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                    width: "100%"
                }
            }}
        ></DataGrid>
    </form>;
}

export function GradeAnswerOptions({
    names,
    questionId
}: {
    names: string[],
    questionId: number
}){
    const spans = names.map((name, index) => (
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