import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("user", "routes/userOverview.tsx"),
  route("fragen", "routes/question.tsx"),
  route("klassen", "routes/klassen.tsx"),
  route("klassen/:courseId", "routes/createOrEditCourse.tsx"),
  route("Lernbereich", "routes/subject.tsx"),
  route("Projekte", "routes/projects.tsx"),
  route("Projekte/:projectId", "routes/createOrEditProject.tsx"),
  route("Login", "routes/login.tsx"),
  route("Noten", "routes/grades.tsx"),
  route("profil", "routes/profil.tsx"),
  // route("test", "routes/test.tsx"), add routes like this
] satisfies RouteConfig;
