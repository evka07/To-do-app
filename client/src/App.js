import './index.css';
import io from 'socket.io-client';
import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

const App = () => {
  const [socket, setSocket] = useState();

  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  const handleTaskNameChange = e => {
    setTaskName(e.target.value);
  };

  const removeTask = (id, emitEvent = true) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    if (emitEvent) {
      socket.emit('removeTask', id);
    }
  };

  const addTask = task => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const submitForm = e => {
    e.preventDefault();
    if (!taskName.trim()) {
      alert('Nazwa zadania nie może być pusta');
      return;
    }
    const newTask = { id: nanoid(), name: taskName };

    addTask(newTask);

    socket.emit('addTask', newTask);

    setTaskName('');
  };

  useEffect(() => {
    const socket = io('ws://localhost:8000', { transports: ['websocket'] });
    setSocket(socket);

    socket.on('addTask', task => {
      addTask(task);
    });

    socket.on('removeTask', taskId => {
      removeTask(taskId, false);
    });

    socket.on('editTask', ({ taskId, newTaskName }) => {
      setTasks(prevTasks => {
        return prevTasks.map(task =>
          task.id === taskId ? { ...task, name: newTaskName } : task
        );
      });
    });

    socket.on('updateData', updatedTasks => {
      setTasks(updatedTasks);
    });

    return () => {
      socket.off('addTask');
      socket.off('removeTask');
      socket.off('updateData');
      socket.disconnect();
    };
  }, []);
  return (
    <div className='App'>
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className='tasks-section' id='tasks-section'>
        <h2>Tasks</h2>

        <ul className='tasks-section__list' id='tasks-list'>
          {tasks.map(task => (
            <li className='task' key={task.id}>
              {task.name}
              <button
                className='btn btn--red'
                onClick={() => removeTask(task.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <form id='add-task-form' onSubmit={submitForm}>
          <input
            className='text-input'
            autoComplete='off'
            type='text'
            placeholder='Type your description'
            id='task-name'
            value={taskName}
            onChange={handleTaskNameChange}
          />
          <button className='btn' type='submit'>
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
