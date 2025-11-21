import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ServiceSchedule.css';
import Toolbar from './Toolbar';
import ListView from './ListView';
import AppointmentModal from './AppointmentModal'; // Import the modal component

// Setup the localizer by providing the moment Object
const localizer = momentLocalizer(moment);

// Sample Data (will be replaced with API data)
const sampleAppointments = [
  {
    id: 1,
    title: 'Nguyễn Văn A - Bảo dưỡng định kỳ',
    start: new Date(2025, 9, 20, 10, 0, 0),
    end: new Date(2025, 9, 20, 11, 30, 0),
    resource: {
      status: 'Confirmed',
      technician: 'Tech 1',
      customer: 'Nguyễn Văn A',
      vehicle: '51F-123.45',
      service: 'Bảo dưỡng định kỳ',
    },
  },
  {
    id: 2,
    title: 'Trần Thị B - Sửa chữa phanh',
    start: new Date(2025, 9, 21, 14, 0, 0),
    end: new Date(2025, 9, 21, 15, 0, 0),
    resource: {
      status: 'Pending',
      technician: 'Tech 2',
      customer: 'Trần Thị B',
      vehicle: '29A-987.65',
      service: 'Sửa chữa phanh',
    },
  },
    {
    id: 3,
    title: 'Lê Văn C - Thay lốp',
    start: new Date(2025, 9, 22, 9, 0, 0),
    end: new Date(2025, 9, 22, 9, 30, 0),
    resource: {
      status: 'Completed',
      technician: 'Tech 1',
      customer: 'Lê Văn C',
      vehicle: '30E-456.78',
      service: 'Thay lốp',
    },
  },
];

const ServiceSchedule = () => {
  const [currentView, setCurrentView] = useState('calendar'); // 'calendar' or 'list'
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'day'
  const [date, setDate] = useState(new Date());
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const eventPropGetter = useMemo(() => {
    const statusColors = {
      Pending: 'bg-yellow-400',
      Confirmed: 'bg-green-500',
      InProgress: 'bg-blue-500',
      Completed: 'bg-gray-500',
      Canceled: 'bg-red-500',
    };

    return (event) => {
      const status = event.resource?.status;
      const className = statusColors[status] || 'bg-gray-300';
      return {
        className: `${className} text-white p-1 rounded`,
      };
    };
  }, []);
  
  const handleSelectSlot = ({ start, end }) => {
    setSelectedAppointment({ start, end, resource: {} });
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleNewAppointment = () => {
      // Set a default start/end time for the new appointment if needed
      const start = new Date();
      const end = new Date();
      end.setHours(start.getHours() + 1);
      setSelectedAppointment({ start, end, resource: {} });
      setIsModalOpen(true);
  }

  const handleSaveAppointment = (formData) => {
      console.log('Saving appointment:', formData);
      // Here you would handle API calls to save the data
      // For now, we'll just add/update it in the local state

      if (selectedAppointment?.id) { // Update existing
          setAppointments(prev => prev.map(apt => 
              apt.id === selectedAppointment.id ? { ...apt, ...formData, title: `${formData.customer} - ${formData.service}` } : apt
          ));
      } else { // Create new
          const newId = Math.max(...appointments.map(a => a.id)) + 1;
          const newAppointment = {
              id: newId,
              title: `New Appointment - ${formData.service}`,
              start: new Date(formData.start),
              end: new Date(formData.end),
              resource: { ...formData }
          };
          setAppointments(prev => [...prev, newAppointment]);
      }

      handleCloseModal();
  }

  const handleViewChange = (view) => {
      if (view === 'list') {
          setCurrentView('list');
      } else {
          setCurrentView('calendar');
          setCalendarView(view);
      }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Quản lý Lịch hẹn</h1>
      
      <Toolbar 
        view={currentView === 'list' ? 'list' : calendarView}
        onViewChange={handleViewChange}
        onNewAppointment={handleNewAppointment}
      />

      {currentView === 'calendar' ? (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <Calendar
            localizer={localizer}
            events={appointments}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 800 }}
            view={calendarView}
            date={date}
            onView={(view) => setCalendarView(view)}
            onNavigate={(date) => setDate(date)}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            selectable
            eventPropGetter={eventPropGetter}
            messages={{
                next: "Sau",
                previous: "Tru?c",
                today: "Ng�y",
                month: "Th�ng",
                week: "Tu?n",
                day: "Ng�y",
                agenda: "L?ch tr�nh",
                date: "Ng�y",
                time: "Th?i gian",
                event: "S? ki?n",
            }}
            />
        </div>
      ) : (
        <ListView appointments={appointments} onSelectAppointment={handleSelectEvent} />
      )}


      {isModalOpen && (
        <AppointmentModal 
            appointment={selectedAppointment}
            onClose={handleCloseModal}
            onSave={handleSaveAppointment}
        />
      )}
    </div>
  );
};

export default ServiceSchedule;


