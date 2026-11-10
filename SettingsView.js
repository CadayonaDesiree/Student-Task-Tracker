// Storage key and default values for display settings saved in the browser.
const STORAGE_KEY = "student-task-tracker.settings";
const DEFAULT_SETTINGS = {
    theme: "light",
    fontSize: "1",
    reduceMotion: false
};
// Allowed values for the theme and text size.
const VALID_THEMES = ["light", "dark", "system"];
const VALID_FONT_SIZES = ["0.9", "1", "1.1", "1.2"];
// Check whether the device currently prefers the dark theme.
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

// Read and validate saved settings, or use the defaults if none have been saved.
function readSettings() {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings === null) {
        return { ...DEFAULT_SETTINGS };
    }

    // Parse the data and verify that each setting is valid.
    const parsedSettings = JSON.parse(savedSettings);
    if (
        !parsedSettings
        || !VALID_THEMES.includes(parsedSettings.theme)
        || !VALID_FONT_SIZES.includes(parsedSettings.fontSize)
        || typeof parsedSettings.reduceMotion !== "boolean"
    ) {
        throw new Error("Saved display settings are invalid.");
    }

    return parsedSettings;
}

// Apply the theme, text scale, and motion preference to the HTML root.
function applySettings(settings) {
    // Resolve the system theme if that is what the user selected.
    const theme = settings.theme === "system"
        ? (systemTheme.matches ? "dark" : "light")
        : settings.theme;

    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.reduceMotion = String(settings.reduceMotion);
    document.documentElement.style.setProperty("--font-scale", settings.fontSize);
}

// Show a message on the settings page and toggle its error styling.
function setSettingsFeedback(message, isError = false) {
    const feedback = document.querySelector("#settings-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
}

// Show one page and update its navigation state.
function showPage(pageId, shouldScroll = false) {
    const targetPage = document.getElementById(pageId);
    // Do not navigate if the element is missing or is not a page.
    if (!targetPage?.classList.contains("page-view")) {
        return;
    }

    // Hide every other page so only the target page is visible.
    document.querySelectorAll(".page-view").forEach((page) => {
        page.hidden = page !== targetPage;
    });

    // Mark the current page link for styling and accessibility.
    document.querySelectorAll(".navigation a").forEach((link) => {
        const isCurrent = link.hash === `#${pageId}`;
        link.classList.toggle("active", isCurrent);
        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}

// Update the URL hash and show the page selected in the navigation.
export function navigateToPage(pageId) {
    if (window.location.hash !== `#${pageId}`) {
        window.location.hash = pageId;
    }
    showPage(pageId, true);
}

// Load the settings, sync the controls, and register their event handlers.
export function initializeSettings() {
    const themeSelect = document.querySelector("#theme-setting");
    const fontSizeSelect = document.querySelector("#font-size-setting");
    const motionToggle = document.querySelector("#motion-setting");
    // Read the current settings before displaying their values in the controls.
    let settings = readSettings();

    themeSelect.value = settings.theme;
    fontSizeSelect.value = settings.fontSize;
    motionToggle.checked = settings.reduceMotion;
    applySettings(settings);

    // Save the newly selected values and apply them to the page.
    const saveAndApplySettings = () => {
        const nextSettings = {
            theme: themeSelect.value,
            fontSize: fontSizeSelect.value,
            reduceMotion: motionToggle.checked
        };

        // Show an error if the browser cannot save the settings.
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings));
        } catch (error) {
            setSettingsFeedback(`Could not save your settings: ${error.message}`, true);
            return;
        }

        settings = nextSettings;
        applySettings(settings);
        setSettingsFeedback("Your settings have been saved.");
    };

    themeSelect.addEventListener("change", saveAndApplySettings);
    fontSizeSelect.addEventListener("change", saveAndApplySettings);
    motionToggle.addEventListener("change", saveAndApplySettings);

    // Update the appearance if the system theme changes while "system" is selected.
    systemTheme.addEventListener("change", () => {
        if (settings.theme === "system") {
            applySettings(settings);
        }
    });

    // Sync the displayed page with the URL when the browser hash changes.
    window.addEventListener("hashchange", () => {
        const pageId = window.location.hash.slice(1) || "dashboard";
        showPage(pageId, true);
    });
    showPage(window.location.hash.slice(1) || "dashboard");
}
