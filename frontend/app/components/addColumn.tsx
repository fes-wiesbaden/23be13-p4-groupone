import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [bildungsbereich, setBildungsbereich] = React.useState<boolean>(true);


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const email = formJson.email;
    console.log(email);
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Spalte hinzufügen</DialogTitle>
        <br/>
        <DialogContent>
            <Box sx={{ minWidth: 500 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Spalte hinzufügen:</InputLabel>
                <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={bildungsbereich}
                label="Spalte hinzufügen"
                onChange={(e) => setBildungsbereich(e.target.value === "true")}
                >
                <MenuItem value="true">Bildungsbereich</MenuItem>
                <MenuItem value="false">Leistungsnachweis</MenuItem>
                </Select>
            </FormControl>
            </Box>
        </DialogContent>
        <DialogContent>
          <form onSubmit={handleSubmit} id="namen-feld">
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              type="name"
              fullWidth
              variant="standard"
            />
          </form>
        </DialogContent>
        <DialogContent>
          <form onSubmit={handleSubmit} id="kürzel-feld">
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="kürzel"
              label="Kürzel"
              type="kürzel"
              fullWidth
              variant="standard"
            />
          </form>
        </DialogContent>
        <DialogContent>
          <form onSubmit={handleSubmit} id="gewichtung-feld">
            <TextField
              autoFocus
              required
              margin="dense"
              id="gewichtung"
              name="gewichtung"
              label="Gewichtung"
              type="gewichtung"
              fullWidth
              variant="standard"
            />
          </form>
        </DialogContent>
        {bildungsbereich === false && (
        <DialogContent>
            <form onSubmit={handleSubmit} id="bildungsbereich-feld">
            <TextField
                autoFocus
                required
                margin="dense"
                id="bildungsbereich"
                name="bildungsbereich"
                label="Bildungsbereich"
                type="text"
                fullWidth
                variant="standard"
            />
            </form>
        </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose}>Schließen</Button>
          <Button type="submit" form="subscription-form">
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}