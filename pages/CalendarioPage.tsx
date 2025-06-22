
import React, { useEffect, useRef, useState, useCallback } from 'react';
import WidgetCard from '../components/common/WidgetCard';
import CalendarProgressBars from '../components/calendario/CalendarProgressBars';
import TodayTasksList from '../components/calendario/TodayTasksList';
import Modal from '../components/common/Modal';
import EventModalForm from '../components/calendario/EventModalForm';
import { CalendarEvent, EventType, AppState, TimetableEvent } from '../types';

interface CalendarioPageProps {
  appState: AppState;
  updateAppState: (data: Partial<AppState>) => Promise<void>;
}

const CalendarioPage: React.FC<CalendarioPageProps> = ({ appState, updateAppState }) => {
  const calendarRef = useRef<any>(null); // For FullCalendar instance
  const calendarElRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | TimetableEvent | null>(null);
  const [currentModalDateStr, setCurrentModalDateStr] = useState<string | undefined>(undefined);
  
  const initCalendar = useCallback(() => {
    if (calendarElRef.current && !calendarRef.current && window.FullCalendar) {
      const calendar = new window.FullCalendar.Calendar(calendarElRef.current, {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: '' // Removed 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: appState.calendarEventsData.map(event => ({ 
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            color: event.color,
            backgroundColor: event.color, 
            borderColor: event.color,
            extendedProps: {
                estimatedTime: event.estimatedTime
            }
        })),
        eventClick: (info: any) => {
          const clickedEvent = appState.calendarEventsData.find(e => e.id === info.event.id);
          if (clickedEvent) {
            setEditingEvent(clickedEvent);
            setIsModalOpen(true);
          }
        },
        select: (info: any) => {
          setEditingEvent(null);
          setCurrentModalDateStr(info.startStr);
          setIsModalOpen(true);
          calendar.unselect();
        },
        selectable: true,
        editable: true, 
        eventDrop: async (info: any) => { 
            const eventId = info.event.id;
            const newStart = info.event.startStr;
            const newEnd = info.event.endStr; 
            const updatedEvents = appState.calendarEventsData.map(event => 
                event.id === eventId ? { ...event, start: newStart, end: newEnd || undefined } : event
            );
            await updateAppState({ calendarEventsData: updatedEvents });
        },
      });
      calendar.render();
      calendarRef.current = calendar;
    } else if (calendarRef.current) {
        calendarRef.current.removeAllEvents();
        calendarRef.current.addEventSource(appState.calendarEventsData.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            color: event.color,
            backgroundColor: event.color,
            borderColor: event.color,
            extendedProps: {
                estimatedTime: event.estimatedTime
            }
        })));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.calendarEventsData]); 

  useEffect(() => {
    initCalendar();
    return () => {
      if (calendarRef.current) {
        calendarRef.current.destroy();
        calendarRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (calendarRef.current) {
        initCalendar(); 
    }
  }, [appState.calendarEventsData, initCalendar]);


  const handleSaveEvent = async (event: CalendarEvent | TimetableEvent) => {
    const calEvent = event as CalendarEvent; // Assume calendar event for this page
    const newEvents = editingEvent
      ? appState.calendarEventsData.map(e => e.id === calEvent.id ? calEvent : e)
      : [...appState.calendarEventsData, calEvent];
    await updateAppState({ calendarEventsData: newEvents });
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const newEvents = appState.calendarEventsData.filter(e => e.id !== eventId);
    await updateAppState({ calendarEventsData: newEvents });
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <WidgetCard className="w-full max-w-4xl min-h-[500px]" id="calendar-widget-card">
      <h2 className="text-2xl text-accent-blue-info mb-5">📅 Calendario Interactivo</h2>
      <CalendarProgressBars />
      <button
        id="addCalendarEventBtn"
        onClick={() => {
            setEditingEvent(null);
            setCurrentModalDateStr(new Date().toISOString().substring(0,10)); 
            setIsModalOpen(true);
        }}
        className="font-rubik font-bold text-lg my-5 py-3 px-6 bg-gradient-to-r from-accent-green-medium to-accent-green-neon text-bg-dark rounded-xl cursor-pointer transition-all duration-300 ease-in-out shadow-md hover:shadow-lg hover:-translate-y-1 hover:scale-105 active:scale-100 active:shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-green-neon focus:ring-opacity-50"
      >
        ➕ Nueva Actividad
      </button>
      <div id="mainCalendar" ref={calendarElRef} className="flex-grow min-h-[500px] w-full"></div>
      <TodayTasksList events={appState.calendarEventsData} />

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEvent ? 'Editar Actividad' : 'Añadir Nueva Actividad'}
        >
          <EventModalForm
            eventType={EventType.CALENDAR}
            eventData={editingEvent as CalendarEvent | null}
            dateStr={currentModalDateStr}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </WidgetCard>
  );
};

export default CalendarioPage;