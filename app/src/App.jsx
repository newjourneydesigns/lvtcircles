import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './index.css'

const statuses = ['invite', 'pipeline', 'leader']

function App() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', status: 'invite' })
  const [editForm, setEditForm] = useState({ id: null, full_name: '', phone: '', email: '', status: 'invite' })

  useEffect(() => {
    loadLeaders()
  }, [statusFilter])

  async function loadLeaders() {
    setLoading(true)
    let query = supabase.from('circle_leaders').select('*')
    if (statusFilter) query = query.eq('status', statusFilter)
    const { data, error } = await query
    if (!error && data) setLeaders(data)
    setLoading(false)
  }

  async function addLeader(e) {
    e.preventDefault()
    const { error } = await supabase.from('circle_leaders').insert([form])
    if (!error) {
      setForm({ full_name: '', phone: '', email: '', status: 'invite' })
      loadLeaders()
    }
  }

  function openEdit(leader) {
    setEditForm({ id: leader.id, full_name: leader.full_name || '', phone: leader.phone || '', email: leader.email || '', status: leader.status || 'invite' })
  }

  async function updateLeader(e) {
    e.preventDefault()
    const { id, full_name, phone, email, status } = editForm
    const { error } = await supabase.from('circle_leaders').update({ full_name, phone, email, status }).eq('id', id)
    if (!error) {
      setEditForm({ id: null, full_name: '', phone: '', email: '', status: 'invite' })
      loadLeaders()
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Circle Leader Tracker</h1>

      <div className="form-control w-full max-w-xs">
        <label className="label" htmlFor="filter-status">
          <span className="label-text">Filter by Status</span>
        </label>
        <select id="filter-status" className="select select-bordered" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Last Comm</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leaders.map(l => (
              <tr key={l.id}>
                <td><a href="#" onClick={e => { e.preventDefault(); openEdit(l) }}>{l.full_name}</a></td>
                <td><a href={`tel:${l.phone}`}>{l.phone}</a></td>
                <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                <td>{l.status}</td>
                <td>{l.last_comm_date ? new Date(l.last_comm_date).toLocaleString() : ''}</td>
                <td><button className="btn btn-sm" onClick={() => openEdit(l)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <span className="loading loading-spinner"></span>}
      </div>

      <form onSubmit={addLeader} className="space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">Add New Leader</h2>
        <input className="input input-bordered w-full" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
        <input className="input input-bordered w-full" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
        <input type="email" className="input input-bordered w-full" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <select className="select select-bordered w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-primary" type="submit">Add Leader</button>
      </form>

      {editForm.id && (
        <form onSubmit={updateLeader} className="space-y-2 max-w-md">
          <h2 className="text-xl font-semibold">Edit Leader</h2>
          <input className="input input-bordered w-full" placeholder="Full Name" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} required />
          <input className="input input-bordered w-full" placeholder="Phone" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
          <input type="email" className="input input-bordered w-full" placeholder="Email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
          <select className="select select-bordered w-full" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">Update Leader</button>
            <button className="btn" type="button" onClick={() => setEditForm({ id: null, full_name: '', phone: '', email: '', status: 'invite' })}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  )
}

export default App
