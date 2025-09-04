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
  Paper
} from '@mui/material';

interface UserFormData {
  username: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

const initialFormData: UserFormData = {
  username: '',
  firstName: '',
  lastName: '',
  role: 'STUDENT'
};

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value as 'STUDENT' | 'TEACHER' | 'ADMIN'
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log('Sending data:', JSON.stringify(formData, null, 2));
            const response = await fetch('http://localhost:8080/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', response.status, errorText);
            }

      if (response.ok) {
        setFormData(initialFormData);
        console.log('User created successfully');
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
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
  );
};

export default CreateUserForm;