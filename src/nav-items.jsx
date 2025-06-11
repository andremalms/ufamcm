
import { HomeIcon, MapIcon, AlertTriangle, Map, Leaf, TreesIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import MapPage from "./pages/MapPage.jsx";
import ReportCrimePage from "./pages/ReportCrimePage.jsx";
import StreetViewPage from "./pages/StreetViewPage.jsx";
import TreesPage from "./pages/TreesPage.jsx";
import TrailsPage from "./pages/TrailsPage.jsx";

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
    icon: <Map className="h-4 w-4" />,
    page: <StreetViewPage />,
  },
  {
    title: "TRAILS",
    to: "/trails",
    icon: <TreesIcon className="h-4 w-4" />,
    page: <TrailsPage />,
  },
  {
    title: "Árvores AHPICE",
    to: "/trees",
    icon: <Leaf className="h-4 w-4" />,
    page: <TreesPage />,
  },
];
