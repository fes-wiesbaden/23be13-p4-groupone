import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Divider,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import API_CONFIG from "~/apiConfig";
import type { Route } from "./+types/pdfs";

interface PdfFile {
  name: string;
  size: number;
  lastModified: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "GradeSave - PDFs" },
    { name: "description", content: "Download your PDF files" },
  ];
}

export default function Pdfs() {
  const navigate = useNavigate();
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/pdfs`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Laden der PDF-Dateien");
      }

      const data = await response.json();
      const sortedData = data.sort((a: PdfFile, b: PdfFile) => b.lastModified - a.lastModified);
      setPdfs(sortedData);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/pdfs/download/${encodeURIComponent(filename)}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Herunterladen der Datei");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError(err instanceof Error ? err.message : "Fehler beim Herunterladen");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={() => navigate("/")}
          sx={{ mr: 2 }}
          aria-label="zurück"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          PDF-Dateien
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : pdfs.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <PictureAsPdfIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Keine PDF-Dateien verfügbar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Es wurden noch keine PDF-Dateien hochgeladen.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Verfügbare Dokumente ({pdfs.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {pdfs.map((pdf, index) => (
                  <Box key={pdf.name}>
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="download"
                          onClick={() => handleDownload(pdf.name)}
                          color="primary"
                        >
                          <DownloadIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <PictureAsPdfIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary={pdf.name}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatFileSize(pdf.size)}
                            </Typography>
                            {" • "}
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(pdf.lastModified)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < pdfs.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
