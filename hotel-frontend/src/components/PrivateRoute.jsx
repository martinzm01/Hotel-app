import { Navigate } from "react-router-dom";
///componente que protege las rutas de administrador
export default function PrivateRoute({ children, rol }) {
    if (rol !== "administrador") {
        return <Navigate to="/" replace />;
    }
    return children;
}
