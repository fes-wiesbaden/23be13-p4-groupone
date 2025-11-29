import React from 'react';
import API_CONFIG from './apiConfig';

export async function postNewTestCourseEntry () {
    try {
        await fetch(`${API_CONFIG.BASE_URL}/api/course`, {
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
    try {
        await fetch(`${API_CONFIG.BASE_URL}/api/course/${id}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.error("Request failed: ", e);
    }
}
