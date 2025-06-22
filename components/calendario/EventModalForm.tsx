
import React, { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, TimetableEvent, EventType } from '../../types';
import { PRESET_EVENT_COLORS, DEFAULT_EVENT_COLOR, TIMETABLE_DAYS, TIMETABLE_START_HOUR, TIMETABLE_END_HOUR } from '../../constants';

interface EventModalFormProps {
  eventType: EventType;
  eventData: CalendarEvent | TimetableEvent | null; // null for new event
  dateStr?: string; // For pre-filling date for new calendar event
  onSave: (event: CalendarEvent | TimetableEvent) => void;
  onDelete?: (eventId: string, eventType: EventType) => void;
  onClose: () => void;
}

const EventModalForm: React.FC<EventModalFormProps> = ({
  eventType,
  eventData,
  dateStr,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [teacher, setTeacher] = useState('');
  const [day, setDay] = useState(TIMETABLE_DAYS[0]);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:00');
  const [startDate, setStartDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<string>(''); // For CalendarEvent
  const [color, setColor] = useState(DEFAULT_EVENT_COLOR);

  const isCalendarEvent = eventType === EventType.CALENDAR;

  const populateTimeSelect = useCallback((startHour: number, endHour: number): string[] => {
    const times: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 30) { // 30 min intervals
             times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
    }
    if(endHour === TIMETABLE_END_HOUR) times.push(`${String(endHour + 1).padStart(2, '0')}:00`);
    return times;
  }, []);

  const timeOptions = populateTimeSelect(TIMETABLE_START_HOUR, TIMETABLE_END_HOUR);

  useEffect(() => {
    if (eventData) {
      setColor(eventData.color || DEFAULT_EVENT_COLOR);
      if (isCalendarEvent) {
        const calEvent = eventData as CalendarEvent;
        setTitle(calEvent.title);
        setStartDate(calEvent.start.substring(0, 10));
        setEstimatedTime(calEvent.estimatedTime ? String(calEvent.estimatedTime) : '');
      } else {
        const ttEvent = eventData as TimetableEvent;
        setTitle(ttEvent.subject);
        setTeacher(ttEvent.teacher || '');
        setDay(ttEvent.day);
        setStartTime(ttEvent.startTime);
        setEndTime(ttEvent.endTime);
      }
    } else {
      // New event defaults
      setTitle('');
      setColor(DEFAULT_EVENT_COLOR);
      if (isCalendarEvent) {
        setStartDate(dateStr ? dateStr.substring(0, 10) : new Date().toISOString().substring(0, 10));
        setEstimatedTime('');
      } else {
        setTeacher('');
        setDay(TIMETABLE_DAYS[0]);
        setStartTime('07:00');
        setEndTime('08:00');
      }
    }
  }, [eventData, eventType, dateStr, isCalendarEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El título es obligatorio.');
      return;
    }

    const baseEvent = {
      id: eventData?.id || `${eventType}_${Date.now()}`,
      color,
    };

    if (isCalendarEvent) {
      const parsedEstimatedTime = parseFloat(estimatedTime);
      onSave({
        ...baseEvent,
        title,
        start: startDate, 
        allDay: true, 
        estimatedTime: !isNaN(parsedEstimatedTime) ? parsedEstimatedTime : undefined,
      } as CalendarEvent);
    } else {
      onSave({
        ...baseEvent,
        subject: title,
        teacher,
        day,
        startTime,
        endTime,
      } as TimetableEvent);
    }
  };

  const handleDelete = () => {
    if (eventData?.id && onDelete) {
      onDelete(eventData.id, eventType);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="modal-form-group">
        <label htmlFor="eventTitle" className="block text-text-secondary mb-1.5 text-sm">Título/Materia:</label>
        <input
          type="text"
          id="eventTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
        />
      </div>

      {!isCalendarEvent && ( // Timetable specific fields
        <>
          <div className="modal-form-group">
            <label htmlFor="eventTeacher" className="block text-text-secondary mb-1.5 text-sm">Profesor:</label>
            <input
              type="text"
              id="eventTeacher"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="modal-form-group">
              <label htmlFor="eventDay" className="block text-text-secondary mb-1.5 text-sm">Día:</label>
              <select
                id="eventDay"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
              >
                {TIMETABLE_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="eventStartTime" className="block text-text-secondary mb-1.5 text-sm">Hora Inicio:</label>
              <select
                id="eventStartTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
              >
                {timeOptions.map(t => <option key={`start-${t}`} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label htmlFor="eventEndTime" className="block text-text-secondary mb-1.5 text-sm">Hora Fin:</label>
              <select
                id="eventEndTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
              >
                {timeOptions.map(t => <option key={`end-${t}`} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {isCalendarEvent && ( 
        <>
            <div className="modal-form-group">
                <label htmlFor="eventStartDate" className="block text-text-secondary mb-1.5 text-sm">Fecha:</label>
                <input
                    type="date"
                    id="eventStartDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
                />
            </div>
            <div className="modal-form-group">
                <label htmlFor="eventEstimatedTime" className="block text-text-secondary mb-1.5 text-sm">Tiempo Estimado (h):</label>
                <input
                    type="number"
                    id="eventEstimatedTime"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    step="0.1"
                    min="0"
                    placeholder="Ej: 1.5"
                    className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
                />
            </div>
        </>
      )}

      <div className="modal-form-group">
        <label htmlFor="eventColorSelect" className="block text-text-secondary mb-1.5 text-sm">Color del Evento:</label>
        <select
          id="eventColorSelect"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
          className="w-full p-2.5 border border-bg-card-light rounded-lg bg-bg-dark text-text-primary focus:border-accent-blue-info focus:ring-1 focus:ring-accent-blue-info outline-none"
        >
          {PRESET_EVENT_COLORS.map(c => <option key={c.value} value={c.value} style={{ backgroundColor: c.value, color: '#000' }}>{c.name}</option>)}
        </select>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
        {eventData?.id && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="py-2 px-4 rounded-lg font-semibold bg-accent-red-clear text-text-primary hover:bg-red-700 transition-colors w-full sm:w-auto"
          >
            Eliminar
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 rounded-lg font-semibold bg-bg-card-light text-text-primary hover:bg-slate-600 transition-colors w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-4 rounded-lg font-semibold bg-accent-green-medium text-bg-dark hover:bg-accent-green-neon transition-colors w-full sm:w-auto"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};

export default EventModalForm;