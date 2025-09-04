import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Snackbar,
    Alert,
    type SelectChangeEvent
} from '@mui/material';
import API_CONFIG from '../apiConfig';

interface UserFormData {
  username: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

const initialFormData: UserFormData = {
  username: '',
  firstName: '',
  lastName: '',
  role: 'STUDENT'
};

const initialAlertState: AlertState = {
  open: false,
  message: '',
  severity: 'success'
};

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [alert, setAlert] = useState<AlertState>(initialAlertState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value as 'STUDENT' | 'TEACHER' | 'ADMIN'
    }));
  };

  const handleCloseAlert = () => {
    setAlert(prev => ({ ...prev, open: false }));
  };

  const showAlert = (message: string, severity: 'success' | 'error') => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData(initialFormData);
        showAlert('User created successfully', 'success');
      } else {
        const errorText = await response.text();
        showAlert(`Failed to create user: ${errorText}`, 'error');
      }
    } catch (error) {
      showAlert(`Error creating user: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Create New User
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
          />

          <TextField
            required
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
          />

          <TextField
            required
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
          />

          <FormControl fullWidth required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={formData.role}
              label="Role"
              onChange={handleRoleChange}
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="TEACHER">Teacher</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
          >
            Create User
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity={alert.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateUserForm;