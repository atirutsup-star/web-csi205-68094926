import { useEffect, useMemo, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, ChevronsDownIcon, ClockIcon, PlusIcon, TrashIcon, XIcon } from "../components/Icons.jsx";

const TITLES = ["delectus aut autem","quis ut nam facilis et officia qui","fugiat veniam minus","et porro tempora","laboriosam mollitia et enim quasi adipisci quia provident illum","qui ullam ratione quibusdam voluptatem quia omnis","illo expedita consequatur quia in","quo adipisci enim quam ut ab","molestiae perspiciatis ipsa","illo est ratione doloremque quia maiores aut"];
// Fallback data used when jsonplaceholder is unreachable
const initialTodos = () => Array.from({ length: 20 }, (_, i) => ({ id: i + 1, title: TITLES[i % TITLES.length], completed: [3, 7, 9, 10, 11, 12].includes(i) }));

const PAGE_SIZES = [5, 10, 50];

export default function Todos() {
  const [todos, setTodos] = useState(initialTodos);
  const [onlyWaiting, setOnlyWaiting] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");

  // Load todos from the API (keeps the fallback list on failure)
  useEffect(() => {
    let cancelled = false;
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=20")
      .then((r) => { if (!r.ok) throw new Error("API unavailable"); return r.json(); })
      .then((data) => { if (!cancelled) setTodos(data.map((t) => ({ id: t.id, title: t.title, completed: t.completed }))); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => (onlyWaiting ? todos.filter((t) => !t.completed) : todos), [todos, onlyWaiting]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const nextId = todos.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  // Show a sliding window of 3 page numbers around the current page
  const start = Math.max(0, Math.min(current - 2, pages - 3));
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).slice(start, start + 3);

  const toggle = (id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const remove = (id) => setTodos((p) => p.filter((t) => t.id !== id));
  const closeModal = () => { setModal(false); setTitle(""); };
  const add = () => {
    const text = title.trim();
    if (!text) return;
    setTodos((p) => [...p, { id: nextId, title: text, completed: false }]);
    closeModal();
  };

  // Close the modal with Escape
  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <div className="todoWrap">
      <div className="todoControls">
        <label className="switchLabel">
          <input type="checkbox" checked={onlyWaiting} onChange={(e) => { setOnlyWaiting(e.target.checked); setPage(1); }} />
          <span className="switchTrack" />
          <span>Show only waiting</span>
        </label>
        <span className="status waiting">Waiting <ClockIcon size={14} /></span>
        <div className="selectWrap">
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} aria-label="Items per page">
            {PAGE_SIZES.map((n) => <option key={n} value={n}>{n} items per page</option>)}
          </select>
          <ChevronsDownIcon size={14} />
        </div>
      </div>

      <div className="tableScroll">
        <table className="todoTable">
          <thead>
            <tr>
              <th>ID</th>
              <th className="thTitle">Title</th>
              <th className="thDone">
                <span>Completed</span>
                <button className="addBtn" aria-label="Add todo" onClick={() => setModal(true)}><PlusIcon size={14} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td><span className="idBadge">{t.id}</span></td>
                <td>{t.title}</td>
                <td>
                  <div className="rowActions">
                    <button className={t.completed ? "status done" : "status waiting"} onClick={() => toggle(t.id)}>
                      {t.completed ? <>Done <CheckIcon size={14} /></> : <>Waiting <ClockIcon size={14} /></>}
                    </button>
                    <button className="deleteBtn" aria-label="Delete" onClick={() => remove(t.id)}><TrashIcon size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="3" className="emptyRow">No todos</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="pageBtn edge" disabled={current === 1} onClick={() => setPage(1)}>First</button>
        <button className="pageBtn edge" aria-label="Previous" disabled={current === 1} onClick={() => setPage(current - 1)}><ArrowLeftIcon size={16} /></button>
        {numbers.map((n) => (
          <button key={n} className={n === current ? "pageBtn activePage" : "pageBtn"} onClick={() => setPage(n)}>{n}</button>
        ))}
        <button className="pageBtn edge" aria-label="Next" disabled={current === pages} onClick={() => setPage(current + 1)}><ArrowRightIcon size={16} /></button>
        <button className="pageBtn edge" disabled={current === pages} onClick={() => setPage(pages)}>Last</button>
      </div>

      {modal && (
        <div className="modalBackdrop" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modalHead">
              <h3><PlusIcon size={18} /> Add Todo</h3>
              <button className="modalClose" aria-label="Close" onClick={closeModal}><XIcon size={18} /></button>
            </div>
            <label>ID (Auto-generate)<input disabled value={nextId} /></label>
            <label>Title<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Enter task title" /></label>
            <div className="actions end">
              <button onClick={closeModal}>Cancel</button>
              <button className="primary" disabled={!title.trim()} onClick={add}>Add todo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
