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

let tasks = [];
let currentIndex = 0;
let timerInterval = null;
let isBreak = false;

function formatTime(sec){
  const m=Math.floor(sec/60).toString().padStart(2,"0");
  const s=(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

// ===== Theme toggle =====
themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// ===== Add task =====
function addTask(text){
  const li = document.createElement("li");
  li.className="task-item";
  li.textContent=text;

  const delBtn = document.createElement("button");
  delBtn.className="delete-btn";
  delBtn.textContent="✖";
  delBtn.addEventListener("click",()=>{
    li.remove();
    tasks = tasks.filter(t=>t.element!==li);
    if(tasks.length===0) startAllBtn.style.display="none";
  });

  li.appendChild(delBtn);
  taskList.appendChild(li);
  tasks.push({text, element: li});
  if(tasks.length===1) startAllBtn.style.display="block";
}

taskInput.addEventListener("keypress",(e)=>{
  if(e.key==="Enter") addBtn.click();
});

addBtn.addEventListener("click", ()=>{
  const text = taskInput.value.trim();
  if(!text) return;
  addTask(text);
  taskInput.value="";
});

// ===== Timer =====
function startNext(){
  if(currentIndex>=tasks.length && !isBreak){
    timerOverlay.style.display="none";
    startAllBtn.disabled=false;
    currentIndex=0;
    isBreak=false;
    alert("All tasks completed!");
    return;
  }

  let duration = isBreak ? 15*60 : 60*60;
  let timeLeft = duration;
  const circumference = 2*Math.PI*120;

  timerProgress.style.strokeDasharray = circumference;
  timerProgress.style.strokeDashoffset = circumference;

  timerOverlay.style.display="flex";
  currentTaskTitle.textContent = isBreak ? "Break" : tasks[currentIndex].text;
  timerDisplay.textContent = formatTime(timeLeft);

  timerInterval = setInterval(()=>{
    timeLeft--;
    timerDisplay.textContent = formatTime(timeLeft);
    const offset = circumference - (timeLeft/duration)*circumference;
    timerProgress.style.strokeDashoffset = offset;

    if(timeLeft<=0){
      clearInterval(timerInterval);
      timerInterval=null;
      if(!isBreak) isBreak=true;
      else { isBreak=false; currentIndex++; }
      startNext();
    }
  },1000);
}

// Skip button
skipBtn.addEventListener("click", ()=>{
  clearInterval(timerInterval);
  timerInterval=null;
  if(!isBreak) currentIndex++;
  isBreak=false;

  if(currentIndex>=tasks.length){
    timerOverlay.style.display="none";
    startAllBtn.disabled=false;
    currentIndex=0;
    isBreak=false;
    alert("All tasks completed!");
  } else {
    startNext();
  }
});

// Close timer overlay
closeTimerBtn.addEventListener("click", ()=>{
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval=null;
  }
  timerOverlay.style.display="none";
  startAllBtn.disabled=false;
});

// Start all tasks
startAllBtn.addEventListener("click", ()=>{
  if(tasks.length===0){ alert("Please add tasks first!"); return;}
  startAllBtn.disabled=true;
  currentIndex=0;
  isBreak=false;
  startNext();
});
