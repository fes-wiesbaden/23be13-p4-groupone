import React, {useEffect, useState} from "react";
import type {Subject} from "~/routes/subject";
import API_CONFIG from "~/apiConfig";
import type {ProjectSubjectDTO} from "~/routes/createOrEditProject";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {Button, Card, CardContent, Chip, MenuItem, Select, TextField} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import useAlertDialog from "./youSurePopup";

export type Project = {
    projectId?: string;
    projectName?: string;
}

export default function AddSubjectToProject({
                                                projectSubjects,
                                                onAddSubject,
                                                onRemoveSubject
                                            }: {
    projectSubjects: ProjectSubjectDTO[]
    onAddSubject: (subjectId: string, duration: number) => void
    onRemoveSubject: (projectSubjectId: string) => void
}) {
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [duration, setDuration] = useState<number>(80);
    const [confirm, ConfirmDialog] = useAlertDialog("Wirklich entfernen?", "Wollen Sie das Fach wirklich vom Projekt entfernen?")

    const fetchSubjects = async () => {
        try {
            const res = await fetch(`${API_CONFIG.BASE_URL}/api/subject/findAll`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                setLoadingError(`Failed to Load Subjects ${res.status}`);
                return;
            }

            const subjects: Subject[] = await res.json();
            setAllSubjects(subjects);
        } catch (err: any) {
            setLoadingError(`Failed to Load Subjects ${err.message}`);
        } finally {
            setLoading(false);
        }
    }

    const addSubject = () => {
        if (!selectedSubjectId) return;

        onAddSubject(selectedSubjectId, duration);
        setSelectedSubjectId("");
        setDuration(80);
    }

    const removeSubject = async (projectSubjectId: string) => {
        if (!await confirm())
            return;
        onRemoveSubject(projectSubjectId);
    }

    useEffect(() => {
        fetchSubjects();
    }, []);

    if (loading) return <Typography>Lade Fächer...</Typography>

    if (loadingError) return (
        <Box
            mb={2}
            p={2}
        >
            <Typography color="error" gutterBottom>
                {loadingError}
            </Typography>
            <Button onClick={() => {
                setLoadingError(null);
                fetchSubjects();
            }}>
                Wiederholen
            </Button>
        </Box>
    )

    const availableSubjects = allSubjects.filter(
        subject => !projectSubjects.some(ps => ps.subjectId === subject.id)
    );

    const getSubjectName = (subjectId: string) => {
        const subject = allSubjects.find(s => s.id === subjectId);
        return subject ? `${subject.name} (${subject.shortName})` : "Unbekannt";
    };

    return (<>
        <Card variant="outlined" sx={{mb: 3}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Fächer
                </Typography>

                {projectSubjects.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                        {projectSubjects.map((ps) => (
                            <Chip
                                key={ps.projectSubjectId}
                                label={`${getSubjectName(ps.subjectId)} (${ps.duration} Stunden)`}
                                onDelete={() => removeSubject(ps.projectSubjectId)}
                                deleteIcon={<DeleteIcon/>}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                ) : (
                    <Typography color="text.secondary">
                        Noch keine Fächer zugeordnet
                    </Typography>
                )}

                {availableSubjects.length > 0 && (
                    <Box display="flex" gap={2} flexWrap="wrap">
                        <Select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            displayEmpty
                            size="small"
                            sx={{minWidth: 200, flex: "1 1 200px"}}
                        >
                            <MenuItem value="" disabled>Fach auswählen</MenuItem>
                            {availableSubjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.name} ({subject.shortName})
                                </MenuItem>
                            ))}
                        </Select>

                        <TextField
                            label="Stundenanzahl"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            size="small"
                            sx={{width: 120}}
                            slotProps={{
                                input: {
                                    inputProps: {min: 1}
                                }
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<AddIcon/>}
                            onClick={addSubject}
                            disabled={!selectedSubjectId}
                            size="small"
                        >
                            Hinzufügen
                        </Button>
                    </Box>
                )}

                {availableSubjects.length === 0 && projectSubjects.length > 0 && (
                    <Typography color="text.secondary">
                        Alle verfügbaren Fächer wurden zugeordnet
                    </Typography>
                )}
            </CardContent>
        </Card>
        {ConfirmDialog}
        </>
    )
}