
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dumbbell, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-buddy-purple-light to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <Dumbbell size={60} className="text-buddy-purple animate-pulse-scale" />
        </div>
        <h1 className="text-5xl font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">
          Oops! This workout routine doesn't exist yet
        </p>
        <Button 
          className="bg-buddy-purple hover:bg-buddy-purple-dark flex items-center gap-2"
          onClick={() => navigate("/")}
        >
          <Home size={18} />
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
