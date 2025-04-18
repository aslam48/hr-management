import { useState, useEffect } from 'react';
import { Search, PlusCircle, Download } from 'lucide-react';
import { Employee } from './interface';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobRole: '',
    department: '',
    startDate: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load initial data from localStorage - FIXED
  useEffect(() => {
    try {
      const savedEmployees = localStorage.getItem('employees');
      if (savedEmployees) {
        const parsedEmployees = JSON.parse(savedEmployees);
        console.log('Loaded from localStorage:', parsedEmployees);
        setEmployees(parsedEmployees);
      } else {
        console.log('No saved employees found in localStorage');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever employees change - IMPROVED
  useEffect(() => {
    try {
      console.log('Saving to localStorage:', employees);
      localStorage.setItem('employees', JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }, [employees]);

  // Default predefined onboarding tasks
  const predefinedTasks = [
    { id: 1, name: 'Sign NDA', completed: false },
    { id: 2, name: 'Submit ID documents', completed: false },
    { id: 3, name: 'Set up email', completed: false },
    { id: 4, name: 'Complete HR orientation', completed: false },
    { id: 5, name: 'Access company tools (GitHub, Slack, etc.)', completed: false },
    { id: 6, name: 'Book intro meeting with manager', completed: false }
  ];

  // Handle form input changes
  const handleChange = (e: { target: { name: string; value: string; }; }) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add new employee
  const handleAddEmployee = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    const newEmployee = {
      id: Date.now(),
      ...formData,
      tasks: JSON.parse(JSON.stringify(predefinedTasks)),
      customTasks: [],
      fullyOnboarded: false
    };

    setEmployees([...employees, newEmployee]);
    setFormData({
      fullName: '',
      email: '',
      jobRole: '',
      department: '',
      startDate: ''
    });
    setShowAddForm(false);
  };

  // Toggle task completion
  const toggleTaskCompletion = (employeeId: number, taskId: number, isCustom = false) => {
    setEmployees(
      employees.map(employee => {
        if (employee.id === employeeId) {
          const taskCollection = isCustom ? 'customTasks' : 'tasks';
          const updatedTasks = employee[taskCollection].map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          
          const allTasksCompleted = [
            ...updatedTasks,
            ...(isCustom ? employee.tasks : employee.customTasks)
          ].every(task => task.completed);

          return {
            ...employee,
            [taskCollection]: updatedTasks,
            fullyOnboarded: allTasksCompleted
          };
        }
        return employee;
      })
    );
  };

  // Add custom task to employee
  const addCustomTask = (employeeId: number, taskName: string) => {
    if (!taskName.trim()) return;
    
    setEmployees(
      employees.map(employee => {
        if (employee.id === employeeId) {
          const newTask = {
            id: Date.now(),
            name: taskName,
            completed: false
          };
          return {
            ...employee,
            customTasks: [...employee.customTasks, newTask]
          };
        }
        return employee;
      })
    );
  };

  // Calculate progress percentage
  const calculateProgress = (employee: Employee) => {
    const totalTasks = employee.tasks.length + employee.customTasks.length;
    if (totalTasks === 0) return 0;
    
    const completedTasks = [
      ...employee.tasks,
      ...employee.customTasks
    ].filter(task => task.completed).length;
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  // Mark employee as fully onboarded
  const markAsFullyOnboarded = (employeeId: number, status: boolean) => {
    setEmployees(
      employees.map(employee => 
        employee.id === employeeId 
          ? { ...employee, fullyOnboarded: status } 
          : employee
      )
    );
  };

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.jobRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'completed') return matchesSearch && employee.fullyOnboarded;
    if (filterStatus === 'in-progress') {
      const progress = calculateProgress(employee);
      return matchesSearch && progress > 0 && progress < 100;
    }
    if (filterStatus === 'not-started') {
      const progress = calculateProgress(employee);
      return matchesSearch && progress === 0;
    }
    
    return matchesSearch;
  });

  // Export data as CSV
  const exportToCSV = () => {
    const headers = ['Full Name', 'Email', 'Job Role', 'Department', 'Start Date', 'Onboarding Status', 'Progress'];
    
    let csvContent = headers.join(',') + '\n';
    
    employees.forEach(employee => {
      const progress = calculateProgress(employee);
      const status = employee.fullyOnboarded ? 'Fully Onboarded' : 
                    (progress > 0 ? 'In Progress' : 'Not Started');
      
      const row = [
        `"${employee.fullName}"`,
        `"${employee.email}"`,
        `"${employee.jobRole}"`,
        `"${employee.department}"`,
        `"${employee.startDate}"`,
        `"${status}"`,
        `"${progress}%"`
      ];
      
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'employee_onboarding_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <header className="bg-blue-700 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Employee Onboarding Tracker</h1>
          <p className="mt-2">A lightweight tool for HR to track employee onboarding status</p>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employees..."
                className="pl-10 pr-4 py-2 border rounded w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              className="border rounded px-3 py-2 bg-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <PlusCircle size={18} />
              <span>Add Employee</span>
            </button>
            
            <button 
              onClick={exportToCSV}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700"
            >
              <Download size={18} />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Add Employee Form */}
        {showAddForm && (
          <div className="bg-white rounded shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Role*
                  </label>
                  <input
                    type="text"
                    name="jobRole"
                    required
                    value={formData.jobRole}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department*
                  </label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Employee List */}
        {filteredEmployees.length > 0 ? (
          <div className="space-y-6">
            {filteredEmployees.map(employee => {
              const progress = calculateProgress(employee);
              const statusColor = 
                employee.fullyOnboarded ? 'bg-green-500' :
                progress === 0 ? 'bg-red-500' :
                'bg-yellow-500';
              
              return (
                <div key={employee.id} className="bg-white rounded shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{employee.fullName}</h3>
                        <div className="text-gray-600 mt-1">{employee.jobRole} | {employee.department}</div>
                        <div className="text-gray-500 text-sm">{employee.email}</div>
                        {employee.startDate && (
                          <div className="text-gray-500 text-sm mt-1">Start Date: {employee.startDate}</div>
                        )}
                      </div>
                      
                      <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                          <div className="font-medium">
                            {employee.fullyOnboarded ? 'Fully Onboarded' : progress === 0 ? 'Not Started' : 'In Progress'}
                          </div>
                        </div>
                        
                        <div className="mt-2 w-full md:w-64">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${statusColor}`}
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={employee.fullyOnboarded}
                              onChange={() => markAsFullyOnboarded(employee.id, !employee.fullyOnboarded)}
                              className="rounded text-blue-600"
                            />
                            <span className="text-sm">Mark as Fully Onboarded</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Onboarding Tasks</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {employee.tasks.map(task => (
                          <div 
                            key={task.id}
                            className="flex items-center border rounded p-3 bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskCompletion(employee.id, task.id)}
                              className="rounded text-blue-600"
                            />
                            <span className={`ml-3 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name}
                            </span>
                          </div>
                        ))}
                        
                        {employee.customTasks.map(task => (
                          <div 
                            key={task.id}
                            className="flex items-center border rounded p-3 bg-blue-50"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTaskCompletion(employee.id, task.id, true)}
                              className="rounded text-blue-600"
                            />
                            <span className={`ml-3 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Add Custom Task</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter task name"
                            className="border rounded px-3 py-2 flex-1"
                            id={`custom-task-${employee.id}`}
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(`custom-task-${employee.id}`) as HTMLInputElement;
                              if (input) {
                                addCustomTask(employee.id, input.value);
                                input.value = '';
                              }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              {employees.length === 0
                ? "No employees added yet. Add your first employee to get started."
                : "No employees match your search criteria."}
            </p>
          </div>
        )}
      </main>
      
      <footer className="bg-gray-800 text-white py-6 fixed bottom-0 w-full">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Employee Onboarding Tracker | A lightweight HR management tool</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
