// Import the functions used to load and save data.
import { loadTasks, saveTasks } from "./data.js";

// Status values allowed for an assignment.
const STATUSES = ["Pending", "In Progress", "Completed"];

// Central app state containing the current assignments.
export const state = {
    tasks: []
};

// Load the saved assignments when the app starts.
export function initializeTasks() {
    state.tasks = loadTasks();
}

// Create an assignment, give it an ID and default status, and save it.
export function addTask(taskDetails) {
    const task = {
        ...taskDetails,
        // Use a UUID when available, with a fallback for browsers without randomUUID.
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: "Pending"
    };
    // Put the new assignment first so it is easy to find.
    const updatedTasks = [task, ...state.tasks];

    // Save the updated list before changing the in-memory state.
    saveTasks(updatedTasks);
    state.tasks = updatedTasks;
    return task;
}

// Update the assignment with the given ID without changing its ID.
export function updateTask(taskId, taskDetails) {
    const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
    // Report an error if the assignment is no longer in the list.
    if (taskIndex === -1) {
        throw new Error("This assignment could not be found.");
    }

    // Copy the edited assignment and leave all other assignments unchanged.
    const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...taskDetails, id: task.id } : task
    );

    // Save the result and update the app state.
    saveTasks(updatedTasks);
    state.tasks = updatedTasks;
    return state.tasks[taskIndex];
}

// Delete the assignment with the given ID and save the remaining list.
export function deleteTask(taskId) {
    // Do not silently succeed if no assignment matches the ID.
    if (!state.tasks.some((task) => task.id === taskId)) {
        throw new Error("This assignment could not be found.");
    }

    // Create a new list without the assignment being deleted.
    const updatedTasks = state.tasks.filter((task) => task.id !== taskId);
    saveTasks(updatedTasks);
    state.tasks = updatedTasks;
}

// Update an assignment's status and record when it is completed.
export function updateTaskStatus(taskId, status) {
    // Accept only the three status values declared above.
    if (!STATUSES.includes(status)) {
        throw new Error("Choose a valid assignment status.");
    }

    // Copy and update only the assignment with the given ID.
    const updatedTasks = state.tasks.map((task) => {
        if (task.id !== taskId) {
            return task;
        }

        const updatedTask = { ...task, status };
        // Record the completion time once; keep it if the task was already completed.
        if (status === "Completed") {
            if (task.status !== "Completed" || !task.completedAt) {
                updatedTask.completedAt = new Date().toISOString();
            }
        } else {
            // Remove the completion date when the task returns to an unfinished status.
            delete updatedTask.completedAt;
        }
        return updatedTask;
    });

    // Confirm the assignment exists before saving the updated data.
    if (!state.tasks.some((task) => task.id === taskId)) {
        throw new Error("This assignment could not be found.");
    }

    // Save the new list and update the rest of the app.
    saveTasks(updatedTasks);
    state.tasks = updatedTasks;
}