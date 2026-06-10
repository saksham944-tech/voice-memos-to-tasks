// Selecting HTML elements
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const downloadBtn = document.getElementById("downloadBtn");

const statusText = document.getElementById("status");
const transcriptBox = document.getElementById("transcript");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const themeBtn = document.getElementById("themeBtn");

// This array will store all tasks
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "All";
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

window.addEventListener("load", function () {
  if (document.body.classList.contains("light-mode")) {
    themeBtn.textContent = "🌙 Dark Mode";
  } else {
    themeBtn.textContent = "☀️ Light Mode";
  }
});

// Show saved tasks when page opens
renderTasks();

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  // Language: English India
  recognition.lang = "en-IN";

  // Continuous means it keeps listening
  recognition.continuous = true;

  // Interim results false means final text only
  recognition.interimResults = false;

  recognition.onstart = function () {
    statusText.textContent = "Listening... speak now 🎙️";
  };

  recognition.onresult = function (event) {
    let spokenText = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      spokenText += event.results[i][0].transcript;
    }

    transcriptBox.value += spokenText + " ";
  };

  recognition.onerror = function (event) {
    statusText.textContent = "Error: " + event.error;
  };

  recognition.onend = function () {
    statusText.textContent = "Stopped listening.";
  };

} else {
  statusText.textContent = "Speech recognition is not supported in this browser. Try Chrome.";
}

// Start speaking button
startBtn.addEventListener("click", function () {
  if (recognition) {
    recognition.start();
  }
});

// Stop speaking button
stopBtn.addEventListener("click", function () {
  if (recognition) {
    recognition.stop();
  }
});

// Convert spoken text to tasks
convertBtn.addEventListener("click", function () {
  const text = transcriptBox.value.trim();

  if (text === "") {
    alert("Please speak or type something first.");
    return;
  }

  const newTasks = extractTasks(text);

  tasks = [...tasks, ...newTasks];

  saveTasks();
  renderTasks();

  transcriptBox.value = "";
});

// Clear all tasks
clearBtn.addEventListener("click", function () {
  tasks = [];
  saveTasks();
  renderTasks();
});

downloadBtn.addEventListener("click", function () {
  downloadTasks();
});

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("light-mode");

  if (document.body.classList.contains("light-mode")) {
    themeBtn.textContent = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  } else {
    themeBtn.textContent = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  }
});

searchInput.addEventListener("input", function () {
  renderTasks();
});

// Function to extract tasks from sentence
function extractTasks(text) {
  let parts = text
    .split(/,| and | then | also |\.|;/i)
    .map(item => item.trim())
    .filter(item => item.length > 0);

  let extracted = parts.map(item => {
    return {
      text: cleanTaskText(item),
      date: detectDate(item),
      time: detectTime(item),
      priority: detectPriority(item),
      category: detectCategory(item),
      done: false
    };
  });

  return extracted;
}

// Function to clean unnecessary words
function cleanTaskText(task) {
  return task
    .replace(/^i need to /i, "")
    .replace(/^i have to /i, "")
    .replace(/^remind me to /i, "")
    .replace(/^please /i, "")

    // Remove dates
    .replace(/today/ig, "")
    .replace(/tomorrow/ig, "")
    .replace(/monday/ig, "")
    .replace(/tuesday/ig, "")
    .replace(/wednesday/ig, "")
    .replace(/thursday/ig, "")
    .replace(/friday/ig, "")
    .replace(/saturday/ig, "")
    .replace(/sunday/ig, "")

    // Remove priority words properly
    .replace(/urgently/ig, "")
    .replace(/urgent/ig, "")
    .replace(/important/ig, "")
    .replace(/asap/ig, "")
    .replace(/quickly/ig, "")

    // Remove time
    .replace(/\b\d{1,2}(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)\b/ig, "")

    // Remove small connector words
    .replace(/\b(at|on|by)\b/ig, "")

    // Remove extra spaces
    .replace(/\s+/g, " ")
    .trim();
}

function detectDate(task) {
  const lowerTask = task.toLowerCase();

  if (lowerTask.includes("today")) {
    return "Today";
  }

  if (lowerTask.includes("tomorrow")) {
    return "Tomorrow";
  }

  if (lowerTask.includes("monday")) {
    return "Monday";
  }

  if (lowerTask.includes("tuesday")) {
    return "Tuesday";
  }

  if (lowerTask.includes("wednesday")) {
    return "Wednesday";
  }

  if (lowerTask.includes("thursday")) {
    return "Thursday";
  }

  if (lowerTask.includes("friday")) {
    return "Friday";
  }

  if (lowerTask.includes("saturday")) {
    return "Saturday";
  }

  if (lowerTask.includes("sunday")) {
    return "Sunday";
  }

  return "No date";
}

function detectTime(task) {
  const timePattern = /\b(\d{1,2})(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)\b/i;

  const match = task.match(timePattern);

  if (match) {
    return match[0].toUpperCase().replace(/\./g, "");
  }

  return "No time";
}

