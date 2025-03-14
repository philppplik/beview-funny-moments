
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendOTP, verifyOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Validate E.164 format - international phone number format
  const isValidPhoneNumber = (phone: string) => {
    // Simplified validation - should be improved with a library like libphonenumber-js
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phone);
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    
    // Normalize phone number
    let normalizedPhone = phoneNumber.replace(/\D/g, "");
    
    // Ensure it has country code
    if (!normalizedPhone.startsWith("+")) {
      if (!normalizedPhone.startsWith("1")) {
        normalizedPhone = "1" + normalizedPhone; // Default to US
      }
      normalizedPhone = "+" + normalizedPhone;
    }
    
    // Validate the phone number
    if (!isValidPhoneNumber(normalizedPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number with country code (e.g., +14155552671)",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await sendOTP(normalizedPhone);
      if (success) {
        setOtpSent(true);
        // Update the phone number with normalized version
        setPhoneNumber(normalizedPhone);
      } else {
        toast({
          title: "Failed to send verification code",
          description: "Please check your phone number or try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP send error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await verifyOTP(phoneNumber, otpCode);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to BeView!",
        });
        navigate("/");
      } else {
        toast({
          title: "Verification failed",
          description: "Invalid code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container py-12 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login to BeView</CardTitle>
            <CardDescription className="text-center">
              View BeReal moments from your friends
            </CardDescription>
          </CardHeader>
          
          {!otpSent ? (
            // Phone number form
            <form onSubmit={handleSendOTP}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 555 123 4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Include your country code (e.g., +1 for US)
                  </p>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    For testing, any valid phone number format will work. No actual SMS will be sent.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            // OTP verification form
            <form onSubmit={handleVerifyOTP}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpCode">Verification Code</Label>
                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={setOtpCode}
                      disabled={isSubmitting}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code sent to {phoneNumber}
                  </p>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    For testing, any 6-digit code will work.
                  </AlertDescription>
                </Alert>
                
                <div className="pt-2">
                  <Button 
                    type="button" 
                    variant="link" 
                    className="px-0 h-auto font-normal text-sm"
                    onClick={() => setOtpSent(false)}
                    disabled={isSubmitting}
                  >
                    Change phone number
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify and Login"
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
