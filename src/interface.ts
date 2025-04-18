export   interface Employee {
    id: number;
    fullName: string;
    email: string;
    jobRole: string;
    department: string;
    startDate: string;
    tasks: Array<{ id: number; name: string; completed: boolean; }>;
    customTasks: Array<{ id: number; name: string; completed: boolean; }>;
    fullyOnboarded: boolean;
  }

