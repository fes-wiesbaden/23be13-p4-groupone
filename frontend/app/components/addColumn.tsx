import * as React from "react";
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    InputLabel,
    MenuItem,
    FormControl,
    Select, Checkbox,
    FormControlLabel, Autocomplete, FormLabel, RadioGroup, Radio,
} from "@mui/material";
import {useEffect, useState} from "react";
import API_CONFIG from "~/apiConfig";

interface DialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string | undefined;
    projectSubjects: ProjectSubject[];
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
    shortName: string;
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
}

export interface NewProjectSubjectRequest {
    subjectId: string;
    name?: string;
    shortName?: string;
    duration: number;
    learningField?: boolean;
}

export default function FormDialog({open, onClose, projectId, projectSubjects, onSubmitSuccess}: DialogProps) {
    const [isSubject, setIsSubject] = useState<boolean>(false);
    const [selectedProjectSubjectId, setSelectedProjectSubjectId] = useState<string | undefined>(undefined);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
    const [selectedPerformanceId, setSelectedPerformanceId] = useState<string | undefined>(undefined);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [shortName, setShortName] = useState<string | undefined>();
    const [weight, setWeight] = useState<number | undefined>();
    const [performanceOptions, setPerformanceOptions] = useState<Performance[] | undefined>();
    const [subjectOptions, setSubjectOptions] = useState<ProjectSubject[] | undefined>();
    const [columnAction, setColumnAction] = useState<string>("add");
    const [learningField, setLearningField] = useState<String | undefined>("true");
    const [createMore, setCreateMore] = useState<boolean>(false);

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
        if (!isSubject && columnAction !== "add" && selectedOption) {
            setShortName(selectedOption.shortName);
            setWeight(selectedOption.weight);
        }
    }, [selectedOption, columnAction, isSubject]);

    useEffect(() => {
        setWeight(undefined);
        setShortName(undefined)
        setSelectedSubjectId(undefined);
        setSelectedProjectSubjectId(undefined);
        setSelectedProjectSubjectId(undefined)
        setLearningField(undefined);
    }, [isSubject, columnAction, open]);

    useEffect(() => {
        console.log("isSubject",isSubject)
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
                console.log("projectSubject", projectSubject)
                if (projectSubject) {
                    setShortName(projectSubject?.shortName || undefined)
                    console.log("projectSubject.learningField", projectSubject.learningField)
                    setLearningField(projectSubject.learningField ? "true" : "false");
                    setWeight(projectSubject?.weight || undefined)
                }

            } else if (selectedSubjectId) {
                const subject = subjects.find(s => s.id === selectedSubjectId);
                if (subject) {
                    setShortName(subject.shortName || undefined);
                    setLearningField(subject.learningField ? "true" : "false");
                }
            }
        } else if (columnAction !== "add" && selectedOption !== null) {
            const allPerformances = projectSubjects.flatMap(ps => ps.performances);
            console.log("allPerformances",allPerformances)

            const performance = allPerformances.find(p => p?.id === selectedOption?.id);
            console.log("performance",performance)

            setShortName(performance?.shortName || undefined)

            setWeight(performance?.weight || undefined)
        }
    }, [selectedSubjectId, selectedProjectSubjectId, isSubject, selectedPerformanceId]);

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/subject/findAll`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            console.log("res", data)
            setSubjects(data)
        } catch (err) {
            console.error(err);
        }
    };

    const handleClose = () => {
        setSelectedSubjectId("");
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log("formData", new FormData(e.currentTarget))
        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries()) as Record<string, string>;

        let controller;
        let endpoint;
        let method;
        let payload: NewPerformanceRequest | NewProjectSubjectRequest | undefined = undefined;
        if (!selectedOption) {
            return
        }
        if (columnAction == "add") {
            method = "POST"
            if (isSubject) {

                controller = "project";
                endpoint = `${projectId}/add/subject`;

                if (selectedSubjectId !== undefined) {
                    payload = {
                        subjectId: selectedSubjectId,
                        duration: Number(formJson.weight),
                    };
                } else {
                    payload = {
                        subjectId: formJson.subject ?? undefined,
                        name: formJson.subjectName,
                        shortName: formJson.shortName,
                        duration: Number(formJson.weight),
                        learningField: formJson.isLearningField === "true",
                    };
                }
            } else {
                controller = "performance"
                endpoint = `${projectId}/add/subject`;
                payload = {
                    projectSubjectId: formJson.subject ?? "",
                    name: formJson.name,
                    shortName: formJson.shortName,
                    weight: Number(formJson.weight),
                };
            }
        }
        if (columnAction == "delete") {
            method = "DELETE"
            endpoint = `remove/${selectedOption.id || ""}`;
            if (isSubject) {
                controller = "projectSubject";

            } else {
                controller = "performance";
            }


            console.log("endpoint", endpoint)

            console.log("payload", payload)

            try {
                const url = `${API_CONFIG.BASE_URL}/api/${controller}/${endpoint}`;

                const res = await fetch(url, {
                    method: method,
                    headers: {"Content-Type": "application/json"},
                    credentials: "include",
                    body: payload ? JSON.stringify(payload) : undefined,
                });

                if (!res.ok) {
                    console.error("Fehler beim Speichern der Leistung:", res.statusText);
                    return;
                }

                console.log("Leistung erfolgreich gespeichert!");
                if (onSubmitSuccess) onSubmitSuccess();

            } catch (err) {
                console.error(err);
            }
            fetchSubjects();

            setSelectedSubjectId(undefined);
            setShortName(undefined);
            setSelectedSubjectId(undefined);
            if (!createMore) {
                handleClose();
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Spalten anpassen</DialogTitle>

            <form onSubmit={handleSubmit} id="newPerformanceForm">
                <DialogContent>
                    <Box sx={{minWidth: 500, mb: 2}}>
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
                    </Box>
                    <Box sx={{minWidth: 500, mb: 2}}>
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
                    </Box>

                    {!isSubject && (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Bildungsbereich</InputLabel>
                            <Select
                                required
                                name="subject"
                                value={selectedProjectSubjectId ?? ""}
                                onChange={(e) => setSelectedProjectSubjectId(e.target.value)}
                            >
                                {subjectOptions && subjectOptions.length > 0 ? (
                                    subjectOptions.map(option => (
                                        <MenuItem key={option.id} value={option.id}>
                                            {option.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>
                                        Es existiert kein Bildungsbereich im Projekt
                                    </MenuItem>
                                )}
                            </Select>
                        </FormControl>
                    )}

                    {!isSubject && columnAction === "add" && (
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            name="name"
                            label="Name"
                            fullWidth
                            variant="standard"
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
                                        if (isSubject) {
                                            setSelectedProjectSubjectId(newValue.id)
                                        } else setSelectedPerformanceId(newValue.id)
                                    } else
                                        setSelectedSubjectId(newValue.id);
                                } else {
                                    setSelectedProjectSubjectId(undefined);
                                    setSelectedSubjectId(undefined);
                                    setShortName(undefined);
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Name" required name="subjectName"/>
                            )}
                            fullWidth
                        />
                    )}

                    <TextField
                        required
                        margin="dense"
                        name="shortName"
                        label="Kürzel"
                        disabled={selectedSubjectId !== undefined || columnAction !== "add"}
                        value={shortName ?? ""}
                        onChange={(e) => setShortName(e.target.value)}
                        fullWidth
                        variant="standard"
                    />

                    <TextField
                        required
                        margin="dense"
                        name="weight"
                        value={weight ?? ""}
                        disabled={columnAction !== "add"}
                        label={isSubject ? "Dauer" : "Gewichtung"}
                        fullWidth
                        variant="standard"
                    />

                    {isSubject && (
                        <FormControl>
                            <FormLabel required id="type-label">
                                Typ
                            </FormLabel>
                            <RadioGroup
                                row
                                name="learningField"
                                aria-labelledby="type-label"
                                value={learningField !== undefined ? String(learningField) : ""}
                                onChange={(e) => setLearningField(e.target.value)}
                            >
                                <FormControlLabel
                                    value="true"
                                    disabled={selectedSubjectId !== undefined || columnAction !== "add"}
                                    control={<Radio/>}
                                    label="Lernfeld"
                                />
                                <FormControlLabel
                                    value="false"
                                    disabled={selectedSubjectId !== undefined || columnAction !== "add"}
                                    control={<Radio/>}
                                    label="Schulfach"
                                />
                            </RadioGroup>
                        </FormControl>
                    )}
                </DialogContent>

                <DialogActions>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={createMore}
                                onChange={(e) => setCreateMore(e.target.checked)}
                            />
                        }
                        label="mehrere Spalten anpassen"
                    />
                    <Button onClick={handleClose}>Schließen</Button>
                    <Button type="submit" form="newPerformanceForm" variant="contained">
                        {columnAction === "add" ? "Hinzufügen"
                            : columnAction === "edit" ? "Bearbeiten"
                                : columnAction === "delete" ? "Löschen" :
                                    null
                        }
                    </Button>

                </DialogActions>
            </form>
        </Dialog>
    );
}