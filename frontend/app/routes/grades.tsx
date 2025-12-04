import React, { useState, useEffect } from "react";
import API_CONFIG from "../apiConfig";
import Tooltip from "@mui/material/Tooltip";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridColumnGroupingModel
} from "@mui/x-data-grid";
import CustomizedSnackbars from '../components/snackbar';

/**
 * @author Michael Holl
 *
 * Displays grade overview
 * - Select course, project, and group
 * - Fetch and display grades in an editable DataGrid
 * - Supports resetting and saving grades
 * 
 * @Edited by Kebba Ceesay
 * Snackbar integration completed
 */

export interface GroupOption { id: string; name: string; }
export interface ProjectOption { id: string; name: string; groups: GroupOption[]; }
export interface GradeOverviewOption { id: string; name: string; projects: ProjectOption[]; }

export interface GradeOverview {
    subjects: Subject[];
    users: User[];
}

export interface Subject {
    id: string;
    name: string;
    shortName: string;
    performances: Performance[];
}

export interface Performance {
    id: string;
    name: string;
    shortName: string;
    weight: number;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    group: string;
    grades: Grade[];
}

export interface Grade {
    gradeId: string;
    performanceId: string;
    grade: number | null;
}

export interface UpdateGradeRequest {
    studentId: string;
    grades: Grade[];
}

