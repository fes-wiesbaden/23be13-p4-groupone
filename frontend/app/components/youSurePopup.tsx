/**
 * @author: Noah Bach
 * Component that returns a dialog and an async function for confirming actions
 *
 **/

import { Button, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useState, useCallback } from 'react';

export default function alertDialog(
    title?: string,
    text?: string
) {
    const [open, setOpen] = useState(false);
    const [resolveFn, setResolve] = useState<((value: boolean) => void) | null>(null);
    
    const confirm = useCallback(
        (): Promise<boolean> => {
            setOpen(true);
            return new Promise<boolean>((resolve) => {
                setResolve(() => resolve);
            });
        },
        []
    );
    
    const handleClose = () => {
        setOpen(false);
        if (resolveFn) resolveFn(false);
    }
    const handleConfirm = () => {
        setOpen(false);
        if (resolveFn) resolveFn(true);
    }

    const dialogElement = (
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
    );

    return [confirm, dialogElement] as const;
}