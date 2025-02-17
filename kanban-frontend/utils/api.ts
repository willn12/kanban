import axios from "axios";
import { Task } from "../types";

const API_URL = "http://127.0.0.1:8000/api/tasks/";  // Using the rewritten URL
console.log("Using API URL:", API_URL);

export const getTasks = async (): Promise<Task[]> => {
  try {
    console.log("Fetching tasks from:", API_URL);
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to fetch tasks: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("Received data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};


export const updateTask = async (task: Task): Promise<void> => {
  try {
    console.log("Updating task:", task);
    const response = await fetch(API_URL + `${task.id}/`, {  // Added trailing slash
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    console.log("Update response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to update task: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

