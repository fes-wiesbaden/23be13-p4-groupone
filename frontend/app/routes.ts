import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("user", "routes/userOverview.tsx"),
  route("pdfs", "routes/pdfs.tsx"),
  route("fragen", "routes/question.tsx"),
  route("fragebogen", "routes/questionbow-selection.tsx"),
  route("fragebogen/:projectId", "routes/questionbow.tsx"),
  route("klassen", "routes/klassen.tsx"),
  route("klassen/:courseId", "routes/createOrEditCourse.tsx"),
  route("Lernbereich", "routes/subject.tsx"),
  route("Projekte", "routes/projects.tsx"),
  route("Projekte/:projectId", "routes/createOrEditProject.tsx"),
  route("Login", "routes/login.tsx"),
  route("Noten", "routes/grades.tsx"),
  // route("test", "routes/test.tsx"), add routes like this
] satisfies RouteConfig;
