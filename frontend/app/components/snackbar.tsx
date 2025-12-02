import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


interface Props {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

export default function CustomizedSnackbars({ open, message, severity, onClose }: Props) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert 
        onClose={onClose}
        severity={severity}                       
        variant="filled" 
        sx={{ width: '100%' }}
      >
        {message}                                
      </Alert>
    </Snackbar>
  );
}
