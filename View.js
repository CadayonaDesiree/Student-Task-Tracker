// Read and trim the values entered in the assignment form.
export function getFormValues() {
    return {
        title: document.querySelector("#task-title").value.trim(),
        subject: document.querySelector("#task-subject").value.trim(),
        description: document.querySelector("#task-description").value.trim(),
        dueDate: document.querySelector("#task-due-date").value,
        priority: document.querySelector("#task-priority").value
    };
}

// Reset every form field to its default value.
export function resetForm(form) {
    form.reset();
}

// Show a message below the form and mark it as an error when needed.
export function showFeedback(message, isError = false) {
    const feedback = document.querySelector("#task-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
}

// Timers used to replace any existing notification or celebration timer.
let notificationTimeout;
let celebrationTimeout;

// Show a temporary message on the screen.
export function showNotification(message) {
    const notification = document.querySelector("#task-notification");
    notification.textContent = message;
    notification.hidden = false;

    clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
        notification.hidden = true;
    }, 4000);
}

// Show confetti when motion effects are allowed.
export function celebrateCompletion() {
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
        || document.documentElement.dataset.reduceMotion === "true"
    ) {
        return;
    }

    const celebration = document.querySelector("#completion-confetti");
    // Colors cycled through the confetti pieces.
    const colors = ["#7667e8", "#4b9fe1", "#48ad83", "#e2a543", "#f0788b"];
    const fragment = document.createDocumentFragment();

    // Create 40 pieces so the document can be updated in one operation.
    for (let index = 0; index < 40; index += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        // Set an individual color, drift, rotation, delay, and duration for each piece.
        piece.style.setProperty("--confetti-color", colors[index % colors.length]);
        piece.style.setProperty("--confetti-drift", `${Math.round(Math.random() * 110 - 55)}vw`);
        piece.style.setProperty("--confetti-spin", `${Math.round(Math.random() * 900 + 360)}deg`);
        piece.style.setProperty("--confetti-delay", `${Math.random() * 0.35}s`);
        piece.style.setProperty("--confetti-duration", `${1.7 + Math.random() * 0.9}s`);
        fragment.append(piece);
    }

    // Clear the previous animation and start the new one.
    clearTimeout(celebrationTimeout);
    celebration.replaceChildren(fragment);
    celebration.hidden = false;
    celebrationTimeout = setTimeout(() => {
        // Remove the elements after the animation to keep the DOM clean.
        celebration.replaceChildren();
        celebration.hidden = true;
    }, 3200);
}