// Filter assignments by the search text and status selected by the user.
export function getVisibleTasks(tasks) {
    // Read the search term, trim extra spaces, and convert it to lowercase.
    const query = document.querySelector("#search-input").value.trim().toLowerCase();
    // Read the currently selected status filter.
    const status = document.querySelector("#status-filter").value;

    // Keep only assignments matching both the search and status filter.
    return tasks.filter((task) => {
        // Search the title, subject, and description for the query.
        const matchesQuery = [task.title, task.subject, task.description]
            .some((value) => value.toLowerCase().includes(query));
        // "All" matches every status; otherwise the status must match exactly.
        const matchesStatus = status === "All" || task.status === status;

        return matchesQuery && matchesStatus;
    });
}

// Call the render callback whenever the search or status filter changes.
export function bindSearch(onChange) {
    document.querySelector("#search-input").addEventListener("input", onChange);
    document.querySelector("#status-filter").addEventListener("change", onChange);
}