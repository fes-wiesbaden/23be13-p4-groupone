export enum Role {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER",
    ADMIN = "ADMIN"
}

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
