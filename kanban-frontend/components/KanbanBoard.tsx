'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { getTasks, updateTask } from '../utils/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import CreateTaskForm from './CreateTaskForm';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Column definitions
  const columns = {
    'todo': { title: 'To Do', items: tasks.filter(task => task.status === 'todo') },
    'in_progress': { title: 'In Progress', items: tasks.filter(task => task.status === 'in_progress') },
    'done': { title: 'Done', items: tasks.filter(task => task.status === 'done') }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    console.log('KanbanBoard mounted, initiating task fetch...');
    
    const loadTasks = async () => {
      try {
        console.log('Attempting to fetch tasks...');
        const fetchedTasks = await getTasks();
        console.log('Successfully fetched tasks:', fetchedTasks);
        setTasks(fetchedTasks);
        setError(null);
      } catch (error) {
        console.error('Error in loadTasks:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setTasks([]); // Reset tasks on error
      }
    };

    loadTasks();
  }, []);

  // Log whenever tasks state changes
  useEffect(() => {
    console.log('Tasks state updated:', tasks);
    console.log('Columns state:', columns);
  }, [tasks]);

  // Handle drag and drop
  const onDragEnd = async (result: DropResult) => {
    console.log('Drag ended with result:', result);
    
    if (!result.destination) {
      console.log('No destination, skipping update');
      return;
    }

    const { source, destination } = result;
    
    // Find the task that was dragged
    const task = tasks.find(t => t.id === parseInt(result.draggableId));
    if (!task) {
      console.error('Could not find task with id:', result.draggableId);
      return;
    }

    console.log('Found task to update:', task);
    console.log('Moving from', source.droppableId, 'to', destination.droppableId);

    // Create updated task with new status
    const updatedTask = {
      ...task,
      status: destination.droppableId as Task['status']
    };

    try {
      console.log('Attempting to update task:', updatedTask);
      // Update task in backend
      await updateTask(updatedTask);
      console.log('Successfully updated task in backend');
      
      // Update local state
      setTasks(prevTasks => {
        const newTasks = prevTasks.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        );
        console.log('Updated local tasks state:', newTasks);
        return newTasks;
      });
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    setShowCreateForm(false);
  };

  // Render error message if there is one
  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  // Log render
  console.log('Rendering KanbanBoard with tasks:', tasks);

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex-1 min-w-[300px]">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                {column.title}
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl min-h-[500px]
                             border border-slate-200 dark:border-slate-700"
                  >
                    {column.items.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white dark:bg-slate-700 p-4 mb-3 rounded-lg shadow-sm
                                      border border-slate-200 dark:border-slate-600
                                      transform transition-all duration-200
                                      ${snapshot.isDragging ? 'rotate-2 shadow-lg' : ''}
                                      hover:shadow-md`}
                          >
                            <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                              {task.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {task.description}
                            </p>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 
                   rounded-full hover:bg-blue-700 transition-colors shadow-lg
                   hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Task
        </button>
      </div>

      {showCreateForm && (
        <CreateTaskForm
          onTaskCreated={handleTaskCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
