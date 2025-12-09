import type { Route } from "./+types/home";
import { useNavigate } from "react-router-dom";
import { useAuth } from "~/contexts/AuthContext";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid as Grid,
  Typography,
  Avatar,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import GradeIcon from "@mui/icons-material/Grade";
import QuizIcon from "@mui/icons-material/Quiz";
import ProjectIcon from "@mui/icons-material/Work";
import LearningIcon from "@mui/icons-material/MenuBook";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PollIcon from "@mui/icons-material/Poll";
import { Role } from "~/types/models";

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  roles?: Role[];
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GradeSave - Dashboard" },
    { name: "description", content: "Your grade management dashboard" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardCards: DashboardCard[] = [
    {
      title: "Klassen",
      description: "Verwalten Sie Ihre Klassen und Kurse",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: "/klassen",
      color: "#1976d2",
      roles: [Role.ADMIN],
    },
    {
      title: "Benutzer",
      description: "Benutzerverwaltung und Berechtigungen",
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: "/user",
      color: "#388e3c",
      roles: [Role.ADMIN],
    },
    {
      title: "Fragen",
      description: "Erstellen und verwalten Sie Prüfungsfragen",
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      path: "/fragen",
      color: "#f57c00",
      roles: [Role.ADMIN, Role.TEACHER],
    },
    {
      title: "Noten",
      description: "Notenverwaltung und Bewertungen",
      icon: <GradeIcon sx={{ fontSize: 40 }} />,
      path: "/noten",
      color: "#d32f2f",
      roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
    },
    {
      title: "Projekte",
      description: "Projektarbeiten und Aufgaben verwalten",
      icon: <ProjectIcon sx={{ fontSize: 40 }} />,
      path: "/projekte",
      color: "#7b1fa2",
      roles: [Role.ADMIN],
    },
    {
      title: "Lernbereich",
      description: "Lernmaterialien und Ressourcen",
      icon: <LearningIcon sx={{ fontSize: 40 }} />,
      path: "/lernbereich",
      color: "#0288d1",
      roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
    },
    {
      title: "PDF Benutzer Daten",
      description: "Übersicht und Download Ihrer PDF-Dateien aus der Erstellung von Benutzern",
      icon: <PictureAsPdfIcon sx={{ fontSize: 40 }} />,
      path: "/pdfs",
      color: "#0288d1",
      roles: [Role.ADMIN],
    },
    {
        title: "Fragebögen",
        description: "Verwalten und Bearbeiten von Fragebögen für die Projekte",
        icon: <PollIcon sx={{ fontSize: 40 }} />,
        path: "/fragebogen",
        color: "#0288d1",
        roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
    },
  ];

  const filteredCards = dashboardCards.filter((card) => {
    if (!card.roles || card.roles.length === 0) {
      return true;
    }
    return user && card.roles.includes(user.role);
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Willkommen zurück, {user?.username || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Was möchten Sie heute tun?
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredCards.map((card) => (
          <Grid key={card.path} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              sx={{
                height: "100%",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(card.path)}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  p: 3,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: card.color,
                    width: 64,
                    height: 64,
                    mb: 2,
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </Avatar>
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
