import React, { useState, useEffect, Fragment } from 'react';
import { Search, PlusCircle, Download, UserRoundSearch, UserRoundPlus } from 'lucide-react';
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add new employee
  const handleAddEmployee = (e) => {
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
    <Fragment>
      <div className=" pb-24 min-h-screen">
        <header className="bg-gray-800 text-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl  capitalize font-bold">
              Hr manager Tracker
            </h1>
            <p className="mt-2">A tool for tracking employee status</p>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 ">
          <div className="mb-8 flex flex-col  md:flex-row justify-between items-start gap-4">
            <div className="flex-1 w-full ">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search employees"
                  className="w-full pl-10 pr-4 py-2 border rounded outline-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={filterStatus}
                />
                <UserRoundSearch
                  size={20}
                  className="absolute left-3 top-2.5 text-gray-400"
                />
              </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <select
                className="border rounded px-3 py-2 bg-white"
                onChange={() => {}}
                value={`all`}
              >
                <option value="all">All Status</option>
                <option value="active">Not Started </option>
                <option value="active">In Progress</option>
                <option value="active">Completed</option>
              </select>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                Add Employee
                <UserRoundPlus size={20} />
              </button>
            </div>
          </div>

          {/* add employee  */}
          {showAddForm && (
          <div className="bg-white shadow-md rounded p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add new Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 font-medium text-sm">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="FullName"
                    name="fullname"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 font-medium text-sm">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="email"
                    name="email"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 font-medium text-sm">
                    Job Role
                  </label>
                  <input
                    type="text"
                    placeholder="Job Role"
                    name="jobRole"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.jobRole}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 font-medium text-sm">
                    Departemnt
                  </label>
                  <input
                    type="text"
                    placeholder="Departemnt"
                    name="department"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 font-medium text-sm">
                    Job Role / Department
                  </label>
                  <input
                    type="date"
                    placeholder="startDate"
                    name="startDate"
                    required
                    className="w-full border rounded px-3 py-2"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {}}
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Add Employee
                </button>

                <button
                  onClick={() => {}}
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  cancel
                </button>
              </div>
            </form>
          </div>
          )}


          {/* list  */}
          {
            filteredEmployees.length > 0 ? (
              <div className='space-x-6'>
                {filteredEmployees.map(employees => {
                  const progress = calculateProgress(employees);
                  const statusColor = employees.fullyOnboarded ? "bg-green-500" : progress === 0 ? "bg-red-500" : "bg-yellow-500"

                  return (
                    <div>

                    </div>
                  )
                })}
              </div>
            )
          }


        </main>
      </div>
    </Fragment>
  );
}

export default App;
