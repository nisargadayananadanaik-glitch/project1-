/* =====================================
   StudySync - Smart Study Planner
   ===================================== */

// 1. Select HTML elements
const subjectList = document.getElementById("subject-list");
const subjectCount = document.getElementById("subject-count");

const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const progressPercent = document.getElementById("progress-percent");

const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskSubject = document.getElementById("task-subject");
const taskDate = document.getElementById("task-date");
const taskList = document.getElementById("task-list");

const addSubjectButton = document.getElementById("add-subject-button");

const timerDisplay = document.getElementById("timer-display");
const startTimerButton = document.getElementById("start-timer");
const pauseTimerButton = document.getElementById("pause-timer");
const resetTimerButton = document.getElementById("reset-timer");
const progressChartCanvas = document.getElementById("progress-chart");
const totalTasksElement = document.getElementById("total-tasks");
const analyticsCompletedElement = document.getElementById("analytics-completed");
const analyticsPendingElement = document.getElementById("analytics-pending");
const overdueCountElement = document.getElementById("overdue-count");

const revisionForm = document.getElementById("revision-form");
const revisionTopic = document.getElementById("revision-topic");
const revisionSubject = document.getElementById("revision-subject");
const revisionDate = document.getElementById("revision-date");
const revisionList = document.getElementById("revision-list");

// 2. Load saved information from LocalStorage
function loadData(key, fallback) {
    try {
        const savedData = localStorage.getItem(key);
        return savedData ? JSON.parse(savedData) : fallback;
    } catch (error) {
        console.error("Could not load saved data:", error);
        return fallback;
    }
}

let subjects = loadData("studysync-subjects", [
    {
        name: "Java Programming",
        description: "Learn programming concepts",
        icon: "💻"
    },
    {
        name: "Database Management",
        description: "Practice SQL and DBMS",
        icon: "🗄️"
    },
    {
        name: "Data Structures",
        description: "Understand algorithms",
        icon: "🧠"
    }
]);

let tasks = loadData("studysync-tasks", []);
let revisions = loadData("studysync-revisions", []);

// 3. Save information in LocalStorage
function saveData() {
    try {
        localStorage.setItem(
            "studysync-subjects",
            JSON.stringify(subjects)
        );

        localStorage.setItem(
            "studysync-tasks",
            JSON.stringify(tasks)
        );

        localStorage.setItem(
            "studysync-revisions",
            JSON.stringify(revisions)
        );
    } catch (error) {
        alert("Unable to save data. Check your browser storage.");
        console.error(error);
    }
}

// 4. Display subjects
function renderSubjects() {
    subjectList.replaceChildren();

    subjects.forEach(function (subject) {
        const card = document.createElement("article");
        card.className = "subject-card";

        const icon = document.createElement("span");
        icon.className = "subject-icon";
        icon.textContent = subject.icon;

        const title = document.createElement("h3");
        title.textContent = subject.name;

        const description = document.createElement("p");
        description.textContent = subject.description;

        card.append(icon, title, description);
        subjectList.appendChild(card);
    });

    subjectCount.textContent = subjects.length;
}

// 5. Add a new subject
addSubjectButton.addEventListener("click", function () {
    const name = prompt("Enter your subject name:");

    if (name === null || name.trim() === "") {
        return;
    }

    const subjectName = name.trim();

    const alreadyExists = subjects.some(function (subject) {
        return subject.name.toLowerCase() === subjectName.toLowerCase();
    });

    if (alreadyExists) {
        alert("This subject already exists!");
        return;
    }

    const description = prompt("Enter a short subject description:");

    subjects.push({
        name: subjectName,
        description: description && description.trim()
            ? description.trim()
            : "My study subject",
        icon: "📘"
    });

    saveData();
    renderSubjects();
});

// 6. Display tasks

    taskList.replaceChildren();

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "Your study tasks will appear here. Add your first task!";

        taskList.appendChild(message);
    }

    tasks.forEach(function (task) {
        const item = document.createElement("article");

        item.className = "task-item";

        if (task.completed) {
            item.classList.add("is-complete");
        }

        const details = document.createElement("div");

        const title = document.createElement("h3");
        title.textContent = task.title;

        const information = document.createElement("p");
        information.textContent =
            task.subject + " • Due: " + task.date;

        details.append(title, information);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "complete-button";

        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";

        completeButton.setAttribute(
            "aria-label",
            (task.completed ? "Undo completion of " : "Complete ") +
                task.title
        );

        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveData();
            renderTasks();
            updateDashboard();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            const confirmed = confirm(
                "Delete this task: " + task.title + "?"
            );

            if (!confirmed) {
                return;
            }

            tasks = tasks.filter(function (currentTask) {
                return currentTask.id !== task.id;
            });

            saveData();
            renderTasks();
            updateDashboard();
        });

        actions.append(completeButton, deleteButton);
        item.append(details, actions);
        taskList.appendChild(item);
    });

