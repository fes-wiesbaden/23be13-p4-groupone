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
import type { SelectChangeEvent } from '@mui/material/Select';


export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [bildungsbereich, setBildungsbereich] = React.useState<boolean>(true);
  const [column, setColumn] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setBildungsbereich(event.target.value === "true");
  };

  const chooseColumn = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setColumn(event.target.value);
  };


  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Löschen
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Spalte löschen</DialogTitle>
        <br/>
        <DialogContent>
            <Box sx={{ minWidth: 500 }}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Spalte löschen:</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={bildungsbereich ? "true" : "false"}
                  label="Spalte hinzufügen"
                  onChange={handleChange}
                >
                <MenuItem value="true">Bildungsbereich</MenuItem>
                <MenuItem value="false">Leistungsnachweis</MenuItem>
                </Select>
            </FormControl>
            </Box>
        </DialogContent>
        {bildungsbereich === true && (
        <DialogContent>
            <Box sx={{ minWidth: 500 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Spalte</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={column}
                  label="Spalte"
                  onChange={chooseColumn}
                >
                  <MenuItem value={10}>Bildungsbereich 1</MenuItem>
                  <MenuItem value={20}>Bildungsbereich 2</MenuItem>
                  <MenuItem value={30}>Bildungsbereich 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
        </DialogContent>
        )}
        {bildungsbereich === false && (
        <DialogContent>
            <Box sx={{ minWidth: 500 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Spalte</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={column}
                  label="Spalte"
                  onChange={chooseColumn}
                >
                  <MenuItem value={10}>Leistungsnachweis 1</MenuItem>
                  <MenuItem value={20}>Leistungsnachweis 2</MenuItem>
                  <MenuItem value={30}>Leistungsnachweis 3</MenuItem>
                </Select>
              </FormControl>
            </Box>
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