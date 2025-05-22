
import { useEffect } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Dumbbell } from "lucide-react";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-buddy-purple-light to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center mb-8 animate-fade-in">
        <div className="bg-white p-3 rounded-full shadow-md mb-4">
          <Dumbbell size={40} className="text-buddy-purple" />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-2">FitSync</h1>
        <p className="text-center text-gray-600">
          Workout with a buddy, get real-time feedback, and improve together
        </p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default Login;
