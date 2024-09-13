import { HomeIcon, MapIcon, AlertTriangle, StreetView, Tree } from "lucide-react";
import Index from "./pages/Index.jsx";
import MapPage from "./pages/MapPage.jsx";
import ReportCrimePage from "./pages/ReportCrimePage.jsx";
import StreetViewPage from "./pages/StreetViewPage.jsx";
import TreesPage from "./pages/TreesPage.jsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Mapa",
    to: "/map",
    icon: <MapIcon className="h-4 w-4" />,
    page: <MapPage />,
  },
  {
    title: "Informar Ocorrências",
    to: "/report-crime",
    icon: <AlertTriangle className="h-4 w-4" />,
    page: <ReportCrimePage />,
  },
  {
    title: "Mapas de Rua",
    to: "/street-view",
    icon: <StreetView className="h-4 w-4" />,
    page: <StreetViewPage />,
  },
  {
    title: "Árvores AHPICE",
    to: "/trees",
    icon: <Tree className="h-4 w-4" />,
    page: <TreesPage />,
  },
];