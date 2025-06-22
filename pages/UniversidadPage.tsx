
import React, { useState } from 'react';
import WidgetCard from '../components/common/WidgetCard';
import TimetableGrid from '../components/universidad/TimetableGrid';
import Modal from '../components/common/Modal';
import EventModalForm from '../components/calendario/EventModalForm';
import { AppState, TimetableEvent, CalendarEvent, EventType } from '../types';

interface UniversidadPageProps {
  appState: AppState;
  updateAppState: (data: Partial<AppState>) => Promise<void>;
}

const UniversidadPage: React.FC<UniversidadPageProps> = ({ appState, updateAppState }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimetableEvent | null>(null);

  const handleOpenModal = (type: EventType, eventId: string | null) => {
    if (type === EventType.TIMETABLE) {
      const eventToEdit = eventId ? appState.timetableData.find(e => e.id === eventId) || null : null;
      setEditingEvent(eventToEdit);
      setIsModalOpen(true);
    }
  };
  
  const handleSaveEvent = async (event: TimetableEvent | CalendarEvent) => {
    const ttEvent = event as TimetableEvent; // Cast, as this page only handles timetable events
    const newEvents = editingEvent
      ? appState.timetableData.map(e => e.id === ttEvent.id ? ttEvent : e)
      : [...appState.timetableData, ttEvent];
    await updateAppState({ timetableData: newEvents });
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const newEvents = appState.timetableData.filter(e => e.id !== eventId);
    await updateAppState({ timetableData: newEvents });
    setIsModalOpen(false);
    setEditingEvent(null);
  };


  return (
    <WidgetCard className="w-full max-w-5xl">
      <h2 className="text-2xl text-accent-blue-info mb-5">🎓 Horario Universitario</h2>
      <TimetableGrid events={appState.timetableData} onOpenModal={handleOpenModal} />
      <button
        onClick={() => handleOpenModal(EventType.TIMETABLE, null)}
        className="mt-5 py-2.5 px-5 bg-accent-blue-info text-bg-dark rounded-lg cursor-pointer font-semibold hover:bg-cyan-200 transition-colors"
      >
        ➕ Añadir Nuevo Evento al Horario
      </button>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingEvent ? 'Editar Clase del Horario' : 'Añadir Nueva Clase al Horario'}
        >
          <EventModalForm
            eventType={EventType.TIMETABLE}
            eventData={editingEvent}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </WidgetCard>
  );
};

export default UniversidadPage;
