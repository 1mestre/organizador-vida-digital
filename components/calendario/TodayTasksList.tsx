
import React from 'react';
import { CalendarEvent } from '../../types';

interface TodayTasksListProps {
  events: CalendarEvent[];
}

const TodayTasksList: React.FC<TodayTasksListProps> = ({ events }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = events.filter(event => {
    const eventDateStr = event.start.slice(0,10);
    return eventDateStr === todayStr;
  });

  return (
    <div className="mt-5 text-left p-4 bg-bg-card rounded-lg">
      <h3 className="text-accent-yellow-green mb-2.5 text-lg">📝 Actividades para Hoy:</h3>
      <ul className="list-none pl-1">
        {todayEvents.length > 0 ? (
          todayEvents.map(event => (
            <li 
              key={event.id} 
              className="mb-1.5 pl-2 text-sm"
              style={{ 
                color: event.color || 'var(--text-primary)', 
                borderLeft: `3px solid ${event.color || 'var(--accent-yellow-green)'}`
              }}
            >
              {event.title}
              {event.estimatedTime && <span className="text-xs text-text-secondary ml-1">({event.estimatedTime}h)</span>}
            </li>
          ))
        ) : (
          <li className="text-text-secondary">No hay actividades programadas para hoy.</li>
        )}
      </ul>
    </div>
  );
};

export default TodayTasksList;