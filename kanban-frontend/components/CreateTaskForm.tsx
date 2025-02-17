import React, { useState } from 'react';
import { Task } from '../types';
import { createTask } from '../utils/api';

interface CreateTaskFormProps {
  onTaskCreated: (task: Task) => void;
  onCancel: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onTaskCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      const newTask = {
        title,
        description,
        status: 'todo' as const,
      };

      const createdTask = await createTask(newTask);
      onTaskCreated(createdTask);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Task</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 
                       text-slate-900 dark:text-white bg-white dark:bg-slate-700
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3 
                       text-slate-900 dark:text-white bg-white dark:bg-slate-700
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-slate-400 dark:placeholder-slate-500"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 
                       bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 
                       dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 
                       rounded-lg hover:bg-blue-700 transition-colors
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskForm;
