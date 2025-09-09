import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("user", "routes/userOverview.tsx"),
  route("fragen", "routes/question.tsx"),
  route("Lernbereich", "routes/subject.tsx"),
  route("klassen", "routes/klassen.tsx"),
  // route("test", "routes/test.tsx"), add routes like this
] satisfies RouteConfig;
