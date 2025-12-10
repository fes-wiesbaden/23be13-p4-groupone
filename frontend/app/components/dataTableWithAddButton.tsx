import * as React from "react";
import {
    DataGrid,
    type GridColDef,
    type GridRenderCellParams,
} from "@mui/x-data-grid";
import {deDE} from "@mui/x-data-grid/locales";
import {Stack, IconButton, Tooltip, Button, Paper, Typography} from "@mui/material";
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
    isDisabled?: boolean;
    title?: string;
    addButtonLabel?: string;
}

export default function DataGridWithAdd<TRow extends DataRow>({
                                            columns,
                                            rows,
                                            onAddClick,
                                            onEditClick,
                                            onDeleteClick,
                                            onRowClick,
                                            isDisabled,
                                            title,
                                            addButtonLabel = "Hinzufügen"
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

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                width: "100%",
                borderRadius: 3,
                background: 'background.paper',
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                mb={3}
            >
                {title && (
                    <Typography variant="h5" fontWeight={600}>
                        {title}
                    </Typography>
                )}
                <Button
                    onClick={onAddClick}
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    disabled={isDisabled}
                    sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                        '&:hover': {
                            boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
                        },
                        marginLeft: title ? 0 : 'auto',
                    }}
                >
                    {addButtonLabel}
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
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-main': {
                        borderRadius: 2,
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: 'action.hover',
                        borderRadius: '8px 8px 0 0',
                        borderBottom: 'none',
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 600,
                    },
                    '& .MuiDataGrid-cell': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    },
                    '& .MuiDataGrid-row': {
                        '&:hover': {
                            backgroundColor: 'action.hover',
                            cursor: onRowClick ? 'pointer' : 'default',
                        },
                        '&:last-child .MuiDataGrid-cell': {
                            borderBottom: 'none',
                        },
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid',
                        borderColor: 'divider',
                        backgroundColor: 'action.hover',
                        borderRadius: '0 0 8px 8px',
                    },
                }}
            />
        </Paper>
    );
}