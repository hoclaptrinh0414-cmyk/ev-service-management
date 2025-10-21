import React, { useState } from 'react';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './MaintenanceProgress.css';
import MaintenanceJobModal from '../../components/MaintenanceJobModal';


const initialTasks = {
    'received': [
        { id: 'task-1', vehiclePlate: '29A-123.45', customerName: 'Nguyễn Văn A', technician: 'Trần B', service: 'Bảo dưỡng định kỳ', priority: 'Bình thường' },
        { id: 'task-2', vehiclePlate: '51G-678.90', customerName: 'Lê Thị B', technician: 'Vũ C', service: 'Kiểm tra hệ thống điện', priority: 'Gấp' },
    ],
    'in-progress': [
        { id: 'task-3', vehiclePlate: '30E-456.78', customerName: 'Phạm Văn C', technician: 'Trần B', service: 'Thay pin', priority: 'Bình thường' },
    ],
    'awaiting-parts': [],
    'completed': [
        { id: 'task-4', vehiclePlate: '92A-111.22', customerName: 'Hoàng Văn D', technician: 'Vũ C', service: 'Sửa chữa phanh', priority: 'Bình thường' },
    ],
};

const COLUMNS = [
    { id: 'received', title: 'Đã tiếp nhận' },
    { id: 'in-progress', title: 'Đang kiểm tra/Sửa chữa' },
    { id: 'awaiting-parts', title: 'Chờ phụ tùng' },
    { id: 'completed', title: 'Hoàn thành' },
];

const Task = ({ task, onClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: 'grab',
        marginBottom: '8px',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`task-card ${task.priority === 'Gấp' ? 'priority-high' : ''}`} onClick={onClick}>
            <div className="task-card-header">
                <strong>{task.vehiclePlate}</strong>
                {task.priority === 'Gấp' && <span className="priority-tag">Gấp</span>}
            </div>
            <p>{task.customerName}</p>
            <p className="technician-name">P.trách: {task.technician}</p>
        </div>
    );
};

const Column = ({ column, tasks, onTaskClick }) => {
    const { setNodeRef } = useSortable({ id: column.id });

    return (
        <div ref={setNodeRef} className="kanban-column">
            <h3>{column.title} ({tasks.length})</h3>
            <SortableContext items={tasks.map(t => t.id)} strategy={horizontalListSortingStrategy}>
                <div className="task-list">
                    {tasks.map(task => (
                        <Task key={task.id} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};


const MaintenanceProgress = () => {
    const [tasks, setTasks] = useState(initialTasks);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTechnician, setSelectedTechnician] = useState('all');

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer !== overContainer) {
            // Move task to a different column
            setTasks(prev => {
                const activeItems = prev[activeContainer];
                const overItems = prev[overContainer];
                const activeIndex = activeItems.findIndex(t => t.id === activeId);
                const [movedItem] = activeItems.splice(activeIndex, 1);
                overItems.push(movedItem);
                return { ...prev };
            });
        } else {
            // Move task within the same column
            setTasks(prev => {
                const activeItems = prev[activeContainer];
                const activeIndex = activeItems.findIndex(t => t.id === activeId);
                const overIndex = activeItems.findIndex(t => t.id === overId);
                return {
                    ...prev,
                    [activeContainer]: arrayMove(activeItems, activeIndex, overIndex)
                };
            });
        }
    };

    const findContainer = (id) => {
        if (id in tasks) {
            return id;
        }
        return Object.keys(tasks).find(key => tasks[key].some(t => t.id === id));
    };
    
    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const technicians = [...new Set(Object.values(initialTasks).flat().map(t => t.technician))];

    const filteredTasks = Object.keys(tasks).reduce((acc, columnId) => {
        const columnTasks = tasks[columnId].filter(task => {
            const matchesSearch = task.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  task.customerName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTechnician = selectedTechnician === 'all' || task.technician === selectedTechnician;
            return matchesSearch && matchesTechnician;
        });
        acc[columnId] = columnTasks;
        return acc;
    }, {});


    return (
        <div className="maintenance-progress-page">
            <div className="page-toolbar">
                <h1>Theo dõi Tiến độ</h1>
                <div className="filters">
                    <input 
                        type="text" 
                        placeholder="Tìm theo biển số, tên khách..." 
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select 
                        className="technician-filter"
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value)}
                    >
                        <option value="all">Tất cả kỹ thuật viên</option>
                        {technicians.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="kanban-board">
                    {COLUMNS.map(column => (
                        <Column 
                            key={column.id} 
                            column={column} 
                            tasks={filteredTasks[column.id] || []}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>
            </DndContext>
            
            <MaintenanceJobModal 
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                job={selectedTask}
            />
        </div>
    );
};

export default MaintenanceProgress;