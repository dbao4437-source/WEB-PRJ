import { DAYS, SHIFTS } from '../utils/schedule.js'
export default function AvailabilityGrid({availability=[],onChange}){
 const enabled=(day,shift)=>availability.some(slot=>slot.day===day&&slot.shift===shift)
 function toggle(day,shift){onChange(enabled(day,shift)?availability.filter(slot=>slot.day!==day||slot.shift!==shift):[...availability,{day,shift}])}
 return <div className="schedule-grid-wrap"><table className="schedule-grid"><thead><tr><th>Ngày</th>{SHIFTS.map(shift=><th key={shift}>{shift}</th>)}</tr></thead><tbody>{DAYS.map(day=><tr key={day}><th>{day}</th>{SHIFTS.map(shift=><td key={shift}><button type="button" aria-pressed={enabled(day,shift)} className={`schedule-cell ${enabled(day,shift)?'selected':''}`} onClick={()=>toggle(day,shift)}>{enabled(day,shift)?'Có lịch':'—'}</button></td>)}</tr>)}</tbody></table></div>
}
