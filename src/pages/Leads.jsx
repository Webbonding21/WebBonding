// /leads quedó dentro del panel del equipo: /admin/leads (components/leads/PanelLeads). Esta ruta lleva allá con los mismos
// filtros, para que los enlaces viejos sigan sirviendo.
import { Navigate, useLocation } from 'react-router-dom';

export default function Leads() {
  const { search } = useLocation();
  return <Navigate to={`/admin/leads${search}`} replace />;
}
