import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import axios from 'axios';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const firstDayOfMonth = (startOfMonth(currentDate).getDay() + 6) % 7;



  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/HR`)
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the data:", error);
      });

    window.history.pushState({}, '', `/calendar/${year}/${month}`);

  }, [currentDate]);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="calendar">
        <h2 className="calendar-title">Public Holidays in Croatia</h2>

        <div className="month-display">
          <span className="month-year">{format(currentDate, 'MMMM yyyy')}</span>
          <div className="arrows">
            <button onClick={() => setCurrentDate(prevDate => subMonths(prevDate, 1))}>&lt;</button>
            <button onClick={() => setCurrentDate(prevDate => addMonths(prevDate, 1))}>&gt;</button>
          </div>
        </div>
        <div className="days-header">
          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="days-grid">
          {Array(firstDayOfMonth).fill(null).map((_, idx) => (
            <div key={`empty-${idx}`} className="day-cell empty"></div>
          ))}
          {eachDayOfInterval({
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
          }).map(day => (
            <div key={day} className="day-cell">
              <span>{format(day, 'd')}</span>
              {events
                .filter(event => format(new Date(event.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))
                .slice(0, 1)
                .map(filteredEvent => (
                  <p key={filteredEvent.name} className="event-name" onClick={() => handleEventClick(filteredEvent)}>
                    {filteredEvent.name}
                  </p>
                ))
              }
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-background">
          <div className="modal">

            <h3 className="event-details-title">{selectedEvent.localName}</h3>
            <p className='modal-cntn'>Detalji na blagdan</p>
            <button className="close-button" onClick={() => setModalOpen(false)}>X</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
