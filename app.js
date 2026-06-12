// ====== Storage helpers ======
const STORAGE_KEY = "my-todo-items";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load todos", e);
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// ====== State ======
let todos = loadTodos();
let currentFilter = "all";

// ====== Elements ======
const form = document.getElementById("todoForm");
const input = document.getElementById("todoInput");
const list = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const itemsLeft = document.getElementById("itemsLeft");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");
const todayDate = document.getElementById("todayDate");

// ====== Helpers ======
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function setTodayDate() {
  const options = { weekday: "long", month: "long", day: "numeric" };
  todayDate.textContent = new Date().toLocaleDateString(undefined, options);
}

function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.done);
  if (currentFilter === "completed") return todos.filter((t) => t.done);
  return todos;
}

// ====== Render ======
function render() {
  const filtered = getFilteredTodos();

  list.innerHTML = "";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("div");
    checkbox.className = "checkbox";
    checkbox.addEventListener("click", () => toggleTodo(todo.id));

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = "✕";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  // Empty state
  emptyState.classList.toggle("visible", filtered.length === 0);

  // Items left counter
  const activeCount = todos.filter((t) => !t.done).length;
  itemsLeft.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;
}

// ====== Actions ======
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: uid(),
    text: trimmed,
    done: false,
    createdAt: Date.now(),
  });

  saveTodos(todos);
  render();
}

function toggleTodo(id) {
  todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  saveTodos(todos);
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos(todos);
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.done);
  saveTodos(todos);
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
  render();
}

// ====== Event Listeners ======
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

// ====== Init ======
setTodayDate();
render();

// ====== Register Service Worker (for offline support) ======
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .catch((err) => console.log("Service worker registration failed:", err));
  });
}
