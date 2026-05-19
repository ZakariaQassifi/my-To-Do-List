let tasks = [];
  let nextId = 1;
  let currentFilter = 'all';

  // LOAD TASKS
  function loadTasks() {
    const saved = localStorage.getItem('tasks');

    if(saved) {
      tasks = JSON.parse(saved);

      nextId = tasks.length
        ? Math.max(...tasks.map(t => t.id)) + 1
        : 1;
    }

    const dark = localStorage.getItem('darkMode');

    if(dark === 'true') {
      document.body.classList.add('dark-mode');
    }
  }

  // SAVE TASKS
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  // DARK MODE
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');

    localStorage.setItem(
      'darkMode',
      document.body.classList.contains('dark-mode')
    );
  }

  // FILTER
  function setFilter(filterType) {

    currentFilter = filterType;

    document
      .querySelectorAll('.nav-item')
      .forEach(item => item.classList.remove('active'));

    document
      .getElementById(`filter-${filterType}`)
      .classList.add('active');

    const titles = {
      all: 'Inbox',
      active: 'Not Done',
      done: 'Completed Tasks'
    };

    document.getElementById('view-title').innerText = titles[filterType];

    document.getElementById('add-trigger').style.display =
  (filterType === 'all') ? 'flex' : 'none';

    renderTasks();
  }

  // SHOW INPUT
  function showInput() {
    document.getElementById('input-area').style.display = 'block';
    document.getElementById('add-trigger').style.display = 'none';
    document.getElementById('task-input').focus();
  }

  // HIDE INPUT
  function hideInput() {

    document.getElementById('input-area').style.display = 'none';

    if(currentFilter === 'all') {
  document.getElementById('add-trigger').style.display = 'flex';
}

    document.getElementById('task-input').value = '';
  }

  // ADD TASK
  function addTask() {

    const input = document.getElementById('task-input');

    if(!input.value.trim()) return;

    const now = new Date();

    const dateStr =
      `${String(now.getDate()).padStart(2, '0')}/` +
      `${String(now.getMonth() + 1).padStart(2, '0')}/` +
      `${now.getFullYear()}`;

    const priority =
      document.getElementById('task-priority').value;

    const deadline =
      document.getElementById('task-deadline').value;

    tasks.push({
      id: nextId++,
      text: input.value.trim(),
      date: dateStr,
      deadline,
      priority,
      done: false
    });

    saveTasks();

    input.value = '';

    document.getElementById('task-deadline').value = '';

    renderTasks();

    notifyUser("Task added successfully!");
  }

  // TOGGLE
  function toggleTask(id) {

    const task = tasks.find(t => t.id === id);

    if(task) {
      task.done = !task.done;
    }

    saveTasks();

    renderTasks();
  }

  // DELETE
  function deleteTask(id) {

    tasks = tasks.filter(t => t.id !== id);

    saveTasks();

    renderTasks();
  }

  // EDIT
  function editTask(id) {

    const task = tasks.find(t => t.id === id);

    const newText = prompt("Edit task:", task.text);

    if(newText && newText.trim()) {
      task.text = newText.trim();

      saveTasks();

      renderTasks();
    }
  }

  // NOTIFICATION
  function notifyUser(message) {

    if(Notification.permission === "granted") {
      new Notification(message);
    }
  }

  // COUNTS
  function updateCounts() {

    document.getElementById('count-all').innerText =
      tasks.length;

    document.getElementById('count-active').innerText =
      tasks.filter(t => !t.done).length;

    document.getElementById('count-done').innerText =
      tasks.filter(t => t.done).length;
  }

  // RENDER
  function renderTasks() {

    const list = document.getElementById('task-list');

    const empty = document.getElementById('empty-state');

    const searchVal =
      document.getElementById('search-input')
      .value
      .toLowerCase();

    let filtered = tasks;

    if(currentFilter === 'active') {
      filtered = tasks.filter(t => !t.done);
    }

    if(currentFilter === 'done') {
      filtered = tasks.filter(t => t.done);
    }

    if(searchVal) {
      filtered = filtered.filter(t =>
        t.text.toLowerCase().includes(searchVal)
      );
    }

    document.getElementById('stats').innerText =
      `${filtered.length} Tasks`;

    updateCounts();

    if(filtered.length === 0) {

      list.innerHTML = '';

      empty.style.display = 'block';

      return;
    }

    empty.style.display = 'none';

    list.innerHTML = filtered.map(task => {

      let displayText = task.text;

      if(searchVal) {

        const regex = new RegExp(`(${searchVal})`, 'gi');

        displayText =
          task.text.replace(regex, '<mark>$1</mark>');
      }

      return `
        <li class="task-item">

          <input type="checkbox"
                 ${task.done ? 'checked' : ''}
                 onchange="toggleTask(${task.id})">

          <span class="task-date">
            ${task.date}
          </span>

          <div class="task-text ${task.done ? 'done' : ''}">

            ${displayText}

            ${
              task.deadline
              ? `<div style="font-size:11px; margin-top:5px; color:#888;">
                  Due: ${task.deadline}
                 </div>`
              : ''
            }

          </div>

          <div class="priority-badge priority-${task.priority}">
            ${task.priority.toUpperCase()}
          </div>

          <div class="task-actions">

            <button class="edit-btn"
                    onclick="editTask(${task.id})">

              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="delete-btn"
                    onclick="deleteTask(${task.id})">

              <i class="fa-solid fa-trash-can"></i>
            </button>

          </div>

        </li>
      `;
    }).join('');
  }

  // KEYBOARD
  document
    .getElementById('task-input')
    .addEventListener('keydown', (e) => {

      if(e.key === 'Enter') addTask();

      if(e.key === 'Escape') hideInput();
    });

  // NOTIFICATION PERMISSION
  if("Notification" in window) {
    Notification.requestPermission();
  }

  loadTasks();

  renderTasks();