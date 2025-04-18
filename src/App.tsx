import { UserRoundPlus, UserRoundSearch } from "lucide-react";
import { Fragment, useState } from "react";
import { Employee } from "./interface";


function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    jobRole: "",
    department: "",
    startDate: "",
  });

  const [SearchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);

const  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const{ name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }
  
    const handleAddEmployee = (e) => {
      e.preventDefault();

    }

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
                  value={""}
                  onChange={() => {}}
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
                onClick={() => {}}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                Add Employee
                <UserRoundPlus size={20} />
              </button>
            </div>
          </div>

          {/* add employee  */}
          <div className="bg-white shadow-md rounded p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add new Employee</h2>
            <form onSubmit={() => {}}>
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
                    value={""}
                    onChange={() => {}}
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
                    value={""}
                    onChange={() => {}}
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
                    value={""}
                    onChange={() => {}}
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
                    value={""}
                    onChange={() => {}}
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
                    value={""}
                    onChange={() => {}}
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
        </main>
      </div>
    </Fragment>
  );
}

export default App;
