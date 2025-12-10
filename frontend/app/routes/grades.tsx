import React, { useEffect, useState } from "react";
import API_CONFIG from "../apiConfig";
import Tooltip from "@mui/material/Tooltip";
import { Autocomplete, Box, Button, FormControlLabel, Paper, Stack, Switch, TextField } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { DataGrid, type GridColDef, type GridColumnGroupingModel } from "@mui/x-data-grid";
import { Role } from "~/types/models";
import FormDialog from "~/components/addColumn";
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
export interface GradeOverview { subjects: Subject[]; users: User[]; }
export interface Subject { id: string; name: string; shortName: string; duration: number; isLearningField: boolean; performances: Performance[]; }
export interface Performance { id: string; name: string; shortName: string; weight: number; }
export interface User { id: string; firstName: string; lastName: string; group: string; grades: Grade[]; }
export interface Grade { performanceId?: string; projectSubjectId?: string; grade?: number | null; }
export interface UpdateGradeRequest { studentId: string; grades: Grade[]; }
export interface CalculateSubjectGrade { grade?: number; weight: number; }

export default function Grades() {
    const { user } = useAuth();

    const [gradeOverviewOptions, setGradeOverviewOptions] = useState<GradeOverviewOption[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<GradeOverviewOption | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<GroupOption | null>(null);
    const [gradeOverview, setGradeOverview] = useState<GradeOverview | null>(null);
    const [renderGradeTable, setRenderGradeTable] = useState(false);
    const [showPerformances, setShowPerformances] = useState(true);
    const [showGrades, setShowGrades] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [updatedGrades, setUpdatedGrades] = useState<UpdateGradeRequest[]>([]);
    const [performancesColumns, setPerformancesColumns] = useState<GridColDef[]>([]);
    const [projectError, setProjectError] = useState(false);
    const [courseError, setCourseError] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const isStudent = user?.role === Role.STUDENT;

    const isAdmin = user?.role === Role.ADMIN;


    const filterUser = (overview: GradeOverview, userId: string) => ({
        ...overview,
        users: overview.users.filter(u => u.id === userId)
    });

    const fetchOptions = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/findGradeOverviewOptions?userId=${user?.id}`, { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            setGradeOverviewOptions(data);
            setSelectedCourse(data[0] ?? null);
        } catch (err) { console.error(err); }
    };

    const calculateSubjectGrade = async (grades: CalculateSubjectGrade[]) => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/grade/calculateSubjectGrade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(grades),
            });
            if (!res.ok) throw new Error(res.statusText);
            return await res.json();
        } catch (err) {
            setSnackbarMessage("Fehler beim Berechnen der Zeugnisnote");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const calculateGradeSuggestions = async (overview: GradeOverview) => {
        const newUsers = await Promise.all(
            overview.users.map(async user => {
                const grades = [...user.grades];
                for (const subject of overview.subjects) {
                    if (!subject.performances.length) continue;

                    const perfGrades: CalculateSubjectGrade[] = subject.performances.map(perf => ({
                        grade: grades.find(g => g.performanceId === perf.id)?.grade ?? undefined,
                        weight: perf.weight
                    }));

                    if (perfGrades.some(g => g.grade === undefined)) continue;

                    const zv = await calculateSubjectGrade(perfGrades);
                    const zvEntry = grades.find(g => g.projectSubjectId === subject.id && g.performanceId === "ZV");
                    if (zvEntry) zvEntry.grade = zv;
                    else grades.push({ projectSubjectId: subject.id, performanceId: "ZV", grade: zv });
                }
                return { ...user, grades };
            })
        );
        setGradeOverview({ ...overview, users: newUsers });
    };

    useEffect(() => {
        if (isStudent) setShowPerformances(false);
        fetchOptions();
    }, [user?.id, isStudent]);

    useEffect(() => {
        if (!gradeOverview) {
            setPerformancesColumns([]);
            return;
        }

        const cols = gradeOverview.subjects.flatMap(subject => {
            // Z columns
            const subjectGradeFinalHeader: GridColDef = {
                field: `${subject.id}-Z`,
                headerName: "Z",
                renderHeader: () => (
                    <Tooltip title="Zeugnisnote">
                        <span>Z</span>
                    </Tooltip>
                ),
                type: "singleSelect",
                valueOptions: ["1", "2", "3", "4", "5", "6"],
                flex: 1,
                minWidth: 80,
                editable: !isStudent,
            };

            if (!showPerformances) {
                return [subjectGradeFinalHeader];
            }

            const performanceGradeHeader: GridColDef[] =
                subject.performances.map(perf => ({
                    field: perf.id,
                    headerName: `${perf.shortName} (${perf.weight}%)`,
                    renderHeader: () => (
                        <Tooltip
                            title={
                                <div>
                                    Name: {perf.name}
                                    <br/>
                                    Gewichtung: {perf.weight}%
                                </div>
                            }
                        >
                            <span>{`${perf.shortName} (${perf.weight}%)`}</span>
                        </Tooltip>
                    ),
                    type: "singleSelect",
                    valueOptions: ["1", "2", "3", "4", "5", "6"],
                    flex: 1,
                    minWidth: 80,
                    editable: !isStudent,
                }));

            const subjectGradeDraftHeader: GridColDef | null =
                subject.performances.length > 0
                    ? {
                        field: `${subject.id}-ZV`,
                        headerName: "ZV",
                        renderHeader: () => (
                            <Tooltip title="Zeugnisvorschlag">
                                <span>ZV</span>
                            </Tooltip>
                        ),
                        type: "singleSelect",
                        valueOptions: ["1", "2", "3", "4", "5", "6"],
                        flex: 1,
                        minWidth: 80,
                        editable: false,
                    }
                    : null;

            return [
                ...performanceGradeHeader,
                ...subjectGradeDraftHeader ? [subjectGradeDraftHeader] : [],
                subjectGradeFinalHeader
            ];
        });

        setPerformancesColumns(cols);

    }, [gradeOverview, showPerformances, showGrades]);

    const loadGrades = async (showSnackbar: boolean) => {
        if (!selectedCourse && !isStudent) {
            setCourseError(true);
            setProjectError(true);
            setSnackbarMessage("Laden der Notenübersicht fehlgeschlagen. Bitte wählen Sie eine Klasse aus");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }
        if (!selectedProject) {
            setProjectError(true);
            setSnackbarMessage("Laden der Notenübersicht fehlgeschlagen. Bitte wählen Sie ein Projekt aus");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            const url = `${API_CONFIG.BASE_URL}/api/grade/overview?projectId=${selectedProject.id}${selectedGroup ? `&groupId=${selectedGroup.id}` : ""}&userId=${user?.id}`;
            const res = await fetch(url, { credentials: "include" });
            if (!res.ok) return;
            let data: GradeOverview = await res.json();

            if (isStudent && user) data = filterUser(data, user.id);


            setGradeOverview(data);
            await calculateGradeSuggestions(data);
            setRenderGradeTable(true);
            if (showSnackbar) {
                setSnackbarMessage("Notenübersicht erfolgreich geladen");
                setSnackbarSeverity("success");
                setSnackbarOpen(true);
            }
        } catch (err) {
            setSnackbarMessage("Laden der Notenübersicht gescheitert");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const saveGrades = async () => {
        if (!updatedGrades.length) return;
        try {
            const payload = updatedGrades.map(u => ({
                studentId: u.studentId,
                grades: u.grades.filter(g => g.performanceId !== "ZV")
            }));
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/grade/save`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                console.error("Fehler beim Speichern der Noten:", res.statusText);

                setSnackbarMessage(`Fehler beim Speichern! Code: ${res.status}`);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
            setUpdatedGrades([]);
            setSnackbarMessage("Noten erfolgreich gespeichert!");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } catch (err) { console.error(err); }
    };

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
            children: [{ field: "nr" }, { field: "nachname" }, { field: "vorname" }, { field: "gruppe" }],
        },
        ...(gradeOverview?.subjects.map(subject => ({
            groupId: subject.id,
            headerName: `${subject.name.length < 15 ? subject.name : subject.shortName} (${subject.duration})`,
            description: `Name: ${subject.name}`,
            children: [
                ...(subject.performances.length ? subject.performances.map(p => ({ field: p.id })) : [{ field: `${subject.id}-empty` }]),
                { field: `${subject.id}-ZV` },
                { field: `${subject.id}-Z` }
            ]
        })) || [])
    ];

    const rows = gradeOverview?.users.map((u, i) => {
        const row: any = { id: u.id, nr: i + 1, nachname: u.lastName, vorname: u.firstName, gruppe: u.group };

        if (showGrades) {
            u.grades.forEach(g => {
                if (g.performanceId === "ZV") row[`${g.projectSubjectId}-ZV`] = g.grade;
                else if (!g.performanceId && g.projectSubjectId) row[`${g.projectSubjectId}-Z`] = g.grade;
                else if (g.performanceId) row[g.performanceId] = g.grade;
            });
        }

        return row;
    }) || [];

    return (
        <Box p={3} width="100%">
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    {!isStudent && (
                        <Autocomplete
                            options={gradeOverviewOptions}
                            getOptionLabel={o => o.name}
                            renderInput={params => (
                                <TextField {...params} label="Klasse" error={projectError} />
                            )}
                            onChange={(_, v) => setSelectedCourse(v)}
                            sx={{ minWidth: 200, flex: 1 }}
                        />
                    )}

                    <Autocomplete
                        options={selectedCourse?.projects && selectedCourse.projects.length > 0
                            ? selectedCourse.projects
                            : [{ id: "none", name: "Keine Projekte vorhanden", groups: [] }]}
                        getOptionLabel={o => o.name}
                        getOptionDisabled={o => o.id === "none"}
                        renderInput={params => <TextField {...params} label="Projekt" error={projectError} />}
                        onChange={(_, v) => setSelectedProject(v?.id === "none" ? null : v)}
                        disabled={!selectedCourse && !isStudent}
                        sx={{ minWidth: 200, flex: 1 }}
                    />

                    {!isStudent && (
                        <Autocomplete
                            options={selectedProject?.groups || []}
                            getOptionLabel={o => o.name}
                            renderInput={params => <TextField {...params} label="Gruppe" />}
                            onChange={(_, v) => setSelectedGroup(v)}
                            disabled={!selectedProject}
                            sx={{ minWidth: 200, flex: 1 }}
                        />
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => loadGrades(true)}
                        sx={{ height: 56 }}
                    >
                        Anzeigen
                    </Button>
                </Stack>
            </Paper>

            {renderGradeTable && (
                <Paper elevation={2} sx={{ p: 2 }}>
                    {!isStudent && (
                        <Stack direction="row" justifyContent="space-between" mb={2} alignItems="center">
                            {isAdmin &&
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setDialogOpen(true)}
                                >
                                    Tabelle anpassen
                                </Button>
                            }
                            <Stack direction="row" spacing={4}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="Noten anzeigen"
                                    onChange={(_, checked) => setShowGrades(checked)}
                                />
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="Leistungen anzeigen"
                                    onChange={(_, checked) => setShowPerformances(checked)}
                                />
                            </Stack>
                        </Stack>
                    )}

                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnGroupingModel={columnGroupingModel}
                        disableRowSelectionOnClick
                        processRowUpdate={async updatedRow => {
                            if (!gradeOverview) return updatedRow;

                            const userToUpdate = gradeOverview.users.find(u => u.id === updatedRow.id);
                            if (!userToUpdate) return updatedRow;

                            const grades = [...(userToUpdate.grades ?? [])];

                            Object.keys(updatedRow).forEach(key => {
                                if (["id","nr","nachname","vorname","gruppe"].includes(key)) return;
                                if (typeof updatedRow[key] !== "string") return;

                                const isSubjectGrade = key.endsWith("-Z");
                                const perfId = isSubjectGrade ? undefined : key;
                                const subjId = isSubjectGrade ? key.replace("-Z","") : undefined;
                                const newValue = updatedRow[key] === "" ? null : Number(updatedRow[key]);

                                const existing = grades.find(
                                    g => (perfId && g.performanceId === perfId) || (subjId && g.projectSubjectId === subjId && g.performanceId !== "ZV")
                                );

                                if (existing) existing.grade = newValue;
                                else grades.push({ performanceId: perfId, projectSubjectId: subjId, grade: newValue });
                            });

                            const zvCalculations = gradeOverview.subjects.map(async (subject) => {
                                const perfGrades = subject.performances.map(p => ({
                                    grade: grades.find(g => g.performanceId === p.id)?.grade ?? undefined,
                                    weight: p.weight
                                }));
                                if (perfGrades.some(g => g.grade === undefined)) return;

                                const zvGrade = await calculateSubjectGrade(perfGrades);

                                const zvEntry = grades.find(g => g.projectSubjectId === subject.id && g.performanceId === "ZV");
                                if (zvEntry) zvEntry.grade = zvGrade;
                                else grades.push({ projectSubjectId: subject.id, performanceId: "ZV", grade: zvGrade });

                                updatedRow[`${subject.id}-ZV`] = zvGrade ?? null;
                            });

                            await Promise.all(zvCalculations);

                            setUpdatedGrades(prev => [
                                ...prev.filter(g => g.studentId !== updatedRow.id),
                                { studentId: updatedRow.id, grades }
                            ]);

                            setGradeOverview(prev => ({
                                ...prev!,
                                users: prev!.users.map(u => u.id === updatedRow.id ? { ...userToUpdate, grades } : u)
                            }));

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

                    {!isStudent && (
                        <Stack direction="row" justifyContent="flex-end" mt={3}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={saveGrades}
                            >
                                Speichern
                            </Button>
                        </Stack>
                    )}

                    <FormDialog
                        open={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        projectId={selectedProject?.id}
                        projectSubjects={gradeOverview?.subjects.map(s => ({
                            id: s.id,
                            name: s.name,
                            shortName: s.shortName,
                            learningField: s.isLearningField,
                            weight: s.duration,
                            performances: s.performances
                        })) ?? []}
                        onSubmitSuccess={async () => {
                            await loadGrades(false);
                            await fetchOptions();
                        }}
                    />
                </Paper>
            )}
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </Box>
    );
}
