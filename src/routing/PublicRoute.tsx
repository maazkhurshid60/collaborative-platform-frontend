import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const role = useSelector((state: RootState) => state.LoginUserDetail.userDetails?.user?.role);

    if (token) {
        if (role === "client") {
            return <Navigate to="/documents" replace />;
        } else if (role === "superAdmin") {
            return <Navigate to="/admin-dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <>{children}</>;
};

export default PublicRoute;
