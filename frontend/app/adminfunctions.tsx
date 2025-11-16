import React from 'react';
import API_CONFIG from './apiConfig';

export async function postNewTestCourseEntry () {
    console.log("Create New Course");
    try {
        // POST for new course
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/klassen`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: '{"courseName":"test-name"}',
        });
    }
    catch (e) {
        console.error("Request failed: ", e);
    }
}

export async function deleteCourse (id: string) {
    console.log("Pressed. Id: ", id);
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${id}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.error("Request failed: ", e);
    }
}