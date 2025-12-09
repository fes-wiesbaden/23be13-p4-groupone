export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
  courses: CourseDto[]
}

export interface CourseDto {
  id: string;
  courseName: string;
  classTeacher: User;
}
