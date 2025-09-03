import React from 'react';

export async function postGreeting () {
    console.log("pushed button hehe");
    try {
        const response = await fetch (" http://localhost:8080/greeting", { method: "POST" });
        const text = await response.text();
        console.log("Response: ", text);
    }
    catch (err) {
        console.error("Request failed:", err);
    }
};