function detectPriority(task) {
  const lowerTask = task.toLowerCase();

  if (
    lowerTask.includes("urgent") ||
    lowerTask.includes("urgently") ||
    lowerTask.includes("important") ||
    lowerTask.includes("asap") ||
    lowerTask.includes("quickly")
  ) {
    return "High";
  }

  return "Normal";
}

function detectCategory(task) {
  const lowerTask = task.toLowerCase();

  if (
    lowerTask.includes("assignment") ||
    lowerTask.includes("homework") ||
    lowerTask.includes("study") ||
    lowerTask.includes("exam") ||
    lowerTask.includes("project") ||
    lowerTask.includes("revision") ||
    lowerTask.includes("dsa") ||
    lowerTask.includes("coding")
  ) {
    return "Study";
  }

  if (
    lowerTask.includes("call") ||
    lowerTask.includes("message") ||
    lowerTask.includes("email") ||
    lowerTask.includes("text") ||
    lowerTask.includes("reply")
  ) {
    return "Communication";
  }

  if (
    lowerTask.includes("buy") ||
    lowerTask.includes("order") ||
    lowerTask.includes("purchase") ||
    lowerTask.includes("shop")
  ) {
    return "Shopping";
  }

  if (
    lowerTask.includes("gym") ||
    lowerTask.includes("workout") ||
    lowerTask.includes("walk") ||
    lowerTask.includes("run") ||
    lowerTask.includes("exercise")
  ) {
    return "Health";
  }

  if (
    lowerTask.includes("clean") ||
    lowerTask.includes("wash") ||
    lowerTask.includes("laundry") ||
    lowerTask.includes("room")
  ) {
    return "Home";
  }

  if (
    lowerTask.includes("report") ||
    lowerTask.includes("meeting") ||
    lowerTask.includes("submit") ||
    lowerTask.includes("presentation")
  ) {
    return "Work";
  }

  return "General";
}

// Save tasks in browser storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Show tasks on screen
function renderTasks() {
  
  taskList.innerHTML = "";

  const searchText = searchInput.value.toLowerCase();

  let filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.text.toLowerCase().includes(searchText) ||
      task.date.toLowerCase().includes(searchText) ||
      task.time.toLowerCase().includes(searchText) ||
      task.priority.toLowerCase().includes(searchText) ||
      task.category.toLowerCase().includes(searchText);

    const matchesFilter =
      currentFilter === "All" ||
      (currentFilter === "High" && task.priority === "High") ||
      task.category === currentFilter;

    return matchesSearch && matchesFilter;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = "<p>No tasks found for this filter.</p>";
    return;
  }

  filteredTasks.forEach((task) => {
    const realIndex = tasks.indexOf(task);

    const li = document.createElement("li");

    if (task.done) {
      li.classList.add("done");
    }

    li.innerHTML = `
      <div>
        <span>${task.text}</span>
        <p class="task-meta">
          📅 ${task.date || "No date"} | ⏰ ${task.time || "No time"} | ⚡ ${task.priority || "Normal"} | 🏷️ ${task.category || "General"}
        </p>
      </div>

      <div class="task-actions">
        <button onclick="toggleTask(${realIndex})">
          ${task.done ? "Undo" : "Done"}
        </button>
        <button onclick="editTask(${realIndex})">Edit</button>
        <button onclick="deleteTask(${realIndex})">Delete</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// Mark task as done / not done
function toggleTask(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

// Delete one task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;
  renderTasks();
}

function editTask(index) {
  const newTaskText = prompt("Edit your task:", tasks[index].text);

  if (newTaskText === null) {
    return;
  }

  if (newTaskText.trim() === "") {
    alert("Task cannot be empty.");
    return;
  }

  tasks[index].text = newTaskText.trim();

  saveTasks();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.done).length;
  const pending = total - completed;

  totalTasks.textContent = `Total: ${total}`;
  completedTasks.textContent = `Completed: ${completed}`;
  pendingTasks.textContent = `Pending: ${pending}`;
}

function downloadTasks() {
  if (tasks.length === 0) {
    alert("No tasks to download.");
    return;
  }

  let fileContent = "Voice Memos to Tasks - Task List\n\n";

  tasks.forEach((task, index) => {
    fileContent += `${index + 1}. ${task.text}\n`;
    fileContent += `Date: ${task.date || "No date"}\n`;
    fileContent += `Time: ${task.time || "No time"}\n`;
    fileContent += `Priority: ${task.priority || "Normal"}\n`;
    fileContent += `Category: ${task.category || "General"}\n`;
    fileContent += `Status: ${task.done ? "Completed" : "Pending"}\n`;
    fileContent += "-------------------------\n";
  });

  const blob = new Blob([fileContent], { type: "text/plain" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "my-tasks.txt";

  link.click();

  URL.revokeObjectURL(link.href);
}