import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Button from "../button/Button";
import Logout from "../icons/logout/Logout";
import { disconnectSocket } from "@/socket/Socket";
import authService from "@/apiServices/authApi/AuthApi";
import { emptyResult } from "@/redux/slices/LoginUserDetailSlice";
import { AppDispatch } from "@/redux/store";

const LogoutButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const logoutHandler = async () => {
    try {
      // Call backend to clear cookies
      await authService.logout();
    } catch (error) {
      console.error("Backend logout failed", error);
    }

    disconnectSocket();

    // Comprehensive cleanup
    localStorage.clear();
    sessionStorage.clear();

    const clearCaches =
      "caches" in window
        ? caches
            .keys()
            .then((names) =>
              Promise.all(names.map((name) => caches.delete(name))),
            )
        : Promise.resolve();

    const unregisterServiceWorkers =
      "serviceWorker" in navigator
        ? navigator.serviceWorker
            .getRegistrations()
            .then((regs) => Promise.all(regs.map((reg) => reg.unregister())))
        : Promise.resolve();

    Promise.all([clearCaches, unregisterServiceWorkers]).then(() => {
      dispatch(emptyResult());
      navigate("/");
    });
  };
  return (
    <div className="px-2 mt-auto md:mt-2">
      <Button
        text="Logout"
        icon={<Logout stroke="#fff" className="" />}
        onclick={logoutHandler}
      />
    </div>
  );
};

export default LogoutButton;
