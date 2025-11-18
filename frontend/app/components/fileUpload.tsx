/*
    @author Paul Geisthardt

    Creates file upload component
 */
import * as React from 'react';
import Paper from '@mui/material/Paper';
import {useState} from 'react';
import {styled} from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import type CsvType from "~/types/csvType";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});


interface FileUploadProps {
    accept?: string,
    upload_name?: string,
    select_name?: string,
    type: CsvType,
    url: string,
}

const SingleFileUploader = (props: FileUploadProps) => {
    const { accept, upload_name, select_name, type, url } = props;
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        console.log('Uploading file...');

        const metadata = { type: type };

        const formData = new FormData();
        formData.append('file', file);
        formData.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );

        try {
            const result = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            const data = await result.json();

            console.log(data);
        } catch (error) {
            console.error(error);
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
                    { select_name ? select_name : "Select File" }
                    <VisuallyHiddenInput
                        type="file"
                        accept={accept ? accept : ""}
                        onChange={handleFileChange}
                    />
                </Button>
                <p>
                    {file ? file.name : "No File Selected"}
                </p>
                <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon/>}
                    onClick={handleUpload}
                    disabled={!file}
                >
                    { upload_name ? upload_name : "Upload File" }
                </Button>
            </Paper>
        </>
    );
};

export default SingleFileUploader;