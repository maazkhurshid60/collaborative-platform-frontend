import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = localStorage.getItem("token");
    const location = useLocation();

    // Routes that are allowed to be accessed within DashboardLayout even without a token
    const guestAllowedPaths = [
        "/select-plan",
        "/payment-checkout",
        "/payment-success",
        "/payment-failure",
        "/confirm-free-account"
    ];

    if (!token && !guestAllowedPaths.includes(location.pathname)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
