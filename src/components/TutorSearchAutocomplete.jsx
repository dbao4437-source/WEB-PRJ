/* Lucian UX/UI Prompt #429 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/#429 */
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './TutorSearchAutocomplete.css'

function highlight(text, query) {
  const value = String(text || '')
  const needle = query.trim()
  if (!needle) return value
  const index = value.toLocaleLowerCase('vi').indexOf(needle.toLocaleLowerCase('vi'))
  if (index < 0) return value
  return <>{value.slice(0, index)}<mark>{value.slice(index, index + needle.length)}</mark>{value.slice(index + needle.length)}</>
}

function createSuggestions(tutors, query) {
  const needle = query.trim().toLocaleLowerCase('vi')
  if (!needle) return []

  const tutorSuggestions = tutors.map(tutor => ({
    id: `tutor-${tutor.id}`,
    label: tutor.name,
    meta: (tutor.subjects || []).join(' · '),
    kind: 'tutor',
  })).filter(item => `${item.label} ${item.meta}`.toLocaleLowerCase('vi').includes(needle))

  const subjectCounts = new Map()
  tutors.forEach(tutor => (tutor.subjects || []).forEach(subject => subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1)))
  const subjectSuggestions = [...subjectCounts.entries()].map(([subject, count]) => ({
    id: `subject-${subject}`,
    label: subject,
    meta: `${count} gia sư`,
    kind: 'subject',
  })).filter(item => item.label.toLocaleLowerCase('vi').includes(needle))

  return [...tutorSuggestions, ...subjectSuggestions]
    .sort((a, b) => Number(!a.label.toLocaleLowerCase('vi').startsWith(needle)) - Number(!b.label.toLocaleLowerCase('vi').startsWith(needle)))
    .slice(0, 4)
}

export default function TutorSearchAutocomplete({ value, onChange, tutors = [] }) {
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const generatedId = useId().replaceAll(':', '')
  const listId = `tutor-search-list-${generatedId}`
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMac, setIsMac] = useState(false)
  const suggestions = useMemo(() => createSuggestions(tutors, value), [tutors, value])

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || ''))
  }, [])

  useEffect(() => {
    const closeOutside = event => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const focusSearchShortcut = event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus({ preventScroll: true })
        inputRef.current?.select()
      }
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', focusSearchShortcut)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', focusSearchShortcut)
    }
  }, [])

  useEffect(() => {
    setActiveIndex(suggestions.length ? 0 : -1)
    if (!value.trim()) setOpen(false)
  }, [suggestions, value])

  function choose(item) {
    onChange(item.label)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!suggestions.length) return
      event.preventDefault()
      if (!open) {
        setOpen(true)
        setActiveIndex(0)
        return
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(index => (index + direction + suggestions.length) % suggestions.length)
      return
    }
    if (event.key === 'Enter' && open && activeIndex >= 0) {
      event.preventDefault()
      choose(suggestions[activeIndex])
    }
  }

  const activeItem = suggestions[activeIndex]
  return <div className={`u429${open ? ' is-open' : ''}`} ref={rootRef}>
    <div className="u429-w">
      <div className="u429-f">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>
        <input
          ref={inputRef}
          className="u429-in"
          type="search"
          role="combobox"
          aria-label="Tìm gia sư theo tên hoặc môn học"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-activedescendant={open && activeItem ? `${listId}-${activeItem.id}` : undefined}
          placeholder="Tên gia sư hoặc môn học"
          autoComplete="off"
          spellCheck="false"
          value={value}
          onFocus={() => { if (value.trim()) setOpen(true) }}
          onBlur={event => { if (!rootRef.current?.contains(event.relatedTarget)) setOpen(false) }}
          onChange={event => { onChange(event.target.value); setOpen(Boolean(event.target.value.trim())) }}
          onKeyDown={handleKeyDown}
        />
        <kbd className="u429-kb" aria-hidden="true">{isMac ? '⌘ K' : 'Ctrl K'}</kbd>
      </div>
      <div className="u429-dd">
        {open && <>
          {suggestions.length > 0 && <i className="u429-pill" aria-hidden="true" style={{ '--py': `${Math.max(activeIndex, 0) * 40}px`, '--po': 1 }} />}
          <div className="u429-lb" id={listId} role="listbox" aria-label="Gợi ý tìm gia sư">
            {suggestions.length ? suggestions.map((item, index) => <div
              className="u429-o"
              id={`${listId}-${item.id}`}
              role="option"
              aria-selected={index === activeIndex}
              key={item.id}
              style={{ '--i': index }}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseDown={event => event.preventDefault()}
              onClick={() => choose(item)}
            >
              <span className={`u429-ic${item.kind === 'tutor' ? ' is-av' : ''}`} aria-hidden="true">
                {item.kind === 'tutor' ? item.label.charAt(0) : <svg viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M8 7h8M8 11h8"/></svg>}
              </span>
              <span className="u429-t">{highlight(item.label, value)}</span>
              <span className="u429-m">{highlight(item.meta, value)}</span>
              <span className="u429-en" aria-hidden="true">↵</span>
            </div>) : <div className="u429-no" role="option" aria-disabled="true">Không tìm thấy gia sư hoặc môn học phù hợp</div>}
          </div>
          <p className="u429-live" role="status" aria-live="polite">{suggestions.length ? `${suggestions.length} gợi ý` : 'Không có gợi ý'}</p>
        </>}
      </div>
    </div>
  </div>
}
