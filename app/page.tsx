'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Lead {
  id: string
  name: string
  email: string
  status: 'new' | 'contacted' | 'qualified'
  user_id: string
  created_at: string
}

type LeadStatus = 'new' | 'contacted' | 'qualified'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<LeadStatus>('new')
  
  // Auth state
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) fetchLeads(user.id)
    else setLoading(false)
  }

  const fetchLeads = async (userId: string) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (!error && data) setLeads(data)
    setLoading(false)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      })
      if (error) setAuthError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })
      if (error) setAuthError(error.message)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLeads([])
  }

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name.trim() || !email.trim()) return

    const { error } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.trim(),
      status,
      user_id: user.id,
    })

    if (!error) {
      setName('')
      setEmail('')
      setStatus('new')
      fetchLeads(user.id)
    }
  }

  const updateStatus = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId)

    if (!error && user) {
      fetchLeads(user.id)
    }
  }

  const deleteLead = async (leadId: string) => {
    const { error } = await supabase.from('leads').delete().eq('id', leadId)
    if (!error && user) fetchLeads(user.id)
  }

  const getStatusColor = (s: LeadStatus) => {
    switch (s) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
    }
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto pt-16 px-4">
        <p className="text-center text-gray-500">Loading...</p>
      </main>
    )
  }

  // Auth screen
  if (!user) {
    return (
      <main className="max-w-md mx-auto pt-16 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          📋 Lead Tracker
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring-blue-500"
              required
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </main>
    )
  }

  // Main app
  return (
    <main className="max-w-4xl mx-auto pt-16 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📋 Lead Tracker</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign Out
        </button>
      </div>

      {/* Add Lead Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Lead</h2>
        <form onSubmit={addLead} className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
          </select>
          <button
            type="submit"
            className="py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Add Lead
          </button>
        </form>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No leads yet. Add one above!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{lead.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(lead.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-center text-gray-500 mt-6 text-sm">
        {leads.length} lead{leads.length !== 1 ? 's' : ''} • {leads.filter(l => l.status === 'qualified').length} qualified
      </p>
    </main>
  )
}
