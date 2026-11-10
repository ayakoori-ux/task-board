const { useState, useEffect } = React;

// localStorage に保存するときのキー
const STORAGE_KEY = 'tasks';

// 保存済みのタスクを読み込む（データが無い・壊れている場合は空配列）
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// タスクを一意に識別するための ID を作る
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// タスク追加フォーム
function TaskForm({ onAdd }) {
  const [text, setText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed === '') return; // 空のタスクは追加しない
    onAdd(trimmed);
    setText('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-input" className="visually-hidden">
        新しいタスク
      </label>
      <input
        id="task-input"
        className="task-input"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="タスクを入力"
        autoComplete="off"
      />
      <button type="submit" className="add-button" disabled={text.trim() === ''}>
        追加
      </button>
    </form>
  );
}

// タスク1件分の表示
function TaskItem({ task, onToggle, onDelete }) {
  const checkboxId = `task-${task.id}`;

  return (
    <li className={task.done ? 'task-item is-done' : 'task-item'}>
      <input
        id={checkboxId}
        className="task-checkbox"
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <label htmlFor={checkboxId} className="task-text">
        {task.text}
      </label>
      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(task.id)}
        aria-label={`「${task.text}」を削除`}
      >
        削除
      </button>
    </li>
  );
}

// アプリ全体
function App() {
  // 初回表示時だけ localStorage から読み込む
  const [tasks, setTasks] = useState(loadTasks);

  // タスクが変わるたびに localStorage に保存する
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // プライベートブラウズなどで保存できない場合は何もしない
    }
  }, [tasks]);

  const addTask = (text) => {
    setTasks((prev) => [...prev, { id: createId(), text, done: false }]);
  };

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <main className="board">
      <header className="board-header">
        <h1 className="board-title">タスクボード</h1>
        <p className="board-count">
          完了 {doneCount} / 全 {tasks.length} 件
        </p>
      </header>

      <TaskForm onAdd={addTask} />

      {tasks.length === 0 ? (
        <p className="empty-message">タスクはまだありません。</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
          ))}
        </ul>
      )}
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
