
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Home, Search, Menu, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl">BeView</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" className="flex items-center gap-2 py-2">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link to="/explore" className="flex items-center gap-2 py-2">
                    <Search className="h-5 w-5" />
                    <span>Explore</span>
                  </Link>
                  {isAuthenticated ? (
                    <Button variant="ghost" onClick={logout} className="flex items-center gap-2 justify-start px-2">
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </Button>
                  ) : (
                    <Link to="/login" className="flex items-center gap-2 py-2">
                      <LogIn className="h-5 w-5" />
                      <span>Login</span>
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/explore" className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              <span>Explore</span>
            </Link>
            {isAuthenticated ? (
              <Button variant="ghost" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            ) : (
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-muted/50">
        <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeView. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Not affiliated with BeReal.
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
