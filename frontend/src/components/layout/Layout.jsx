import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../../context/AuthContext";

const Layout = () => {
  const { user } = useAuth();
  const isAdmin = user?.userType === "admin";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
       {!isAdmin && <Footer />}
    </div>
  );
};

export default Layout;
