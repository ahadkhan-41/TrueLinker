"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BlocklistPage() {
  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);

  async function load() {
    const data = await api.getBlocklist();
    setItems(data.blocklist || []);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function add() {
    if (!value.trim()) return;
    await api.addBlocklist(value.trim());
    setValue("");
    load();
  }

  async function remove(id) {
    await api.removeBlocklist(id);
    load();
  }

  return (
    <div className="stack">
      <h1>Blocklist</h1>
      <section className="card stack">
        <div className="row gap">
          <input className="input" placeholder="Add domain or URL..." value={value} onChange={(e) => setValue(e.target.value)} />
          <button className="btn primary" onClick={add}>Add to Blocklist</button>
        </div>
        <div className="row gap">
          <button className="btn ghost">Import CSV</button>
          <button className="btn ghost">Export</button>
        </div>
      </section>
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Domain/URL</th>
                <th>Added By</th>
                <th>Added At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.value}</td>
                  <td>{item.addedBy}</td>
                  <td>{new Date(item.addedAt).toLocaleString()}</td>
                  <td><button className="btn danger" onClick={() => remove(item.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
