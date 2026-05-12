import { useState } from 'react';

interface CalendarProps {
  availability: { [key: string]: boolean };
  holidays: string[];
  checkIn: string;
  checkOut: string;
  onDateSelect: (date: string) => void;
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Calendar({ availability, holidays, checkIn, checkOut, onDateSelect }: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const todayStr = fmt(today.getFullYear(), today.getMonth(), today.getDate());
  const holidaySet = new Set(holidays);

  const getDayState = (dateStr: string) => {
    if (dateStr < todayStr) return 'past';
    if (availability[dateStr] === false) return 'unavailable';
    if (holidaySet.has(dateStr)) return 'holiday';
    return 'available';
  };

  const isInRange = (dateStr: string) =>
    !!checkIn && !!checkOut && dateStr > checkIn && dateStr < checkOut;

  const isPrevDisabled = year === today.getFullYear() && month === today.getMonth();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-izumi-cream disabled:opacity-25 disabled:cursor-not-allowed transition-colors text-izumi-dark text-xl font-bold"
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <span className="font-bold text-izumi-dark text-base tracking-wide">
          {MONTHS_PT[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-izumi-cream transition-colors text-izumi-dark text-xl font-bold"
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_PT.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const dateStr = fmt(year, month, day);
          const state = getDayState(dateStr);
          const isCheckIn = dateStr === checkIn;
          const isCheckOut = dateStr === checkOut;
          const inRange = isInRange(dateStr);
          const isToday = dateStr === todayStr;
          const disabled = state === 'past' || state === 'unavailable';

          let cls = 'relative text-center py-2 rounded-lg text-sm font-medium transition-all duration-150 w-full ';

          if (state === 'past') {
            cls += 'text-gray-300 cursor-not-allowed';
          } else if (state === 'unavailable') {
            cls += 'text-red-300 line-through cursor-not-allowed';
          } else if (isCheckIn || isCheckOut) {
            cls += 'bg-izumi-pink text-white shadow-sm cursor-pointer';
          } else if (inRange) {
            cls += 'bg-izumi-pink/20 text-izumi-dark cursor-pointer hover:bg-izumi-pink/30';
          } else if (state === 'holiday') {
            cls += 'text-amber-600 hover:bg-amber-50 cursor-pointer font-semibold';
            if (isToday) cls += ' ring-2 ring-izumi-pink';
          } else if (isToday) {
            cls += 'ring-2 ring-izumi-pink text-izumi-dark cursor-pointer hover:bg-izumi-cream';
          } else {
            cls += 'text-izumi-dark hover:bg-izumi-cream cursor-pointer';
          }

          return (
            <button
              key={dateStr}
              disabled={disabled}
              onClick={() => onDateSelect(dateStr)}
              className={cls}
              aria-label={`${day} de ${MONTHS_PT[month]}${state === 'holiday' ? ' (feriado)' : ''}`}
              aria-pressed={isCheckIn || isCheckOut}
            >
              {day}
              {state === 'holiday' && !(isCheckIn || isCheckOut) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 block" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-izumi-pink inline-block" />
          Selecionado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-izumi-pink/20 inline-block" />
          Período
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white ring-2 ring-izumi-pink inline-block" />
          Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-amber-50 border border-amber-200 inline-block" />
          Feriado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-sm bg-white border border-red-200 inline-block" />
          Indisponível
        </span>
      </div>
    </div>
  );
}
