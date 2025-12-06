import React, { useState, useEffect } from "react";
import API_CONFIG from "../apiConfig";
import Tooltip from "@mui/material/Tooltip";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import {
    DataGrid,
    type GridColDef,
    type GridColumnGroupingModel
} from "@mui/x-data-grid";

/**
 * @author Michael Holl
 *
 * Displays grade overview
 * - Select course, project, and group
 * - Fetch and display grades in an editable DataGrid
 * - Supports resetting and saving grades
 */

export interface GroupOption {
    id: string;
    name: string;
}

export interface ProjectOption {
    id: string;
    name: string;
    groups: GroupOption[];
}

export interface GradeOverviewOption {
    id: string;
    name: string;
    projects: ProjectOption[];
}

export interface GradeOverview {
    subjects: Subject[];
    users: User[];
}

export interface Subject {
    id: string;
    name: string;
    shortName: string;
    duration: number;
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
    performanceId?: string;
    projectSubjectId?: string;
    grade?: number | null;
}

export interface UpdateGradeRequest {
    studentId: string;
    grades: Grade[];
}

export interface CalculateSubjectGrade {
    grade?: number;
    weight: number;
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
        if (updatedGrades.length > 0) {
            try {
                const url = `${API_CONFIG.BASE_URL}/api/grade/save`;

                const res = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(updatedGrades),
                });

