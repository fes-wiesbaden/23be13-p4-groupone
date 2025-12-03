import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

export default function AlertDialog({
    open: [open, setOpen],
    text,
    title,
    confirmFunc
}: {
    open: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    text?: string
    title?: string
    confirmFunc: (params: any) => any
}) {
    const handleClose = () => setOpen(false);
    const handleConfirm = (params: any) => {
        console.log("confirmed");
        console.log(params);
        setOpen(false);
        // confirmFunc(params);
    }

    return(
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle id="alert-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm}>Bestätigen</Button>
                <Button onClick={handleClose} autoFocus>Abbrechen</Button>
            </DialogActions>
        </Dialog>
    )
}