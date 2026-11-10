// Import assignment data operations and business logic.
import {
    addTask,
    deleteTask,
    initializeTasks,
    state,
    updateTask,
    updateTaskStatus
} from "./model.js";
// Import task filtering and rendering functions.
import { bindSearch, getVisibleTasks } from "./SearchView.js";
import { renderStats, renderTasks } from "./TaskView.js";
// Import settings initialization and page navigation.
import { initializeSettings, navigateToPage } from "./SettingsView.js";
// Import helpers for the form, feedback, and notifications.
import {
    celebrateCompletion,
    getFormValues,
    resetForm,
    showFeedback,
    showNotification
} from "./views/View.js";

// Get the page elements used by the event handlers.
const form = document.querySelector("#task-form");
const taskSection = document.querySelector("#tasks");
const taskList = document.querySelector("#task-list");
const completedTaskList = document.querySelector("#completed-task-list");
const cancelEditButton = document.querySelector("#cancel-edit-btn");
const formTitle = document.querySelector("#task-form-title");
const submitButton = document.querySelector("#add-task-btn");
let editingTaskId = null;

// Re-render the counts and tasks using the latest state and filters.
function render() {
    renderStats(state.tasks);
    const visibleTasks = getVisibleTasks(state.tasks);
    const activeTasks = visibleTasks.filter((task) => task.status !== "Completed");
    // Sort recently completed tasks to the top of the completed list.
    const completedTasks = visibleTasks
        .filter((task) => task.status === "Completed")
        .sort((first, second) =>
            (Date.parse(second.completedAt) || 0) - (Date.parse(first.completedAt) || 0)
        );

    renderTasks(taskList, activeTasks, "No active assignments match your search or status filter.");
    renderTasks(completedTaskList, completedTasks, "Completed assignments will appear here.");
}

// Save a new or edited assignment when the form is submitted.
form.addEventListener("submit", (event) => {
    // Prevent the browser's default form submission and page reload.
    event.preventDefault();

    // Read the fields and stop the save if any required value is missing.
    const task = getFormValues();
    if (!task.title || !task.subject || !task.description || !task.dueDate || !task.priority) {
        showFeedback("Please complete every assignment field.", true);
        return;
    }

    // Update or add the assignment, and show an error if saving fails.
    let savedTask;
    try {
        savedTask = editingTaskId
            ? updateTask(editingTaskId, task)
            : addTask(task);
    } catch (error) {
        showFeedback(`Could not ${editingTaskId ? "update" : "save"} this assignment: ${error.message}`, true);
        return;
    }

    // After saving, clear the form and restore its default interface.
    const wasEditing = Boolean(editingTaskId);
    editingTaskId = null;
    resetForm(form);
    formTitle.textContent = "Add New Assignment";
    submitButton.textContent = "Add Assignment";
    cancelEditButton.hidden = true;
    document.querySelector("#search-input").value = "";
    document.querySelector("#status-filter").value = "All";
    showFeedback(wasEditing ? "Assignment updated." : "Assignment added to your workspace.");
    render();
    navigateToPage("tasks");
    document.querySelector(`#task-${CSS.escape(savedTask.id)}`)?.focus({ preventScroll: true });
});

// Re-render the list whenever the search text or status filter changes.
bindSearch(render);

// Cancel editing and restore the form for adding an assignment.
cancelEditButton.addEventListener("click", () => {
    editingTaskId = null;
    resetForm(form);
    formTitle.textContent = "Add New Assignment";
    submitButton.textContent = "Add Assignment";
    cancelEditButton.hidden = true;
    showFeedback("");
    navigateToPage("tasks");
});

// Use event delegation to handle Edit and Delete actions on task cards.
taskSection.addEventListener("click", (event) => {
    const target = event.target;
    // Ignore clicks unless a task action button was clicked.
    if (!(target instanceof HTMLButtonElement) || !target.dataset.taskAction) {
        return;
    }

    // Find the clicked assignment using the button's task ID.
    const task = state.tasks.find((item) => item.id === target.dataset.taskId);
    if (!task) {
        showNotification("That assignment could not be found.");
        render();
        return;
    }

    // Fill the form with the task's values so the user can edit them.
    if (target.dataset.taskAction === "edit") {
        editingTaskId = task.id;
        formTitle.textContent = "Edit Assignment";
        submitButton.textContent = "Save Changes";
        cancelEditButton.hidden = false;
        document.querySelector("#task-title").value = task.title;
        document.querySelector("#task-subject").value = task.subject;
        document.querySelector("#task-description").value = task.description;
        document.querySelector("#task-due-date").value = task.dueDate;
        document.querySelector("#task-priority").value = task.priority;
        showFeedback(`Editing “${task.title}”.`);
        navigateToPage("add-task");
        document.querySelector("#task-title").focus();
        return;
    }

    // Ask for confirmation before deleting the assignment.
    if (target.dataset.taskAction === "delete") {
        if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) {
            return;
        }

        // Delete the task and show an error if saving fails.
        try {
            deleteTask(task.id);
        } catch (error) {
            showNotification(`Could not delete assignment: ${error.message}`);
            return;
        }

        // If the deleted task was being edited, cancel that edit as well.
        if (editingTaskId === task.id) {
            editingTaskId = null;
            resetForm(form);
            formTitle.textContent = "Add New Assignment";
            submitButton.textContent = "Add Assignment";
            cancelEditButton.hidden = true;
            showFeedback("");
        }

        showNotification(`${task.title} was deleted.`);
        render();
    }
});

// Update the task status when its dropdown changes.
taskSection.addEventListener("change", (event) => {
    const target = event.target;
    // Accept changes only from a status dropdown associated with a task ID.
    if (!(target instanceof HTMLSelectElement) || !target.dataset.taskId) {
        return;
    }

    // Save the status and restore the interface if an error occurs.
    const task = state.tasks.find((item) => item.id === target.dataset.taskId);
    try {
        updateTaskStatus(target.dataset.taskId, target.value);
    } catch (error) {
        showFeedback(`Could not update assignment status: ${error.message}`, true);
        render();
        return;
    }

    // Notify the user about progress and celebrate when the task is completed.
    if (task && (target.value === "In Progress" || target.value === "Completed")) {
        showNotification(`${task.title} is now ${target.value}.`);
    }
    if (target.value === "Completed") {
        celebrateCompletion();
    }
    showFeedback("Assignment status updated.");
    render();
});

// Initialize tasks and render the app; show an error if saved data cannot be loaded.
try {
    initializeTasks();
    render();
} catch (error) {
    showFeedback(`Could not load saved assignments: ${error.message}`, true);
}

// Load settings and show an error on the settings page if they cannot be loaded.
try {
    initializeSettings();
} catch (error) {
    document.querySelector("#settings-feedback").textContent =
        `Could not load your settings: ${error.message}`;
    document.querySelector("#settings-feedback").classList.add("is-error");
}