export default function Grades() {
    const [gradeOverviewOptions, setGradeOverviewOptions] = useState<GradeOverviewOption[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<GradeOverviewOption | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
    const [gradeOverview, setGradeOverview] = useState<GradeOverview | null>(null);
    const [gradeOverviewBackup, setGradeOverviewBackup] = useState<GradeOverview | null>(null);
    const [renderGradeTable, setRenderGradeTable] = useState<boolean>(false);
    const [updatedGrades, setUpdatedGrades] = useState<UpdateGradeRequest[]>([]);
    const [projectError, setProjectError] = useState(false);
    const [courseError, setCourseError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    // Fetch dropdown options
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/findGradeOverviewOptions`, {
                  credentials: "include"
                });
                if (!res.ok) {
                    return
                }
                const data = await res.json();
                setGradeOverviewOptions(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchOptions();
    }, []);

    const saveGrades = async () => {
        if (updatedGrades.length <= 0)
            return;
        try {
            const url = `${API_CONFIG.BASE_URL}/api/grade/save`;
            
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updatedGrades),
            });

            if (!res.ok) {
                console.error("Fehler beim Speichern der Noten:", res.statusText);

                setSnackbarMessage("Fehler beim Speichern!");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
            console.log("Noten erfolgreich gespeichert!");
            setUpdatedGrades([]);

            setSnackbarMessage("Noten erfolgreich gespeichert!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);

        } catch (err) {
            console.error(err);
        }        
    };

    const reset = () => {
    if (!gradeOverviewBackup) {
        setSnackbarMessage("Zurücksetzen fehlgeschlagen!");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
    }
        setGradeOverview(gradeOverviewBackup)
        setSnackbarMessage("Änderungen wurden erfolgreich zurückgesetzt!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
    }

    const loadGrades = async () => {
        if (!selectedCourse) {
            setCourseError(true);
            setProjectError(true);
            return;
        }
        if (!selectedProject) {
            setProjectError(true);
            return;
        }
        try {
            const url =
                `${API_CONFIG.BASE_URL}/api/grade/overview?projectId=${selectedProject.id}` +
                (selectedGroup ? `&groupId=${selectedGroup.id}` : "");
            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                return
            }
            const data = await res.json();
            setGradeOverviewBackup(data);
            setGradeOverview(data);
            setRenderGradeTable(true);
        } catch (err) {
            console.error(err);
        }
    };

    // performance columns
    const performancesColumns: GridColDef[] =
        gradeOverview?.subjects.flatMap(subject => {
            if (subject.performances.length === 0) {
                return [{
                    field: `${subject.id}-empty`,
                    headerName: "Z",
                    flex: 1,
                    minWidth: 80,
                    editable: true
                }];
            }

            return subject.performances.map(perf => ({
                field: perf.id,
                headerName: perf.shortName + " ("+ perf.weight + "%)",
                renderHeader: (params) => (
                    <Tooltip title={
                        <div>
                            {"Name: " + perf.name}
                            <br />
                            {"Gewichtung: " + perf.weight}%
                        </div>}>
                        <span>{perf.shortName + " ("+ perf.weight + "%)"}</span>
                    </Tooltip>
                ),
                flex: 1,
                minWidth: 80,
                editable: true
            }));
        }) || [];

    // Base columns
    const columns: GridColDef[] = [
        { field: "nr", headerName: "Nr.", width: 80 },
        { field: "nachname", headerName: "Nachname", width: 150 },
        { field: "vorname", headerName: "Vorname", width: 150 },
        { field: "gruppe", headerName: "Gruppe", width: 120 },
        ...performancesColumns
    ];

    const columnGroupingModel: GridColumnGroupingModel = [
        {
            groupId: "bildungsbereich",
            headerName: "Bildungsbereich",
            children: [
                { field: "nr" },
                { field: "nachname" },
                { field: "vorname" },
                { field: "gruppe" },
            ]
        },

        ...(gradeOverview?.subjects.map(subject => ({
            groupId: subject.id,
            headerName: subject.shortName,
            description: "Name: " + subject.name,
            children:
                subject.performances.length > 0
                    ? subject.performances.map(perf => ({ field: perf.id }))
                    : [{ field: `${subject.id}-empty` }]
        })) || []),
    ];

    // Build rows
    const rows =
        gradeOverview?.users.map((u, index) => {
            const row: any = {
                id: u.id,
                nr: index + 1,
                nachname: u.lastName,
                vorname: u.firstName,
                gruppe: u.group
            };

            u.grades.forEach(grade => {
                row[grade.performanceId] = grade.grade;
            });
            return row;
        }) || [];

    return (
            <Box p={3} style={{ width: "100%" }}>
                <Box display="flex" gap={2} mb={2}>
                    <Autocomplete
                        options={gradeOverviewOptions}
                        getOptionLabel={(option) => option.name}
                        renderInput={(params) =>
                            <TextField {...params}
                                       label="Klasse"
                                       error={projectError}/>
                    }
                        onChange={(_, v) => setSelectedCourse(v)}
                        sx={{ minWidth: 200 }}
                    />
                    <Autocomplete
                        options={selectedCourse?.projects || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, v) => setSelectedProject(v)}
                        renderInput={(params) =>
                            <TextField {...params}
                                       label="Projekt"
                                       error={projectError}/>}
                        sx={{ minWidth: 200 }}
                        disabled={selectedCourse == null}
                    />
                    <Autocomplete
                        options={selectedProject?.groups || []}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, v) => setSelectedGroup(v)}
                        renderInput={(params) => <TextField {...params} label="Gruppe" />}
                        sx={{ minWidth: 200 }}
                        disabled={selectedProject == null}
                    />
                    <Button variant="contained" onClick={loadGrades}>
                        Anzeigen
                    </Button>
                </Box>
                {renderGradeTable &&
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnGroupingModel={columnGroupingModel}
                        disableRowSelectionOnClick
                        processRowUpdate={(updatedRow) => {
                            if (!gradeOverview) return updatedRow;

                            // update gradeOverview
                            const newGradeOverview = {
                                ...gradeOverview,
                                users: gradeOverview.users.map((user) => {
                                    if (user.id !== updatedRow.id) return user;

                                    const newGrades = user.grades.map((grade) => {
                                        const newValue = updatedRow[grade.performanceId];

                                        if (newValue === undefined || newValue === null) return grade;

                                        return {
                                            ...grade,
                                            grade: newValue === "" ? null : Number(newValue),
                                        };
                                    });

                                    return { ...user, grades: newGrades };
                                }),
                            };

                            setGradeOverview(newGradeOverview);

                            const changedUser = newGradeOverview.users.find(u => u.id === updatedRow.id);
                            if (!changedUser) return updatedRow;

                            // collect all grades of changedUser
                            const gradeEntries = changedUser.grades.map(g => ({
                                gradeId: g.gradeId,
                                performanceId: g.performanceId,
                                grade: g.grade,
                            }));

                            // add gradeEntries in updatedGrade, filter array before
                            setUpdatedGrades((prev) => {
                                const filtered = prev.filter(u => u.studentId !== changedUser.id);
                                return [
                                    ...filtered,
                                    {
                                        studentId: changedUser.id,
                                        grades: gradeEntries,
                                    }
                                ];
                            });

                            return updatedRow;
                        }}
                        sx={{
                            width: "100%",
                            maxHeight: 500,
                            "& .MuiDataGrid-virtualScroller": { overflowX: "auto", overflowY: "auto" },
                            "& .MuiDataGrid-cell": { display: "flex", justifyContent: "center", alignItems: "center" },
                            "& .MuiDataGrid-columnHeader .MuiDataGrid-columnHeaderTitleContainer": { justifyContent: "center" },
                            "& .MuiDataGrid-columnHeaderGroup .MuiDataGrid-columnHeaderTitleContainer": { justifyContent: "center" },
                        }}
                    />
                }
                <Box display="flex" gap={2} py={2}>
                    <Button variant="contained" onClick={saveGrades}>
                        Speichern
                    </Button>
                    <Button variant="contained" onClick={reset}>
                        Zurücksetzen
                    </Button>
                </Box>
                <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
                />
            </Box>
    );
}
