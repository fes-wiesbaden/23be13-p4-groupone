import * as React from "react";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import {deDE} from "@mui/x-data-grid/locales";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {Stack, IconButton, Tooltip, Button, Paper} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

/**
 * @author: Michael Holl
 * <p>
 *   Component to add, edit & delete entities
 *   edited by Daniel Hess
 * </p>
 *
 **/

export interface DataRow {
    id: string;
    [key: string]: unknown;
}

export interface Column {
    key: string;
    label: string;
}

interface DataGridWithAddProps<TRow extends DataRow = DataRow> {
    columns: Column[];
    rows: TRow[];
    onAddClick: () => void;
    onEditClick: (row: TRow) => void | Promise<void>;
    onDeleteClick: (id: TRow["id"]) => void | Promise<void>;
    onRowClick?: (id: TRow) => void | Promise<void>;
    isDisabled?: boolean
}

export default function DataGridWithAdd<TRow extends DataRow>({
                                            columns,
                                            rows,
                                            onAddClick,
                                            onEditClick,
                                            onDeleteClick,
                                            onRowClick,
                                            isDisabled
                                        }: DataGridWithAddProps<TRow>) {
    const actionCol: GridColDef<TRow> = {
        field: "actions",
        headerName: "Aktionen",
        flex: 0.8,
        sortable: false,
        filterable: false,
        renderCell: (params: GridRenderCellParams<TRow, unknown>) => (
            <Stack direction="row" spacing={1} sx={{height: "100%", alignItems: "center"}}>
                <Tooltip title={<span style={{ fontSize: "1rem" }}>Bearbeiten</span>}>
                    <IconButton
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            onEditClick(params.row)
                        }}
                        color="primary"
                        disabled={isDisabled}
                    >
                        <EditIcon/>
                    </IconButton>
                </Tooltip>
                <Tooltip title={<span style={{ fontSize: "1rem" }}>Löschen</span>}>
                    <IconButton
                        size="small"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDeleteClick(params.row.id)
                        }}
                        color="error"
                        disabled={isDisabled}
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            </Stack>
        ),
    };

    const gridColumns: GridColDef<TRow>[] = [
        ...columns.map<GridColDef<TRow>>((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            sortable: true,
            filterable: true,
            renderCell: (params: GridRenderCellParams<TRow>) => {
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
            <Paper elevation={3} sx={{ p: 2, width: "100%" }}>
                <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1} mb={2}>
                    <Button
                        onClick={onAddClick}
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        size="small"
                        disabled={isDisabled}
                    >
                        Hinzufügen
                    </Button>
                </Stack>

                <DataGrid
                    rows={rows}
                    columns={gridColumns}
                    pagination
                    disableRowSelectionOnClick
                    autoHeight
                    localeText={deDE.components.MuiDataGrid.defaultProps?.localeText}
                    onRowClick={(params) => onRowClick?.(params.row)}
                />
            </Paper>
        </ThemeProvider>
    );
}
