import * as React from "react";
import {useEffect, useState} from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from "@mui/material";
import API_CONFIG from "~/apiConfig";
import CustomizedSnackbars from "~/components/snackbar";
import {type Teacher} from "~/types/models"

interface DialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string | undefined;
    projectSubjects: ProjectSubject[];
    teachers: Teacher[]
    onSubmitSuccess?: () => void;
}

interface ProjectSubject {
    id: string;
    name: string;
    shortName?: string;
    learningField?: boolean;
    weight?: number;
    performances?: Performance[];
}

export interface Performance {
    id: string;
    name: string;
    shortName?: string;
    weight: number;
}

interface Subject {
    id: string;
    name: string;
    shortName: string;
    learningField: boolean;
    weight?: number;
}

export interface NewPerformanceRequest {
    projectSubjectId: string;
    name: string;
    shortName: string;
    weight: number;
    assignedTeacherId: string
}

export interface NewProjectSubjectRequest {
    subjectId: string;
    name?: string;
    shortName?: string;
    duration: number;
    learningField?: boolean;
}

export interface EditProjecSubject {
    id: string,
    shortName: string,
    duration: number,
    learningField: boolean,
}

export default function FormDialog({
                                       open,
                                       onClose,
                                       projectId,
                                       projectSubjects,
                                       teachers,
                                       onSubmitSuccess
                                   }: DialogProps) {
    const [isSubject, setIsSubject] = useState<boolean>(false);
    const [selectedProjectSubjectId, setSelectedProjectSubjectId] = useState<string | undefined>(undefined);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
    const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | undefined>(undefined);
    const [assignedTeacherId, setAssignedTeacherId] = useState("")

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [shortName, setShortName] = useState<string>();
    const [displayWeight, setDisplayWeight] = useState<string | undefined>();
    const [performanceOptions, setPerformanceOptions] = useState<Performance[] | undefined>();
    const [subjectOptions, setSubjectOptions] = useState<ProjectSubject[] | undefined>();
    const [columnAction, setColumnAction] = useState<string>("add");
    const [learningField, setLearningField] = useState<string>("true");
    const [createMore, setCreateMore] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');


    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const optionsList = isSubject
        ? (subjectOptions ?? []).map(s => ({id: s.id, name: s.name}))
        : (performanceOptions ?? []).map(p => ({id: p.id, name: p.name}));

    const selectedOption = isSubject
        ? (columnAction === "add"
            ? subjects.find(s => s.id === selectedSubjectId)
            : projectSubjects.find(ps => ps.id === selectedProjectSubjectId)
    ) || null
        : performanceOptions?.find(p => p.id === selectedPerformanceId) || null;

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (!selectedOption) return;
        if (!isSubject && columnAction !== "add") {
            setShortName(selectedOption.shortName ?? "");
            setDisplayWeight(String(selectedOption.weight ?? ""));
        }
    }, [selectedOption, columnAction, isSubject]);

    useEffect(() => {
        setShortName("");
        setDisplayWeight("");
    }, [selectedSubjectId, selectedProjectSubjectId, isSubject]);

    useEffect(() => {
        setSelectedSubjectId(undefined);
        setSelectedProjectSubjectId(undefined);
        setSelectedPerformanceId(undefined);
        setShortName("");
        setDisplayWeight("");
        setLearningField("true");
    }, [isSubject, columnAction, open]);


    useEffect(() => {
        if (columnAction === "add" && isSubject) {
            setSubjectOptions(
                subjects.map(subject => ({
                    id: subject.id,
                    name: subject.name,
                }))
            );
        } else {
            setPerformanceOptions(
                projectSubjects
                    .find(ps => ps.id === selectedProjectSubjectId)
                    ?.performances ?? []
            );
            setSubjectOptions(projectSubjects)
        }
    }, [columnAction, subjects, selectedProjectSubjectId, isSubject]);

    useEffect(() => {
        if (isSubject) {
            if (columnAction !== "add") {
                const projectSubject = projectSubjects.find(ps => ps.id === selectedProjectSubjectId);
                if (projectSubject) {
                    setShortName(projectSubject?.shortName || undefined)
                    setLearningField(projectSubject.learningField ? "true" : "false");
                    setDisplayWeight(String(projectSubject?.weight) || undefined);
                }

            } else if (selectedSubjectId) {
                const subject = subjects.find(s => s.id === selectedSubjectId);
                if (subject) {
                    setShortName(subject.shortName || undefined);
                    setLearningField(subject.learningField ? "true" : "false");
                }
            }
        }
    }, [selectedSubjectId, selectedProjectSubjectId]);

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/subject/findAll`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            setSubjects(data)
        } catch (err) {
            console.error(err);
        }
    };

    const handleClose = () => {
        setCreateMore(false);
        setSelectedSubjectId(undefined);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;

        let controller: string | undefined;
        let endpoint: string | undefined;
        let method: "POST" | "PUT" | "DELETE" | undefined;
        let payload: NewPerformanceRequest | NewProjectSubjectRequest | Performance | EditProjecSubject | undefined;

        switch (columnAction) {
            case "add":
                method = "POST";
                if (isSubject) {
                    controller = "project";
                    endpoint = `${projectId}/add/subject`;

                    payload = selectedSubjectId
                        ? {subjectId: selectedSubjectId, duration: Number(formJson.weight.replace(",", "."))}
                        : {
                            subjectId: formJson.subject ?? undefined,
                            name: formJson.subjectName,
                            shortName: formJson.shortName,
                            duration: Number(formJson.weight.replace(",", ".")),
                            learningField: formJson.isLearningField === "true",
                        };
                } else {
                    controller = "performance";
                    endpoint = "save";
                    if (!assignedTeacherId.trim()) console.log("WHYY")
                    payload = {
                        projectSubjectId: formJson.subject ?? "",
                        name: formJson.name,
                        shortName: formJson.shortName,
                        weight: Number(formJson.weight.replace(",", ".")) / 100,
                        assignedTeacherId: assignedTeacherId
                    };
                }
                break;

            case "delete":
                if (!selectedOption) return;

                method = "DELETE";
                endpoint = `remove/${selectedOption.id || ""}`;
                controller = isSubject ? "projectSubject" : "performance";
                break;

            case "edit":
                if (!selectedOption) return;

                method = "PUT";
                endpoint = "edit";

                if (isSubject) {
                    controller = "projectSubject";
                    payload = {
                        id: selectedOption.id,
                        shortName: formJson.shortName,
                        duration: Number(formJson.weight.replace(",", ".")),
                        learningField: formJson.learningField === "true",
                    };
                } else {
                    controller = "performance";
                    payload = {
                        id: selectedOption.id,
                        name: selectedOption.name,
                        shortName: formJson.shortName,
                        weight: Number(formJson.weight.replace(",", ".")) / 100,
                    };
                }
                break;

            default:
                console.error("Unknown action:", columnAction);
                return;
        }
        try {
            const url = `${API_CONFIG.BASE_URL}/api/${controller}/${endpoint}`;

            const res = await fetch(url, {
                method: method,
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: payload ? JSON.stringify(payload) : undefined,
            });

            if (!res.ok) {
                const errorText = await res.text();
                setSnackbarMessage(errorText);
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                return;
            }
            setSnackbarMessage("Änderungen wurden gespeichert");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
            if (onSubmitSuccess) onSubmitSuccess();
            setSelectedProjectSubjectId(undefined);
            setSelectedSubjectId(undefined);
            setShortName("");
            setDisplayWeight("");
            setAssignedTeacherId("");
        } catch (err) {
            console.error(err);
        }

        await fetchSubjects();
        setSelectedProjectSubjectId(undefined);
        setSelectedSubjectId(undefined);
        setShortName("");
        setDisplayWeight("");
        setAssignedTeacherId("");
        if (!createMore) {
            handleClose();
        }
    };

    return (
        <div>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>Tabelle anpassen</DialogTitle>

                <form onSubmit={handleSubmit} id="newPerformanceForm">
                    <DialogContent>
                        <Box sx={{display: "grid", gap: 2}}>
                            <FormControl fullWidth>
                                <InputLabel>Aktion</InputLabel>
                                <Select
                                    value={columnAction}
                                    label="Aktion"
                                    onChange={(e) => setColumnAction(e.target.value)}
                                >
                                    <MenuItem value="add">Hinzufügen</MenuItem>
                                    <MenuItem value="edit">Bearbeiten</MenuItem>
                                    <MenuItem value="delete">Löschen</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Spalte anpassen</InputLabel>
                                <Select
                                    value={isSubject ? "true" : "false"}
                                    label="Spalte anpassen"
                                    onChange={(e) => setIsSubject(e.target.value === "true")}
                                >
                                    <MenuItem value="true">Bildungsbereich</MenuItem>
                                    <MenuItem value="false">Leistungsnachweis</MenuItem>
                                </Select>
                            </FormControl>

                            {!isSubject && (
                                <>
                                    <FormControl fullWidth>
                                        <InputLabel>Bildungsbereich</InputLabel>
                                        <Select
                                            required
                                            name="subject"
                                            value={selectedProjectSubjectId ?? ""}
                                            onChange={(e) => {
                                                const newId = e.target.value;
                                                setSelectedProjectSubjectId(newId);

                                                setShortName("");
                                                setDisplayWeight("");
                                            }}
                                        >
                                            {subjectOptions && subjectOptions.length > 0 ? (
                                                subjectOptions.map((option) => (
                                                    <MenuItem key={option.id} value={option.id}>
                                                        {option.name}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>Es existiert kein Bildungsbereich im
                                                    Projekt</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <InputLabel>Zugewiesener Lehrer</InputLabel>
                                        <Select
                                            required
                                            name="assigned_teacher"
                                            value={assignedTeacherId ?? ""}
                                            onChange={(e) => {
                                                setAssignedTeacherId(e.target.value)
                                            }}
                                        >
                                            {teachers && teachers.length > 0 ? (
                                                teachers.map((t) => (
                                                    <MenuItem key={t.teacherId} value={t.teacherId}>
                                                        {t.firstName} {t.lastName}
                                                    </MenuItem>
                                                ))
                                            ) : (
                                                <MenuItem disabled>Dem Kurs wurden keine Lehrer zugeordnet</MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </>
                            )}

                            {!isSubject && columnAction === "add" && (
                                <TextField
                                    autoFocus
                                    required
                                    name="name"
                                    label="Name"
                                    fullWidth
                                    variant="outlined"
                                />
                            )}

                            {(isSubject || columnAction !== "add") && (
                                <Autocomplete
                                    freeSolo={columnAction === "add"}
                                    options={optionsList}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option?.name ?? ""
                                    }
                                    value={selectedOption}
                                    onChange={(_, newValue) => {
                                        if (newValue && typeof newValue === "object") {
                                            if (columnAction !== "add") {
                                                if (isSubject) setSelectedProjectSubjectId(newValue.id);
                                                else setSelectedPerformanceId(newValue.id);
                                            } else setSelectedSubjectId(newValue.id);
                                        } else {
                                            setSelectedProjectSubjectId(undefined);
                                            setSelectedSubjectId(undefined);
                                            setShortName(undefined);
                                        }
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Name" required name="subjectName"
                                                   variant="outlined"/>
                                    )}
                                    fullWidth
                                />
                            )}

                            <TextField
                                required
                                name="shortName"
                                label="Kürzel"
                                disabled={selectedSubjectId !== undefined || columnAction === "delete"}
                                value={shortName}
                                onChange={(e) => setShortName(e.target.value)}
                                fullWidth
                                variant="outlined"
                            />

                            <TextField
                                required
                                name="weight"
                                label={isSubject ? "Dauer in Stunden" : "Gewichtung in %"}
                                value={displayWeight} // "" statt undefined
                                disabled={columnAction === "delete"}
                                type="text"
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    setDisplayWeight(raw);
                                }}
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{
                                    shrink: Boolean(displayWeight && displayWeight !== ""),
                                }}
                            />

                            {isSubject && (
                                <FormControl component="fieldset">
                                    <FormLabel component="legend" required>Typ</FormLabel>
                                    <RadioGroup
                                        row
                                        name="learningField"
                                        value={learningField !== undefined ? String(learningField) : ""}
                                        onChange={(e) => setLearningField(e.target.value)}
                                    >
                                        <FormControlLabel
                                            value="true"
                                            disabled={selectedSubjectId !== undefined || columnAction === "delete"}
                                            control={<Radio/>}
                                            label="Lernfeld"
                                        />
                                        <FormControlLabel
                                            value="false"
                                            disabled={selectedSubjectId !== undefined || columnAction === "delete"}
                                            control={<Radio/>}
                                            label="Schulfach"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{justifyContent: "space-between", padding: "16px"}}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={createMore}
                                    onChange={(e) => setCreateMore(e.target.checked)}
                                />
                            }
                            label="mehrere Spalten anpassen"
                        />
                        <Box>
                            <Button onClick={handleClose} sx={{mr: 1}}>Schließen</Button>
                            <Button type="submit" form="newPerformanceForm" variant="contained">
                                {columnAction === "add" ? "Hinzufügen" :
                                    columnAction === "edit" ? "Bearbeiten" :
                                        columnAction === "delete" ? "Löschen" : null}
                            </Button>
                        </Box>
                    </DialogActions>
                </form>
            </Dialog>
            <CustomizedSnackbars
                open={snackbarOpen}
                message={snackbarMessage}
                severity={snackbarSeverity}
                onClose={handleSnackbarClose}
            />
        </div>

    );
}