                if (!res.ok) {
                    //TO DO Snackbar einbauen: Speichern fehlgeschlagen!
                    console.error("Fehler beim Speichern der Noten:", res.statusText);
                    return;
                }
                //TO DO Snackbar einbauen: Erfolgreich gespeichert!
                console.log("Noten erfolgreich gespeichert!");
                setUpdatedGrades([]);

            } catch (err) {
                console.error(err);
            }
        }
    };

    const reset = () => {
        setGradeOverview(gradeOverviewBackup)
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

    const calculateSubjectGrade = async (grades: CalculateSubjectGrade[]) => {
        try {
            const url = `${API_CONFIG.BASE_URL}/api/grade/calculateSubjectGrade`;
            const res = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(grades),
            });

            if (!res.ok) {
                console.error("Fehler beim Berechnen der Zeugnisnote:", res.statusText);
                return;
            }
            const subjectGrade = await res.json();
            return subjectGrade;
            console.log("Zeugnisnote erfolgreich berechnet!");
        } catch (err) {
            console.error(err);
        }
    };

    // performance columns
    const performancesColumns: GridColDef[] =
        gradeOverview?.subjects?.flatMap(subject => {
            const performanceGradeHeader: GridColDef[] = subject.performances.map(perf => ({
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
                flex: 1,
                minWidth: 80,
                editable: true
            }));
            const subjectGradeDraftHeader: GridColDef = {
                field: `${subject.id}-ZV`,
                headerName: "ZV",
                renderHeader: () => (
                    <Tooltip
                        title={<div>Name: Zeugnisvorschlag</div>}
                    >
                        <span>ZV</span>
                    </Tooltip>
                ),
                flex: 1,
                minWidth: 80,
                editable: false
            };
            const subjectGradeFinalHeader: GridColDef = {
                field: `${subject.id}-Z`,
                headerName: "Z",
                renderHeader: () => (
                    <Tooltip
                        title={<div>Name: Zeugnisnote</div>}
                    >
                        <span>Z</span>
                    </Tooltip>
                ),
                flex: 1,
                minWidth: 80,
                editable: true
            };
            return subject.performances.length === 0 ? subjectGradeFinalHeader : [...performanceGradeHeader, subjectGradeDraftHeader, subjectGradeFinalHeader];
        }) ?? [];

    // Base columns
    const columns: GridColDef[] = [
        {field: "nr", headerName: "Nr.", width: 80},
        {field: "nachname", headerName: "Nachname", width: 150},
        {field: "vorname", headerName: "Vorname", width: 150},
        {field: "gruppe", headerName: "Gruppe", width: 120},
        ...performancesColumns
    ];

    const columnGroupingModel: GridColumnGroupingModel = [
        {
            groupId: "bildungsbereich",
            headerName: "Bildungsbereich",
            children: [
                {field: "nr"},
                {field: "nachname"},
                {field: "vorname"},
                {field: "gruppe"},
            ],
        },
        ...(gradeOverview?.subjects.map(subject => ({
            groupId: subject.id,
            headerName: `${subject.shortName} (${subject.duration})`,
            description: "Name: " + subject.name,
            children: [
                // performance columns
                ...(
                    subject.performances.length > 0
                        ? subject.performances.map(perf => ({field: perf.id}))
                        : [{field: `${subject.id}-empty`}]
                ),
                // Z columns for subject
                {field: `${subject.id}-ZV`},
                {field: `${subject.id}-Z`}
            ]
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
                if (grade.performanceId) {
                    row[grade.performanceId] = grade.grade;
                }
                if (grade.projectSubjectId) {
                    row[`${grade.projectSubjectId}-ZV`] = grade.grade;
                }
                if (grade.projectSubjectId) {
                    row[`${grade.projectSubjectId}-Z`] = grade.grade;
                }
            });
            return row;
        }) || [];

    return (
        <Box p={3} style={{width: "100%"}}>
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
                    sx={{minWidth: 200}}
                />
                <Autocomplete
                    options={selectedCourse?.projects || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, v) => setSelectedProject(v)}
                    renderInput={(params) =>
                        <TextField {...params}
                                   label="Projekt"
                                   error={projectError}/>}
                    sx={{minWidth: 200}}
                    disabled={selectedCourse == null}
                />
                <Autocomplete
                    options={selectedProject?.groups || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(_, v) => setSelectedGroup(v)}
                    renderInput={(params) => <TextField {...params} label="Gruppe"/>}
                    sx={{minWidth: 200}}
                    disabled={selectedProject == null}
                />
                <Button variant="contained" onClick={loadGrades}>
                    Anzeigen
                </Button>
            </Box>
            {renderGradeTable && (
                <>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        columnGroupingModel={columnGroupingModel}
                        disableRowSelectionOnClick
                        onProcessRowUpdateError={(error) => console.log(error)}
                        processRowUpdate={async (updatedRow) => {
                            if (!gradeOverview) return updatedRow;

                            // Alle User async verarbeiten
                            const newUsers = await Promise.all(
                                gradeOverview.users.map(async (user) => {
                                    if (user.id !== updatedRow.id) return user;

                                    let grades: Grade[] = [...(user.grades ?? [])];

                                    // Alle Spalten durchgehen
                                    for (const key of Object.keys(updatedRow)) {
                                        if (["id", "nr", "nachname", "vorname", "gruppe"].includes(key)) continue;
                                        if (typeof updatedRow[key] !== "string") continue;

                                        const isSubjectGrade = key.endsWith("-Z");
                                        const perfId = isSubjectGrade ? undefined : key;
                                        const subjId = isSubjectGrade ? key.replace("-Z", "") : undefined;

                                        const newValue = updatedRow[key] === "" ? undefined : Number(updatedRow[key]);

                                        let editedGrade = grades.find(
                                            (g) =>
                                                (perfId && g.performanceId === perfId) ||
                                                (subjId && g.projectSubjectId === subjId)
                                        );

                                        if (editedGrade) editedGrade.grade = newValue ?? null;
                                        else grades.push({
                                            performanceId: perfId,
                                            projectSubjectId: subjId,
                                            grade: newValue ?? null,
                                        });

                                        // Wenn es eine einzelne Leistung ist → Fachnote berechnen
                                        if (!isSubjectGrade && perfId) {
                                            const subject = gradeOverview.subjects.find((s) =>
                                                s.performances.some((p) => p.id === perfId)
                                            );
                                            if (!subject) continue;

                                            const allGrades: CalculateSubjectGrade[] = subject.performances.map((perf) => {
                                                const g = grades.find((gr) => gr.performanceId === perf.id)?.grade;
                                                return {
                                                    grade: g === null ? undefined : g,
                                                    weight: perf.weight
                                                };
                                            });

                                            const allHaveGrades = allGrades.every((g) => g.grade !== undefined);

                                            let subjectGrade: number | null = null;
                                            if (allHaveGrades) {
                                                subjectGrade = await calculateSubjectGrade(allGrades);
                                            }

                                            let subjEntry = grades.find(
                                                (g) => g.projectSubjectId === subject.id && !g.performanceId
                                            );

                                            if (subjEntry) subjEntry.grade = subjectGrade;
                                            else grades.push({
                                                projectSubjectId: subject.id,
                                                grade: subjectGrade,
                                            });

                                            updatedRow[`${subject.id}-ZV`] = subjectGrade ?? undefined;
                                            updatedRow[`${subject.id}-Z`] = subjectGrade ?? undefined;
                                        }
                                    }

                                    setUpdatedGrades((prev) => [
                                        ...prev.filter((g) => g.studentId !== updatedRow.id),
                                        { studentId: updatedRow.id, grades: grades },
                                    ]);

                                    return { ...user, grades };
                                })
                            );

                            setGradeOverview({ ...gradeOverview, users: newUsers });

                            return updatedRow;
                        }}

                        sx={{
                            width: "100%",
                            maxHeight: 500,
                            "& .MuiDataGrid-virtualScroller": {overflowX: "auto", overflowY: "auto"},
                            "& .MuiDataGrid-cell": {display: "flex", justifyContent: "center", alignItems: "center"},
                            "& .MuiDataGrid-columnHeader .MuiDataGrid-columnHeaderTitleContainer": {justifyContent: "center"},
                            "& .MuiDataGrid-columnHeaderGroup .MuiDataGrid-columnHeaderTitleContainer": {justifyContent: "center"},
                        }}
                    />
                    <Box display="flex" gap={2} py={2}>
                        <Button variant="contained" onClick={saveGrades}>
                            Speichern
                        </Button>
                        <Button variant="contained" onClick={reset}>
                            Zurücksetzen
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}
