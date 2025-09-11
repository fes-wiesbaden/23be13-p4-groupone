import React from 'react';
import API_CONFIG from './apiConfig';

export async function postGreeting () {
    console.log("pushed button hehe");
    try {
        const response = await fetch (" http://localhost:8080/api/greeting", { method: "POST" });
        const text = await response.text();
        console.log("Response: ", text);
    }
    catch (err) {
        console.error("Request failed:", err);
    }
};

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

export async function deleteCourse (id: any) {
    console.log("Pressed. Id: ", id);
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/klassen/${id}`, {
            method: 'DELETE',
        });
    } catch (e) {
        console.error("Request failed: ", e);
    }
}