const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const startAllBtn = document.getElementById("startAllBtn");
const timerOverlay = document.getElementById("timerOverlay");
const timerDisplay = document.getElementById("timerDisplay");
const currentTaskTitle = document.getElementById("currentTaskTitle");
const skipBtn = document.getElementById("skipBtn");
const closeTimerBtn = document.getElementById("closeTimerBtn");
const themeToggle = document.getElementById("themeToggle");
const timerProgress = document.getElementById("timerProgress");
const alarmSound = document.getElementById("alarmSound");

let tasks = [];
let sessionQueue = [];
let timerInterval = null;

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ===== Theme toggle =====
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// ===== Add task =====
function addTask(text) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.textContent = text;

  const delBtn = document.createElement("button");
  delBtn.className = "delete-btn";
  delBtn.textContent = "✖";
  delBtn.addEventListener("click", () => {
    li.remove();
    tasks = tasks.filter(t => t.element !== li);
    if (tasks.length === 0) startAllBtn.style.display = "none";
  });

  li.appendChild(delBtn);
  taskList.appendChild(li);
  tasks.push({ text, element: li });
  if (tasks.length === 1) startAllBtn.style.display = "block";
}

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = "";
});

// ===== Start all tasks =====
startAllBtn.addEventListener("click", () => {
  if (tasks.length === 0) {
    alert("Please add tasks first!");
    return;
  }

  // Tạo hàng đợi phiên làm việc
  sessionQueue = [];
  for (let i = 0; i < tasks.length; i++) {
    sessionQueue.push({ type: "task", text: tasks[i].text });
    if (i < tasks.length - 1) {
      sessionQueue.push({ type: "break" });
    }
  }

  startAllBtn.disabled = true;
  timerOverlay.style.display = "flex";
  startNextSession();
});

// ===== Timer logic =====
function startNextSession() {
  if (sessionQueue.length === 0) {
    tasks.forEach(t => t.element.remove());
    tasks = [];
    timerOverlay.style.display = "none";
    startAllBtn.disabled = false;
    startAllBtn.style.display = "none";
    alarmSound.pause();
    alarmSound.currentTime = 0;
    alert("All tasks completed!");
    return;
  }

  const session = sessionQueue.shift();
  const isBreak = session.type === "break";
  const duration = isBreak ? 15*60: 60*60;
  let timeLeft = duration;
  const circumference = 2 * Math.PI * 120;

  timerProgress.style.strokeDasharray = circumference;
  timerProgress.style.strokeDashoffset = circumference;

  currentTaskTitle.textContent = isBreak
    ? "⏸ Break Time - Relax and recharge!"
    : `📝 Task: ${session.text}`;
  timerDisplay.textContent = formatTime(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = formatTime(timeLeft);
    const offset = circumference - (timeLeft / duration) * circumference;
    timerProgress.style.strokeDashoffset = offset;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      alarmSound.play();
      alarmSound.onended = () => {
        startNextSession();
      };
    }
  }, 1000);
}

// ===== Skip button =====
skipBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  alarmSound.pause();
  alarmSound.currentTime = 0;
  startNextSession();
});

// ===== Close timer overlay =====
closeTimerBtn.addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  alarmSound.pause();
  alarmSound.currentTime = 0;
  timerOverlay.style.display = "none";
  startAllBtn.disabled = false;
});

