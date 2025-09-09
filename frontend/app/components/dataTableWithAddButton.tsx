import * as React from "react";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import {deDE} from "@mui/x-data-grid/locales";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Stack, IconButton} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

export interface DataRow {
    id: string | number;
    [key: string]: any;
}

export interface Column {
    key: string;
    label: string;
}

interface DataGridWithAddProps {
    columns: Column[];
    rows: DataRow[];
    onAddClick: () => void;
    onEditClick: (row: DataRow) => void;
    onDeleteClick: (id: number) => void;
}

export default function DataGridWithAdd({
                                            columns,
                                            rows,
                                            onAddClick,
                                            onEditClick,
                                            onDeleteClick,
                                        }: DataGridWithAddProps) {
    const actionCol: GridColDef<DataRow> = {
        field: "actions",
        headerName: "Aktionen",
        flex: 0.8,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<DataRow, unknown>) => (
            <Stack direction="row" spacing={1} sx={{height: "100%", alignItems: "center"}}>
                <IconButton size="small" onClick={() => onEditClick(params.row)} color="primary">
                    <EditIcon/>
                </IconButton>
                <IconButton
                    size="small"
                    onClick={() => onDeleteClick(params.row.id as number)}
                    color="error"
                >
                    <DeleteIcon/>
                </IconButton>
            </Stack>
        ),
    };

    const gridColumns: GridColDef<DataRow>[] = [
        ...columns.map<GridColDef<DataRow>>((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            sortable: true,
            filterable: true,
            renderCell: (params: GridRenderCellParams<DataRow>) => {
                const v = params.value as unknown;
                if (Array.isArray(v)) {
                    return v.map((s: any) => s?.name ?? String(s)).join(", ");
                }
                return String(v ?? "");
            },
        })),
        actionCol,
    ];

    const theme = createTheme(
        {
            palette: {primary: {main: "#1976d2"}},
        },
        deDE
    );

    return (
        <ThemeProvider theme={theme}>
            <div style={{width: "100%"}}>
                <Stack direction="row" justifyContent="flex-end" sx={{mb: 1}}>
                    <IconButton onClick={onAddClick} aria-label="add">
                        <AddIcon/>
                    </IconButton>
                </Stack>
                <DataGrid
                    rows={rows}
                    columns={gridColumns}
                    pagination
                    disableRowSelectionOnClick
                    autoHeight
                    localeText={deDE.components.MuiDataGrid.defaultProps?.localeText}
                />
            </div>
        </ThemeProvider>
    );
}
