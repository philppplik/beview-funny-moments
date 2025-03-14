
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { beRealApi } from "@/services/beRealApiService";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  sendOTP: (phoneNumber: string) => Promise<boolean>;
  verifyOTP: (phoneNumber: string, code: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = beRealApi.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        // Get user data from localStorage
        const storedUser = localStorage.getItem("beview_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const sendOTP = async (phoneNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await beRealApi.sendOTP(phoneNumber);
      
      if (success) {
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code.",
        });
      } else {
        toast({
          title: "Failed to send OTP",
          description: "Please check your phone number and try again.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Send OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (phoneNumber: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await beRealApi.verifyOTP(phoneNumber, code);
      
      if (success) {
        // For now, create a basic user object
        // In the future, we'd fetch the actual user profile from BeReal
        const userData = {
          id: localStorage.getItem("bereal_user_id") || "unknown",
          username: phoneNumber,
          phone: phoneNumber,
        };
        
        // Store user data
        localStorage.setItem("beview_user", JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast({
          title: "Login successful",
          description: "You're now logged in to BeView!",
        });
      } else {
        toast({
          title: "Verification failed",
          description: "Invalid code. Please try again.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    beRealApi.logout();
    localStorage.removeItem("beview_user");
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      sendOTP,
      verifyOTP,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
