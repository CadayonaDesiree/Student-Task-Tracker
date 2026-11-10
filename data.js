// Storage key used to save assignments in localStorage.
const STORAGE_KEY = "student-task-tracker.assignments";

// Read the assignments saved in the browser and verify their format.
export function loadTasks() {
    // Retrieve the raw data from localStorage.
    const storedTasks = localStorage.getItem(STORAGE_KEY);

    // Start with no assignments when nothing has been saved yet.
    if (storedTasks === null) {
        return [];
    }

    // Convert the JSON text into a JavaScript value.
    const tasks = JSON.parse(storedTasks);
    // Reject invalid data because assignments must be stored as an array.
    if (!Array.isArray(tasks)) {
        throw new Error("Saved assignments have an invalid format.");
    }

    // Return the validated assignment list.
    return tasks;
}

// Encode the assignments as JSON and save them in the browser.
export function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}