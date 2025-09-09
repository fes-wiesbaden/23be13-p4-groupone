import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { deDE } from "@mui/x-data-grid/locales";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Stack, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

/**
 * @author: Michael Holl
 * <p>
 *   Component to add, edit & delete entity in table
 * </p>
 *
 **/
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
    const actions = [
        {
            field: "actions",
            headerName: "Aktionen",
            flex: 0.8,
            sortable: false,
            renderCell: ({ row }) => (
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ height: "100%", alignItems: "center" }}
                >
                    <IconButton size="small" onClick={() => onEditClick(row)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDeleteClick(row.id)} color="error">
                        <DeleteIcon />
                    </IconButton>
                </Stack>
            ),
        },
    ];

    const gridColumns = [
        ...columns.map((col) => ({
            field: col.key,
            headerName: col.label,
            flex: 1,
            sortable: true,
            filterable: true,
            renderCell: (params) => {
                if (Array.isArray(params.value)) {
                    return params.value.map((s) => s.name).join(", ");
                }
                return params.value;
            },
        })),
        ...actions,
    ];

    const theme = createTheme(
        {
            palette: {
                primary: { main: "#1976d2" },
            },
        },
        deDE
    );

    return (
        <ThemeProvider theme={theme}>
            <div style={{ height: 600, width: "100%" }}>
                <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                    <IconButton onClick={onAddClick} aria-label="add">
                        <AddIcon />
                    </IconButton>
                </Stack>
                <DataGrid
                    rows={rows}
                    columns={gridColumns}
                    pagination
                    disableSelectionOnClick
                    autoHeight
                />
            </div>
        </ThemeProvider>
    );
}