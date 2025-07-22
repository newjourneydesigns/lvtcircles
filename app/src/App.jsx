import { useEffect, useState, Fragment } from 'react'
import { supabase } from './supabaseClient'
import './index.css'

const statuses = ['invite', 'pipeline', 'leader']

function App() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', status: 'invite' })
  const [editForm, setEditForm] = useState({ id: null, full_name: '', phone: '', email: '', status: 'invite' })
  const [comments, setComments] = useState([])
  const [showCommModal, setShowCommModal] = useState(false)
  const [commForm, setCommForm] = useState({ leader_id: null, date: '', type: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

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
    fetchComments(leader.id)
    setExpandedId(leader.id)
  }

  async function fetchComments(id) {
    const { data, error } = await supabase
      .from('circle_comments')
      .select('id, comment, created_at')
      .eq('leader_id', id)
      .order('created_at', { ascending: false })
    if (!error && data) setComments(data)
  }

  function openCommModal(leader) {
    const today = new Date().toISOString().split('T')[0]
    setCommForm({ leader_id: leader.id, date: today, type: leader.last_comm_type || '' })
    setShowCommModal(true)
  }

  async function logCommunication(e) {
    e.preventDefault()
    const { leader_id, date, type } = commForm
    const commentText = `Meeting: ${type} on ${date}`
    await supabase.from('leader_meetings').insert({ leader_id, type, date })
    await supabase.from('circle_comments').insert({ leader_id, comment: commentText })
    await supabase
      .from('circle_leaders')
      .update({ last_comm_date: date, last_comm_type: type })
      .eq('id', leader_id)
    setShowCommModal(false)
    setCommForm({ leader_id: null, date: '', type: '' })
    loadLeaders()
    if (editForm.id === leader_id) fetchComments(leader_id)
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

  const seedData = [
    { full_name: 'Mike Swan', phone: '555-123-4567', email: 'mike@example.com', status: 'leader' },
    { full_name: 'Linsey Shields', phone: '555-987-6543', email: 'linsey@example.com', status: 'pipeline' },
    { full_name: 'Jimmy McAfee', phone: '555-333-1212', email: 'jimmy@example.com', status: 'invite' },
    { full_name: 'Pat Bowles', phone: '555-777-8888', email: 'pat@example.com', status: 'leader' },
  ]

  async function seedDatabase() {
    await supabase.from('circle_leaders').insert(seedData)
    loadLeaders()
  }

  async function resetDatabase() {
    await supabase.from('circle_leaders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await seedDatabase()
  }

  async function addComment(e) {
    e.preventDefault()
    if (!commentText || !expandedId) return
    const { data, error } = await supabase
      .from('circle_comments')
      .insert({ leader_id: expandedId, comment: commentText })
      .select()
      .single()
    if (!error && data) {
      setComments([data, ...comments])
      setCommentText('')
    }
  }

  function startEditComment(c) {
    setEditingCommentId(c.id)
    setEditingText(c.comment)
  }

  async function saveEditComment(id) {
    const { data, error } = await supabase
      .from('circle_comments')
      .update({ comment: editingText })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setComments(comments.map(c => (c.id === id ? data : c)))
      setEditingCommentId(null)
      setEditingText('')
    }
  }

  async function deleteComment(id) {
    const { error } = await supabase.from('circle_comments').delete().eq('id', id)
    if (!error) {
      setComments(comments.filter(c => c.id !== id))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Circle Leader Tracker</h1>
      <p className="mt-2 font-semibold">Loaded {leaders.length} leaders</p>
      <div className="flex gap-2">
        <button className="btn btn-secondary" onClick={seedDatabase}>Seed Data</button>
        <button className="btn btn-secondary" onClick={resetDatabase}>Reset Data</button>
      </div>

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
              <Fragment key={l.id}>
                <tr>
                  <td><a href="#" onClick={e => { e.preventDefault(); openEdit(l) }}>{l.full_name}</a></td>
                  <td><a href={`tel:${l.phone}`}>{l.phone}</a></td>
                  <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                  <td>{l.status}</td>
                  <td>
                    {l.last_comm_date ? (
                      <button className="link" onClick={() => openCommModal(l)}>
                        {new Date(l.last_comm_date).toLocaleDateString()} {l.last_comm_type ? `(${l.last_comm_type})` : ''}
                      </button>
                    ) : (
                      <button className="link" onClick={() => openCommModal(l)}>Add</button>
                    )}
                  </td>
                  <td><button className="btn btn-sm" onClick={() => openEdit(l)}>Edit</button></td>
                </tr>
                {expandedId === l.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Comments</h3>
                        <ul className="list-disc pl-5 space-y-1">
                          {comments.map(c => (
                            <li key={c.id} className="flex gap-2 items-start">
                              {editingCommentId === c.id ? (
                                <>
                                  <input className="input input-bordered flex-grow" value={editingText} onChange={e => setEditingText(e.target.value)} />
                                  <button className="btn btn-xs" onClick={() => saveEditComment(c.id)}>Save</button>
                                  <button className="btn btn-xs" onClick={() => { setEditingCommentId(null); setEditingText('') }}>Cancel</button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-grow">{c.comment} ({new Date(c.created_at).toLocaleDateString()})</span>
                                  <button className="btn btn-xs" onClick={() => startEditComment(c)}>Edit</button>
                                  <button className="btn btn-xs" onClick={() => deleteComment(c.id)}>Delete</button>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                        <form onSubmit={addComment} className="flex gap-2">
                          <input className="input input-bordered flex-grow" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="New comment" />
                          <button className="btn btn-primary btn-sm" type="submit">Add</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
        {loading && <span className="loading loading-spinner"></span>}
      </div>

      <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>Add Leader</button>

      {showAddForm && (
        <div className="card w-full max-w-md bg-base-100 shadow">
          <form onSubmit={addLeader} className="card-body space-y-2">
            <h2 className="card-title">Add New Leader</h2>
            <input className="input input-bordered w-full" placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            <input className="input input-bordered w-full" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
            <input type="email" className="input input-bordered w-full" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <select className="select select-bordered w-full" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" type="submit">Add Leader</button>
          </form>
        </div>
      )}

      {editForm.id && (
        <div className="card w-full max-w-md bg-base-100 shadow">
          <form onSubmit={updateLeader} className="card-body space-y-2">
            <h2 className="card-title">Edit Leader</h2>
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
        </div>
      )}

      {showCommModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Log Communication</h3>
            <form onSubmit={logCommunication} className="space-y-2 mt-4">
              <input
                type="date"
                className="input input-bordered w-full"
                value={commForm.date}
                onChange={e => setCommForm({ ...commForm, date: e.target.value })}
                required
              />
              <input
                className="input input-bordered w-full"
                placeholder="Type"
                value={commForm.type}
                onChange={e => setCommForm({ ...commForm, type: e.target.value })}
                required
              />
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn" onClick={() => setShowCommModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
