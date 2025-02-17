'use client';

import React, { useEffect, useState } from 'react';
import { Task } from '../types';
import { getTasks, updateTask } from '../utils/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4">
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="flex-1">
            <h2 className="mb-4 text-xl font-bold">{column.title}</h2>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-100 p-4 rounded-lg min-h-[500px]"
                >
                  {column.items.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 mb-2 rounded shadow"
                        >
                          <h3 className="font-bold">{task.title}</h3>
                          <p>{task.description}</p>
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
  );
};

export default KanbanBoard;
