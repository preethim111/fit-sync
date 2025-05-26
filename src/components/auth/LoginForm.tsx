
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";  // your Supabase client

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log("hello");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password || (!isLogin && !confirmPassword)) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
  
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
  
    try {
      if (isLogin) {
        // LOGIN FLOW
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
  
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
  
        toast({
          title: "Logged in!",
          description: "Welcome back!",
        });
  
        navigate("/home");
  
      } else {
        // SIGNUP FLOW
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
  
        if (error) {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
  
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
  
        navigate("/home");
      }
  
    } catch (err) {
      console.error(err);
      toast({
        title: "Unexpected error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };
  
  

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {isLogin ? "Log in" : "Create an account"}
        </CardTitle>
        <CardDescription>
          {isLogin 
            ? "Enter your email and password to access your account" 
            : "Fill in the information below to create your account"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your.email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full bg-buddy-purple hover:bg-buddy-purple-dark">
            {isLogin ? "Log in" : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
