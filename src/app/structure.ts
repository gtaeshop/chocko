interface Teacher {
    id: number;
    name: string;
    subject: string;
  }
  
  interface Class {
    id: number;
    name: string;
    teacherId: number;
    roomId: number;
    startTime: string; // e.g., '09:00'
    endTime: string; // e.g., '10:00'
    day: string; // e.g., 'Monday'
  }
  
  interface Room {
    id: number;
    name: string;
    capacity: number;
  }
  
  interface Timetable {
    classes: Class[];
    teachers: Teacher[];
    rooms: Room[];
  }
  