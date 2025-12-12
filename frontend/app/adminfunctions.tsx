import API_CONFIG from "./apiConfig";
import { useState } from "react";

export async function postNewTestCourseEntry() {
    try {
        await fetch(`${API_CONFIG.BASE_URL}/api/course`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: '{"courseName":"test-name"}',
        });
    } catch (e) {
        console.error("Request failed: ", e);
    }
}

  export async function deleteCourse(id: string, showSnackbar: (message: string, severity: "success" | "error") => void) {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/course/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        showSnackbar(`Fehler beim Löschen der Klasse! ${res.status}`, "error");
        return;
      }

      showSnackbar("Die Klasse wurde erfolgreich gelöscht!", "success");
    } catch (e) {
      console.error("Request failed: ", e);
      showSnackbar("Fehler beim Löschen der Klasse!", "error");
    }
  }
