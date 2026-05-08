import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTask(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch task details');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();

    // Polling logic: fetch every 3 seconds if task is pending or running
    const interval = setInterval(() => {
      setTask((currentTask) => {
        if (currentTask && (currentTask.status === 'pending' || currentTask.status === 'running')) {
          fetchTask();
        }
        return currentTask;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!task) return <div className="text-center mt-10">Task not found</div>;

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">&larr; Back to Dashboard</Link>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex justify-between items-start mb-6 pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold mb-2">{task.title}</h1>
            <p className="text-gray-500">Operation: <span className="font-medium text-gray-700">{task.operation}</span></p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Input</h3>
            <div className="bg-gray-50 p-4 rounded border text-gray-800 whitespace-pre-wrap">
              {task.input_text}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Result</h3>
            {task.status === 'success' ? (
              <div className="bg-green-50 border border-green-100 p-4 rounded text-gray-800 whitespace-pre-wrap font-medium">
                {task.result}
              </div>
            ) : task.status === 'failed' ? (
               <div className="bg-red-50 p-4 rounded border border-red-100 text-red-600">
                Processing failed. Check logs for details.
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded border text-gray-500 italic flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Execution Logs</h3>
        </div>
        <div className="p-4 font-mono text-sm text-green-400 space-y-2 max-h-64 overflow-y-auto">
          {task.logs.length === 0 ? (
            <p className="text-gray-500">Waiting for logs...</p>
          ) : (
            task.logs.map((log, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-4">[{index + 1}]</span>
                <span>{log}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
