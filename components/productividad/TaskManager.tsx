import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, X, Hourglass, Play as PlayIcon, CheckCircle } from 'lucide-react';
import ProductividadCard from './ProductividadCard';
import { ProductivityTask, ProductivityTaskState } from '../../types';
import { PRODUCTIVITY_CONTENT, DAILY_AVOIDANCE_TIPS } from '../../constants';

interface TaskColumnProps {
  title: string;
  status: keyof ProductivityTaskState;
  tasks: ProductivityTask[];
  onDelete: (taskId: string | number, status: keyof ProductivityTaskState) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetStatus: keyof ProductivityTaskState) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: ProductivityTask, status: keyof ProductivityTaskState) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  icon: React.ReactNode;
  color: string;
}

const TaskCard: React.FC<{ task: ProductivityTask, status: keyof ProductivityTaskState, onDelete: TaskColumnProps['onDelete'], onDragStart: TaskColumnProps['onDragStart'] }> = ({ task, status, onDelete, onDragStart }) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, task, status)}
    className="bg-slate-700 p-3 rounded-lg flex justify-between items-start cursor-grab active:cursor-grabbing transition-shadow hover:shadow-lg"
  >
    <div className="flex-1 pr-2">
      <p className="text-slate-200 text-sm font-medium">{task.text}</p>
      {task.time && <p className="text-slate-400 text-xs mt-1">⏱️ {task.time}</p>}
      {task.result && <p className="text-cyan-300 text-xs mt-1">✅ {task.result}</p>}
    </div>
    <button onClick={() => onDelete(task.id, status)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"> <X size={16} /> </button>
  </div>
);

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onDelete, onDrop, onDragStart, onDragOver, icon, color }) => (
  <div
    onDrop={(e) => onDrop(e, status)}
    onDragOver={onDragOver}
    className="bg-slate-900/60 rounded-xl p-4 min-h-[200px] flex flex-col"
  >
    <h3 className={`font-semibold mb-3 flex items-center gap-2 text-${color}-400`}> {icon} {title} </h3>
    <div className="space-y-2 overflow-y-auto flex-grow custom-scrollbar">
      {tasks.map(task => <TaskCard key={task.id} task={task} status={status} onDelete={onDelete} onDragStart={onDragStart} />)}
      {tasks.length === 0 && <p className="text-sm text-slate-500 text-center pt-8">Arrastra tareas aquí</p>}
    </div>
  </div>
);

const getDailyAvoidanceTip = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  return DAILY_AVOIDANCE_TIPS[dayOfYear % DAILY_AVOIDANCE_TIPS.length];
};


const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<ProductivityTaskState>({
    todo: PRODUCTIVITY_CONTENT.initialTasks,
    inProgress: [],
    completed: [],
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTime, setNewTaskTime] = useState(''); // State for new task's time
  const [dailyAvoidanceTip, setDailyAvoidanceTip] = useState('');

  useEffect(() => {
    setDailyAvoidanceTip(getDailyAvoidanceTip());
  }, []);


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: ProductivityTask = {
      id: `manual_${Date.now()}`,
      text: newTaskText.trim(),
      time: newTaskTime.trim() || undefined, // Add time if provided
    };
    setTasks(prevTasks => ({ ...prevTasks, todo: [newTask, ...prevTasks.todo] }));
    setNewTaskText('');
    setNewTaskTime(''); // Reset time input
  };

  const handleDeleteTask = (taskId: string | number, status: keyof ProductivityTaskState) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [status]: prevTasks[status].filter(task => task.id !== taskId)
    }));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: ProductivityTask, status: keyof ProductivityTaskState) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.setData('originalStatus', status);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: keyof ProductivityTaskState) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('taskId');
    // Handle both string IDs from initialTasks and potentially number IDs if they were ever different
    const taskId = PRODUCTIVITY_CONTENT.initialTasks.find(t => String(t.id) === taskIdStr) ? taskIdStr : (taskIdStr.startsWith("manual_") ? taskIdStr : parseInt(taskIdStr,10));

    const originalStatus = e.dataTransfer.getData('originalStatus') as keyof ProductivityTaskState;

    if (originalStatus === targetStatus) return;

    let taskToMove: ProductivityTask | undefined;

    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      const taskIndex = newTasks[originalStatus].findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
        taskToMove = newTasks[originalStatus][taskIndex];
        newTasks[originalStatus] = newTasks[originalStatus].filter(t => t.id !== taskId);
        if(taskToMove) newTasks[targetStatus] = [taskToMove, ...newTasks[targetStatus]];
      }
      return newTasks;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <ProductividadCard className="h-full flex flex-col">
      <h2 className="text-xl font-semibold text-cyan-300 flex items-center gap-2 mb-4">
        <ListTodo size={20} /> Tareas de Hoy
      </h2>

      <div className="mb-4 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <X className="w-4 h-4 text-red-400" />
          <span className="text-red-300 font-medium text-sm">QUÉ NO HACER HOY</span>
        </div>
        <p className="text-xs text-red-100">
          {dailyAvoidanceTip}
        </p>
      </div>

      <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Añadir tarea..."
          className="flex-grow bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        />
        <input
          type="text"
          value={newTaskTime}
          onChange={(e) => setNewTaskTime(e.target.value)}
          placeholder="Tiempo (ej: 1.5h)"
          className="w-full sm:w-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
        />
        <button type="submit" className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 transition-all text-white font-bold py-2 px-4 rounded-lg shadow-md shadow-cyan-500/20">
          <Plus size={18} /> Agregar
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow">
        <TaskColumn title="Por Hacer" status="todo" tasks={tasks.todo} onDelete={handleDeleteTask} onDrop={handleDrop} onDragStart={handleDragStart} onDragOver={handleDragOver} icon={<Hourglass size={18} className="text-orange-400" />} color="orange" />
        <TaskColumn title="En Progreso" status="inProgress" tasks={tasks.inProgress} onDelete={handleDeleteTask} onDrop={handleDrop} onDragStart={handleDragStart} onDragOver={handleDragOver} icon={<PlayIcon size={18} className="text-blue-400" />} color="blue"/>
        <TaskColumn title="Completadas" status="completed" tasks={tasks.completed} onDelete={handleDeleteTask} onDrop={handleDrop} onDragStart={handleDragStart} onDragOver={handleDragOver} icon={<CheckCircle size={18} className="text-green-400" />} color="green" />
      </div>
    </ProductividadCard>
  );
};

export default TaskManager;