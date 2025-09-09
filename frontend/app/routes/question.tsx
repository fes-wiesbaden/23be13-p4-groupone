import React, {useState, useEffect} from "react";
import DataTableWithAdd, {type DataRow} from "../components/dataTableWithAddButton";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from "@mui/material";
import API_CONFIG from "../apiConfig";

/**
 * @author: Michael Holl
 * <p>
 *   Component to add, edit & delete questions for questionnaire
 * </p>
 *
 **/
interface Subject {
    id: string;
    name: string;
}

interface Question {
    id: string;
    text: string;
    type: "TEXT" | "GRADE";
    subjects: Subject[];
}

interface QuestionRow extends DataRow {
    text: string;
    type: string;
    subjects: string;
    original: Question;
}

const columns = [
    {label: "Frage", key: "text"},
    {label: "Lernbereiche", key: "subjects"},
    {label: "Typ", key: "type"},
];

const typeMap = {
    TEXT: "Text",
    GRADE: "Note",
};

export default function Question() {
  const [rows, setRows] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // load all subjects
      try {
        const resSubjects = await fetch(
          `${API_CONFIG.BASE_URL}/api/subject/findAll`
        );
        const subjectsData = await resSubjects.json();
        setSubjectsList(subjectsData);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
      // load all questions
      try {
        const resQuestions = await fetch(
          `${API_CONFIG.BASE_URL}/api/question/findAll`
        );
        const questionsData = await resQuestions.json();
        setAllQuestions(questionsData);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };
    fetchData();
  }, []);

  const handleAddClick = () => setOpenDialog(true);

  const handleCloseDialog = () => {
    setSelectedSubjects([]);
    setOpenDialog(false);
  };

    const handleEditClick = async (row: QuestionRow) => {
        const question = row.original;
        // TODO: Build Logic To Edit Row
    }

    const handleDeleteClick = async (id: string) => {
        // TODO: Build Logic To Delete Row
    }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as any).entries());

        const payload = {
            text: formJson.question,
            type: formJson.type.toUpperCase(),
            subjects: selectedSubjects.map(s => ({id: s.id})),
        };

    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

            if (res.ok) {
                const newQuestion = await res.json();
                setAllQuestions(prev => [...prev, newQuestion]);
            }
        } catch (err) {
            console.error("Error sending form to Backend:", err);
        }
        handleCloseDialog();
    };

    return (
        <>
            <DataTableWithAdd<QuestionRow>
                columns={columns}
                rows={allQuestions.map<QuestionRow>(q => ({
                    id: q.id,
                    text: q.text,
                    type: typeMap[q.type],
                    subjects: q.subjects.map(s => s.name).join(", "),
                    original: q
                }))}
                onAddClick={handleAddClick}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
            />
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>Neue Frage</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit} id="newQuestionForm">
                        <TextField
                            autoFocus
                            required
                            maxRows={4}
                            margin="dense"
                            id="questionText"
                            name="question"
                            label="Frage"
                            type="text"
                            fullWidth
                            multiline
                        />

                        <Autocomplete
                            multiple
                            options={subjectsList}
                            value={selectedSubjects}
                            onChange={(event, newValue) => setSelectedSubjects(newValue)}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => (
                                <TextField {...params} label="Fächer" variant="standard"/>
                            )}
                        />

                        <FormControl variant="standard" fullWidth margin="dense" required>
                            <InputLabel id="type-label">Typ</InputLabel>
                            <Select labelId="type-label" id="type" name="type" defaultValue="">
                                <MenuItem value="Text">Text</MenuItem>
                                <MenuItem value="Grade">Note</MenuItem>
                            </Select>
                        </FormControl>
                    </form>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog}>Abbrechen</Button>
                    <Button type="submit" form="newQuestionForm">Hinzufügen</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
