import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [inputText, setInputText] = useState('');
  const [operation, setOperation] = useState('uppercase');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/tasks`, 
        { title, input_text: inputText, operation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setInputText('');
      fetchTasks();
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Create Task Form */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold mb-4">New Task</h2>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Input Text</label>
              <textarea 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 h-24"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Operation</label>
              <select 
                value={operation} 
                onChange={(e) => setOperation(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="reverse string">Reverse String</option>
                <option value="word count">Word Count</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Submit Task'}
            </button>
          </form>
        </div>
      </div>

      {/* Task List */}
      <div className="md:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
        {tasks.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg shadow-sm border text-gray-500">
            No tasks found. Create one to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => (
              <Link to={`/tasks/${task._id}`} key={task._id} className="block bg-white p-4 rounded-lg shadow-sm border hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Operation: <span className="font-medium text-gray-700">{task.operation}</span></p>
                    <p className="text-sm text-gray-500">Created: {new Date(task.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
