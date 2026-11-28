import { useEffect, useMemo, useRef, useState } from 'react'
import { DOMESTIC_SCHOOLS, INTERNATIONAL_SCHOOLS } from '../../../constants/options.js'

export default function SearchableSelect({ value = '', onChange, error }) {
  const rootRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(value === 'Khác')
  const [query, setQuery] = useState('')
  const [typing, setTyping] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const choices = useMemo(() => {
    const all = [...DOMESTIC_SCHOOLS, ...INTERNATIONAL_SCHOOLS]
    return typing && query.trim() ? all.filter(item => item.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'))) : all
  }, [query, typing])

  useEffect(() => {
    const onMouseDown = event => {
      if (!rootRef.current?.contains(event.target)) closeAndRestore()
    }
    const onKeyDown = event => {
      if (event.key === 'Escape') { closeAndRestore(); return }
      if (!open || custom) return
      if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, choices.length - 1)) }
      if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)) }
      if (event.key === 'Enter' && choices.length) { event.preventDefault(); choose(choices[activeIndex] || choices[0]) }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('mousedown', onMouseDown); document.removeEventListener('keydown', onKeyDown) }
  })

  function closeAndRestore() {
    setOpen(false)
    if (!custom) { setQuery(''); setTyping(false) }
  }
  function choose(item) { onChange(item); setCustom(false); setQuery(item); setTyping(false); setOpen(false) }
  function startCustom() { onChange(''); setCustom(true); setQuery(''); setTyping(false); setOpen(false) }

  return <div className="shared-field school-picker" ref={rootRef}>
    <span className="shared-label">Học vấn</span>
    {!custom && <input className="shared-input" value={open && typing ? query : value} onFocus={() => { setOpen(true); setQuery(''); setTyping(false); setActiveIndex(0) }} onChange={event => { setQuery(event.target.value); setTyping(true); setOpen(true); setActiveIndex(0) }} placeholder="Tìm trường hoặc chọn trường" role="combobox" aria-expanded={open} aria-autocomplete="list" aria-controls="school-options" />}
    {custom && <input className="shared-input custom-school-input" value={value === 'Khác' ? '' : value} onChange={event => onChange(event.target.value)} placeholder="Nhập tên trường" />}
    {open && !custom && <div className="school-options" id="school-options" role="listbox">
      {DOMESTIC_SCHOOLS.filter(item => choices.includes(item)).length > 0 && <><b>Trong nước</b>{DOMESTIC_SCHOOLS.filter(item => choices.includes(item)).map(item => <button type="button" role="option" aria-selected={choices[activeIndex] === item} key={item} onMouseEnter={() => setActiveIndex(choices.indexOf(item))} onClick={() => choose(item)}>{item}</button>)}</>}
      {INTERNATIONAL_SCHOOLS.filter(item => choices.includes(item)).length > 0 && <><b>Quốc tế</b>{INTERNATIONAL_SCHOOLS.filter(item => choices.includes(item)).map(item => <button type="button" role="option" aria-selected={choices[activeIndex] === item} key={item} onMouseEnter={() => setActiveIndex(choices.indexOf(item))} onClick={() => choose(item)}>{item}</button>)}</>}
      {choices.length === 0 && <span className="school-no-results">Không tìm thấy trường phù hợp.</span>}
      <button type="button" className="school-other" onClick={startCustom}>Khác — tự nhập tên trường</button>
    </div>}
    {custom && <button type="button" className="school-other school-custom-reset" onClick={() => { setCustom(false); onChange(''); setOpen(true) }}>Chọn từ danh sách trường</button>}
    {error && <small className="field-error">{error}</small>}
  </div>
}