// 7. Add a new task
function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "Your study tasks will appear here. Add your first task!";

        taskList.appendChild(message);
        return;
    }

    const today = getLocalDateString();

    tasks.forEach(function (task) {
        const item = document.createElement("article");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("is-complete");
        }

        const isOverdue = !task.completed && task.date < today;

        if (isOverdue) {
            item.classList.add("is-overdue");
        }

        const details = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = task.title;

        const information = document.createElement("p");
        information.textContent = task.subject + " • Due: " + task.date;

        if (isOverdue) {
            const alert = document.createElement("p");
            alert.className = "overdue-label";
            alert.textContent = "⚠️ Overdue — please review this task";
            details.append(title, information, alert);
        } else {
            details.append(title, information);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "complete-button";
        completeButton.textContent = task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveData();
            updateDashboard();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            if (!confirm("Delete this task?")) return;

            tasks = tasks.filter(currentTask =>
                currentTask.id !== task.id
            );

            saveData();
            updateDashboard();
        });

        actions.append(completeButton, deleteButton);
        item.append(details, actions);
        taskList.appendChild(item);
    });
}

// 8. Update dashboard statistics
let progressChart = null;

function getLocalDateString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function updateDashboard() {
    const pending = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    const total = tasks.length;

    const progress = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    const today = getLocalDateString();

    const overdue = tasks.filter(task =>
        !task.completed && task.date < today
    ).length;

    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    progressPercent.textContent = progress + "%";

    totalTasksElement.textContent = total;
    analyticsCompletedElement.textContent = completed;
    analyticsPendingElement.textContent = pending;
    overdueCountElement.textContent = overdue;

    if (progressChartCanvas && window.Chart) {
        if (progressChart) {
            progressChart.data.datasets[0].data = [
                completed,
                pending
            ];
            progressChart.update();
        } else {
            progressChart = new Chart(progressChartCanvas, {
                type: "doughnut",
                data: {
                    labels: ["Completed", "Pending"],
                    datasets: [{
                        data: [completed, pending],
                        backgroundColor: ["#159b73", "#bba7ff"],
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "68%",
                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });
        }
    }

    renderTasks();
}

// 9. Focus timer: 25 minutes
const FOCUS_DURATION = 25 * 60;

let remainingSeconds = FOCUS_DURATION;
let timerInterval = null;

function displayTime() {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

startTimerButton.addEventListener("click", function () {
    if (timerInterval !== null) {
        return;
    }

    if (remainingSeconds <= 0) {
        remainingSeconds = FOCUS_DURATION;
        displayTime();
    }

    let previousTime = Date.now();

    timerInterval = setInterval(function () {
        const currentTime = Date.now();

        const elapsedSeconds = Math.floor(
            (currentTime - previousTime) / 1000
        );

        if (elapsedSeconds < 1) {
            return;
        }

        previousTime += elapsedSeconds * 1000;

        remainingSeconds = Math.max(
            0,
            remainingSeconds - elapsedSeconds
        );

        displayTime();

        if (remainingSeconds === 0) {
            stopTimer();
            alert("Great work! Your focus session is complete. 🎉");
        }
    }, 250);
});

pauseTimerButton.addEventListener("click", function () {
    stopTimer();
});

resetTimerButton.addEventListener("click", function () {
    stopTimer();
    remainingSeconds = FOCUS_DURATION;
    displayTime();
});

// 10. Initialize the application
renderSubjects();
renderTasks();
updateDashboard();
displayTime();
function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent =
            "Your study tasks will appear here. Add your first task!";

        taskList.appendChild(message);
        return;
    }

    const today = getLocalDateString();

    tasks.forEach(function (task) {
        const item = document.createElement("article");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("is-complete");
        }

        const isOverdue = !task.completed && task.date < today;

        if (isOverdue) {
            item.classList.add("is-overdue");
        }

        const details = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = task.title;

        const information = document.createElement("p");
        information.textContent = task.subject + " • Due: " + task.date;

        if (isOverdue) {
            const alert = document.createElement("p");
            alert.className = "overdue-label";
            alert.textContent = "⚠️ Overdue — please review this task";
            details.append(title, information, alert);
        } else {
            details.append(title, information);
        }

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeButton = document.createElement("button");
        completeButton.type = "button";
        completeButton.className = "complete-button";
        completeButton.textContent = task.completed ? "Undo" : "Complete";

        completeButton.addEventListener("click", function () {
            task.completed = !task.completed;
            saveData();
            updateDashboard();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            if (!confirm("Delete this task?")) return;

            tasks = tasks.filter(currentTask =>
                currentTask.id !== task.id
            );

            saveData();
            updateDashboard();
        });

        actions.append(completeButton, deleteButton);
        item.append(details, actions);
        taskList.appendChild(item);
    });
}
const themeToggle = document.getElementById("theme-toggle");
const clearTasksButton = document.getElementById("clear-tasks");

// Restore the saved theme
if (localStorage.getItem("studysync-theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("studysync-theme", isDark ? "dark" : "light");
    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Clear all tasks after confirmation
clearTasksButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all tasks?")) {
        tasks = [];
        saveData();
        updateDashboard();
    }
});