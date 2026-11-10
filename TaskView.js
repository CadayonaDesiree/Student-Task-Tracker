// Status values shown in each task card's dropdown.
const STATUSES = ["Pending", "In Progress", "Completed"];

// Create an HTML element with an optional class and text.
function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
        element.className = className;
    }
    if (text !== undefined) {
        element.textContent = text;
    }
    return element;
}

// Format the due date using the browser's locale.
function formatDueDate(value) {
    const date = new Date(`${value}T00:00:00`);
    return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    }).format(date);
}

// Format the completion date, or show that no date was saved.
function formatCompletionDate(value) {
    if (!value) {
        return "Completion date not recorded";
    }

    return `Finished ${new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value))}`;
}

// Create an assignment card with its details, status, and actions.
function createTaskCard(task) {
    const card = createElement("article", `task-card status-${task.status.toLowerCase().replaceAll(" ", "-")}`);
    card.id = `task-${task.id}`;
    card.tabIndex = -1;

    const heading = createElement("div", "task-card-heading");
    const titleGroup = createElement("div", "task-title-group");
    titleGroup.append(
        createElement("h3", "task-title", task.title),
        createElement("p", "task-subject", task.subject)
    );

    const priority = createElement("span", `task-priority priority-${task.priority.toLowerCase()}`, `${task.priority} priority`);
    heading.append(titleGroup, priority);

    const description = createElement("p", "task-description", task.description);
    const footer = createElement("div", "task-card-footer");
    // Show the completion date or due date depending on the task status.
    const dateText = task.status === "Completed"
        ? formatCompletionDate(task.completedAt)
        : `Due ${formatDueDate(task.dueDate)}`;
    footer.append(createElement("p", "task-due-date", dateText));

    const statusLabel = createElement("label", "task-status-label", "Status");
    const statusSelect = document.createElement("select");
    statusSelect.className = "task-status-select";
    statusSelect.dataset.taskId = task.id;
    statusSelect.setAttribute("aria-label", `Status for ${task.title}`);

    // Create an option for each status and select the task's current status.
    STATUSES.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        option.selected = status === task.status;
        statusSelect.append(option);
    });

    statusLabel.append(statusSelect);
    footer.append(statusLabel);

    const actions = createElement("div", "task-card-actions");
    // Add data attributes so event handlers can identify each action and task.
    const editButton = createElement("button", "task-action task-edit", "Edit");
    editButton.type = "button";
    editButton.dataset.taskAction = "edit";
    editButton.dataset.taskId = task.id;
    editButton.setAttribute("aria-label", `Edit ${task.title}`);

    const deleteButton = createElement("button", "task-action task-delete", "Delete");
    deleteButton.type = "button";
    deleteButton.dataset.taskAction = "delete";
    deleteButton.dataset.taskId = task.id;
    deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

    actions.append(editButton, deleteButton);
    footer.append(actions);
    card.append(heading, description, footer);
    return card;
}

// Show task cards, or an empty-state message when the list has no tasks.
export function renderTasks(container, tasks, emptyMessage) {
    const fragment = document.createDocumentFragment();

    // Create an empty-state message or a card for every task.
    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = emptyMessage;
        fragment.append(message);
    } else {
        tasks.forEach((task) => fragment.append(createTaskCard(task)));
    }

    container.replaceChildren(fragment);
}

// Update the dashboard counts using the complete assignment list.
export function renderStats(tasks) {
    document.querySelector("#total-tasks").textContent = tasks.length;
    document.querySelector("#pending-tasks").textContent =
        tasks.filter((task) => task.status === "Pending").length;
    document.querySelector("#progress-tasks").textContent =
        tasks.filter((task) => task.status === "In Progress").length;
    document.querySelector("#completed-tasks").textContent =
        tasks.filter((task) => task.status === "Completed").length;
    document.querySelector("#completed-task-count").textContent =
        tasks.filter((task) => task.status === "Completed").length;
}