
import React from 'react';
import { TimetableEvent, EventType } from '../../types';
import { TIMETABLE_DAYS, TIMETABLE_START_HOUR, TIMETABLE_END_HOUR, DEFAULT_EVENT_COLOR } from '../../constants';

interface TimetableGridProps {
  events: TimetableEvent[];
  onOpenModal: (type: EventType, eventId: string | null) => void;
}

const TimetableGrid: React.FC<TimetableGridProps> = ({ events, onOpenModal }) => {
  const gridTemplateRows = `repeat(${TIMETABLE_END_HOUR - TIMETABLE_START_HOUR + 1}, minmax(40px, auto))`;

  return (
    <div 
        id="timetableGrid" 
        className="grid gap-0.5 p-2 md:p-4 rounded-xl mt-5 max-w-full overflow-x-auto bg-bg-dark/50"
        style={{ 
            gridTemplateColumns: `[times] minmax(60px,auto) repeat(${TIMETABLE_DAYS.length}, 1fr)`,
            gridAutoRows: 'minmax(40px, auto)' // fallback if style prop doesn't work directly on className for template rows
        }}
    >
        {/* Corner */}
        <div className="sticky top-0 left-0 z-[3] bg-bg-card text-accent-blue-info font-semibold p-2.5 text-center text-xs sm:text-sm">Hora</div>

        {/* Day Headers */}
        {TIMETABLE_DAYS.map((day, i) => (
            <div key={day} className="sticky top-0 z-[2] bg-bg-card text-accent-blue-info font-semibold p-2.5 text-center text-xs sm:text-sm" style={{ gridColumn: i + 2 }}>
                {day}
            </div>
        ))}

        {/* Time Labels */}
        {Array.from({ length: TIMETABLE_END_HOUR - TIMETABLE_START_HOUR + 1 }, (_, i) => {
            const hour = TIMETABLE_START_HOUR + i;
            return (
                <div 
                    key={`time-${hour}`} 
                    className="sticky left-0 z-[2] bg-bg-card text-accent-yellow-green font-semibold p-2.5 text-right text-xs sm:text-sm" 
                    style={{ gridRow: i + 2 }}
                >
                    {`${String(hour).padStart(2, '0')}:00`}
                </div>
            );
        })}
        
        {/* Events */}
        {events.map(event => {
            const dayIndex = TIMETABLE_DAYS.indexOf(event.day.toUpperCase());
            if (dayIndex === -1) return null;

            const startHourEvent = parseInt(event.startTime.split(':')[0]);
            const endHourEvent = parseInt(event.endTime.split(':')[0]);

            const startRow = startHourEvent - TIMETABLE_START_HOUR + 2;
            // If end time is 00:00, it means it ends at the very end of the previous hour's slot for display purposes.
            // Or, if it's a multi-hour event, it spans *until* the endHour.
            const endRow = (endHourEvent === 0 ? TIMETABLE_END_HOUR + 1 : endHourEvent) - TIMETABLE_START_HOUR + 2;


            if (startRow < 2 || endRow <= startRow) { // Basic validation
                console.warn("Skipping invalid event timing:", event);
                return null;
            }

            return (
                <div
                    key={event.id}
                    className="text-black p-2 rounded-lg font-medium cursor-pointer transition-all duration-150 ease-out shadow-md hover:scale-105 hover:shadow-lg hover:z-10 overflow-hidden flex flex-col justify-start items-stretch text-xs leading-tight min-h-[38px] relative"
                    style={{
                        gridColumn: dayIndex + 2,
                        gridRow: `${startRow} / ${endRow}`,
                        backgroundColor: event.color || DEFAULT_EVENT_COLOR,
                        color: '#181a1f' // dark text for pastel backgrounds
                    }}
                    onClick={() => onOpenModal(EventType.TIMETABLE, event.id)}
                >
                    <span className="font-bold text-sm break-words mb-0.5">{event.subject}</span>
                    {event.teacher && <span className="text-xs opacity-80 break-words">{event.teacher}</span>}
                </div>
            );
        })}
    </div>
  );
};

export default TimetableGrid;
