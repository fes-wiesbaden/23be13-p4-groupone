/*
    @author Paul Geisthardt

    Creates file upload component

    @Edited by Noah Bach
    @Date: 05/12/2025
    Better usability
    (remove file from form on submit, reload on success)
 */
import * as React from "react";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import type CsvType from "~/types/csvType";
import CustomizedSnackbars from "./snackbar";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface FileUploadProps {
  accept?: string;
  upload_name?: string;
  select_name?: string;
  type: CsvType;
  url: string;
  doAfterUpload?: () => void;
}

const SingleFileUploader = (props: FileUploadProps) => {
  const { accept, upload_name, select_name, type, url } = props;
  const [file, setFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const handleSnackbarClose = () => { setSnackbarOpen(false);};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const metadata = { type: type };

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );

    try {
      setFile(null); // am besten wäre, wenn der Button disabled wäre, bis der Promise resolved ist, und dann erst entweder den Button zu enablen oder die Datei zu entfernen (aber dauert halt, ne)

      const result = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!result.ok){
        console.error("Fehler beim Hochladen der Datei:", result.statusText);

        setSnackbarMessage(`Fehler beim Hochladen! Code: ${result.status}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }
      setSnackbarMessage("Datei erfolgreich hochgeladen!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      if (props.doAfterUpload !== undefined)
        props.doAfterUpload();
    } catch (error: any) {
      console.error("Fehler beim Hochladen der Datei:", error);

      setSnackbarMessage(`Fehler beim Hochladen! Code: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

  };

  return (
    <>
      <Paper elevation={1}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
        >
          {select_name ? select_name : "Select File"}
          <VisuallyHiddenInput
            type="file"
            accept={accept ? accept : ""}
            onChange={handleFileChange}
          />
        </Button>
        <p>{file ? file.name : "No File Selected"}</p>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          onClick={handleUpload}
          disabled={!file}
        >
          {upload_name ? upload_name : "Upload File"}
        </Button>
      </Paper>
      <CustomizedSnackbars
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
      />
    </>
  );
};

export default SingleFileUploader;
