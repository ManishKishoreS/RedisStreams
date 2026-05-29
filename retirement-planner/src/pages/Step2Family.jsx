import { useState } from 'react'
import { useStore } from '../store/useStore.js'
import { EDUCATION_COST_DEFAULTS, WEDDING_COST_DEFAULTS, CURRENCY_SYMBOLS } from '../data/defaults.js'

const LIFE_EVENT_TYPES = [
  { type: 'career_break', label: 'Career Break', icon: '⏸️', desc: 'Sabbatical or gap year' },
  { type: 'property_purchase', label: 'Property Purchase', icon: '🏠', desc: 'Home, land, or investment property' },
  { type: 'business_exit', label: 'Business Exit / Windfall', icon: '💼', desc: 'Sale of business or startup exit' },
  { type: 'inheritance', label: 'Inheritance', icon: '🏛️', desc: 'Expected inheritance' },
  { type: 'disability_buffer', label: 'Disability / Critical Illness Buffer', icon: '🏥', desc: 'Emergency health fund' },
  { type: 'child_wedding', label: 'Child Wedding', icon: '💍', desc: 'Wedding costs for a child' },
  { type: 'parent_caregiving', label: 'Parent Caregiving', icon: '👴', desc: 'Monthly elder care expenses' },
]

export function Step2Family({ onNext, onBack }) {
  const { profile, family, setFamily, addChild, removeChild, updateChild, addLifeEvent, removeLifeEvent } = useStore()
  const sym = CURRENCY_SYMBOLS[profile.workCountry] || '₹'
  const country = profile.workCountry || 'IN'
  const [showSpouse, setShowSpouse] = useState(!!family.spouse)
  const [newChild, setNewChild] = useState({ name: '', dob: '' })
  const [newDependent, setNewDependent] = useState({ currentAge: '', relation: 'parent' })
  const [showEventForm, setShowEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState({ type: 'property_purchase', userAge: (profile.age || 30) + 5, amount: '', duration: 1, incomePct: 0, monthlyCost: '' })

  const handleSpouseToggle = (on) => {
    setShowSpouse(on)
    if (!on) setFamily({ spouse: null })
    else setFamily({ spouse: { name: '', dob: '', gender: 'female', workCountry: profile.workCountry, retireCountry: profile.retireCountry } })
  }

  const handleAddChild = () => {
    if (!newChild.dob) return
    const eduCost = EDUCATION_COST_DEFAULTS[country]
    const wedCost = WEDDING_COST_DEFAULTS[profile.retireCountry || country]
    addChild({ ...newChild, educationCost: eduCost, weddingCost: wedCost })
    setNewChild({ name: '', dob: '' })
  }

  const handleAddDependent = () => {
    if (!newDependent.currentAge) return
    setFamily({
      dependents: [...(family.dependents || []), { id: Date.now(), ...newDependent, currentAge: Number(newDependent.currentAge) }],
    })
    setNewDependent({ currentAge: '', relation: 'parent' })
  }

  const handleAddEvent = () => {
    addLifeEvent({ ...newEvent, amount: Number(newEvent.amount) || 0, userAge: Number(newEvent.userAge) })
    setShowEventForm(false)
    setNewEvent({ type: 'property_purchase', userAge: (profile.age || 30) + 5, amount: '', duration: 1, incomePct: 0, monthlyCost: '' })
  }

  const getEventIcon = (type) => LIFE_EVENT_TYPES.find(t => t.type === type)?.icon || '📅'
  const getEventLabel = (type) => LIFE_EVENT_TYPES.find(t => t.type === type)?.label || type

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-white">Your Family</h2>
        <p className="text-slate-400 mt-1">Tell us about your family — we'll factor their costs and incomes into your plan</p>
      </div>

      {/* Spouse */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-xl">💑</span>
            <div>
              <h3 className="font-semibold text-white text-base">Spouse / Partner</h3>
              <p className="text-xs text-slate-500">Their income and retirement plans affect your combined picture</p>
            </div>
          </div>
          <button
            onClick={() => handleSpouseToggle(!showSpouse)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200
              ${showSpouse ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-700 border-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5
              ${showSpouse ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {showSpouse && family.spouse && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Spouse's Name" htmlFor="spouseName">
              <input
                id="spouseName"
                type="text"
                placeholder="Name"
                value={family.spouse.name || ''}
                onChange={e => setFamily({ spouse: { ...family.spouse, name: e.target.value } })}
                className="input-field"
              />
            </Field>
            <Field label="Date of Birth" htmlFor="spouseDob">
              <input
                id="spouseDob"
                type="date"
                value={family.spouse.dob || ''}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setFamily({ spouse: { ...family.spouse, dob: e.target.value } })}
                className="input-field"
              />
            </Field>
            <Field label="Gender" htmlFor="spouseGender">
              <div className="flex gap-2">
                {['male', 'female', 'other'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFamily({ spouse: { ...family.spouse, gender: g } })}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium capitalize transition-all border
                      ${family.spouse.gender === g
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {!showSpouse && (
          <p className="text-sm text-slate-600 italic text-center py-2">No spouse / partner — single income plan</p>
        )}
      </div>

      {/* Children */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">👶</span>
          <div>
            <h3 className="font-semibold text-white text-base">Children</h3>
            <p className="text-xs text-slate-500">Education and wedding costs are auto-computed from their birth dates</p>
          </div>
        </div>

        {/* Add child form */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            placeholder="Child's name (optional)"
            value={newChild.name}
            onChange={e => setNewChild(p => ({ ...p, name: e.target.value }))}
            className="input-field flex-1 min-w-[160px]"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Date of birth</label>
            <input
              type="date"
              value={newChild.dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setNewChild(p => ({ ...p, dob: e.target.value }))}
              className="input-field"
            />
          </div>
          <button
            onClick={handleAddChild}
            className="self-end px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            + Add Child
          </button>
        </div>

        {family.children && family.children.length > 0 ? (
          <ul className="space-y-2">
            {family.children.map(child => {
              const birthYear = child.dob ? new Date(child.dob).getFullYear() : null
              const childAge = birthYear ? (new Date().getFullYear() - birthYear) : null
              return (
                <li key={child.id} className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3">
                  <span className="text-lg">👶</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{child.name || 'Child'}</p>
                    {childAge !== null && (
                      <p className="text-xs text-slate-500">Age {childAge} · Education cost: {sym}{((child.educationCost || 0) / 100000).toFixed(0)}L · Wedding: {sym}{((child.weddingCost || 0) / 100000).toFixed(0)}L</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeChild(child.id)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 italic text-center py-2">No children added yet</p>
        )}
      </div>

      {/* Dependent parents */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
          <span className="text-xl">👴</span>
          <div>
            <h3 className="font-semibold text-white text-base">Dependent Parents / Elders</h3>
            <p className="text-xs text-slate-500">We'll estimate caregiving costs once they need support</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Relation</label>
            <select
              value={newDependent.relation}
              onChange={e => setNewDependent(p => ({ ...p, relation: e.target.value }))}
              className="input-field"
            >
              <option value="parent">Parent</option>
              <option value="in-law">In-law</option>
              <option value="grandparent">Grandparent</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Current age</label>
            <input
              type="number"
              placeholder="Age"
              min={50}
              max={100}
              value={newDependent.currentAge}
              onChange={e => setNewDependent(p => ({ ...p, currentAge: e.target.value }))}
              className="input-field w-24"
            />
          </div>
          <button
            onClick={handleAddDependent}
            className="self-end px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            + Add
          </button>
        </div>

        {family.dependents && family.dependents.length > 0 ? (
          <ul className="space-y-2">
            {family.dependents.map(dep => (
              <li key={dep.id} className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3">
                <span className="text-lg">👴</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white capitalize">{dep.relation}</p>
                  <p className="text-xs text-slate-500">Current age: {dep.currentAge}</p>
                </div>
                <button
                  onClick={() => setFamily({ dependents: family.dependents.filter(d => d.id !== dep.id) })}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 italic text-center py-2">No dependents added</p>
        )}
      </div>

      {/* Life Events */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <h3 className="font-semibold text-white text-base">Life Events</h3>
              <p className="text-xs text-slate-500">Big financial events that will impact your savings and spending</p>
            </div>
          </div>
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
          >
            + Add Event
          </button>
        </div>

        {showEventForm && (
          <div className="rounded-xl bg-slate-900 border border-slate-700 p-4 mb-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Event Type" htmlFor="eventType">
                <select
                  id="eventType"
                  value={newEvent.type}
                  onChange={e => setNewEvent(p => ({ ...p, type: e.target.value }))}
                  className="input-field"
                >
                  {LIFE_EVENT_TYPES.map(t => (
                    <option key={t.type} value={t.type}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="When (your age)" htmlFor="eventAge">
                <input
                  id="eventAge"
                  type="number"
                  min={profile.age || 20}
                  max={80}
                  value={newEvent.userAge}
                  onChange={e => setNewEvent(p => ({ ...p, userAge: e.target.value }))}
                  className="input-field"
                />
              </Field>
              {['property_purchase', 'business_exit', 'windfall', 'inheritance', 'disability_buffer', 'child_wedding', 'child_education'].includes(newEvent.type) && (
                <Field label="Amount" htmlFor="eventAmt">
                  <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 overflow-hidden focus-within:border-indigo-500">
                    <span className="px-3 py-3 text-slate-400 text-sm border-r border-slate-700 bg-slate-700">{sym}</span>
                    <input
                      id="eventAmt"
                      type="number"
                      min={0}
                      value={newEvent.amount}
                      onChange={e => setNewEvent(p => ({ ...p, amount: e.target.value }))}
                      className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </Field>
              )}
              {newEvent.type === 'career_break' && (
                <>
                  <Field label="Duration (years)" htmlFor="eventDur">
                    <input
                      id="eventDur"
                      type="number"
                      min={1}
                      max={10}
                      value={newEvent.duration}
                      onChange={e => setNewEvent(p => ({ ...p, duration: Number(e.target.value) }))}
                      className="input-field"
                    />
                  </Field>
                  <Field label="Income during break (%)" htmlFor="eventIncomePct">
                    <input
                      id="eventIncomePct"
                      type="number"
                      min={0}
                      max={100}
                      value={newEvent.incomePct}
                      onChange={e => setNewEvent(p => ({ ...p, incomePct: Number(e.target.value) }))}
                      className="input-field"
                      placeholder="0 = no income"
                    />
                  </Field>
                </>
              )}
              {newEvent.type === 'parent_caregiving' && (
                <Field label="Monthly cost" htmlFor="eventMonthlyCost">
                  <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 overflow-hidden focus-within:border-indigo-500">
                    <span className="px-3 py-3 text-slate-400 text-sm border-r border-slate-700 bg-slate-700">{sym}</span>
                    <input
                      id="eventMonthlyCost"
                      type="number"
                      min={0}
                      value={newEvent.monthlyCost}
                      onChange={e => setNewEvent(p => ({ ...p, monthlyCost: e.target.value }))}
                      className="flex-1 bg-transparent text-white px-3 py-3 text-sm focus:outline-none"
                    />
                  </div>
                </Field>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddEvent} className="btn-primary text-sm px-5">Save Event</button>
              <button onClick={() => setShowEventForm(false)} className="btn-secondary text-sm px-5">Cancel</button>
            </div>
          </div>
        )}

        {family.lifeEvents && family.lifeEvents.length > 0 ? (
          <ul className="space-y-2">
            {family.lifeEvents.map(ev => (
              <li key={ev.id} className="flex items-center gap-4 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3">
                <span className="text-xl">{getEventIcon(ev.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{getEventLabel(ev.type)}</p>
                  <p className="text-xs text-slate-500">At age {ev.userAge}{ev.amount ? ` · ${sym}${Number(ev.amount).toLocaleString()}` : ''}</p>
                </div>
                <button
                  onClick={() => removeLifeEvent(ev.id)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-500 hover:text-red-400 transition-all flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600 italic text-center py-4">No life events added yet — this is optional</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onBack} className="btn-secondary">← Back</button>
        <button onClick={onNext} className="btn-primary">Continue — Income & Assets →</button>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-300">{label}</label>
      {children}
    </div>
  )
}
