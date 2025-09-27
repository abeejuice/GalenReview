import { useState } from "react";
import { Link, useLocation } from "wouter";
import { getSession } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  const { data: user } = useQuery({
    queryKey: ['/api/auth/session'],
    queryFn: getSession,
  });

  const isActive = (path: string) => location === path;

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-microscope text-primary text-xl"></i>
              <h1 className="text-xl font-bold text-foreground">GalenAI Reviewer</h1>
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/">
              <Button 
                variant={isActive('/') ? 'default' : 'ghost'} 
                size="sm"
                className="px-4 py-2"
                data-testid="nav-queue"
              >
                <i className="fas fa-inbox mr-2"></i>Review Queue
              </Button>
            </Link>
            <Link href="/intake">
              <Button 
                variant={isActive('/intake') ? 'default' : 'ghost'} 
                size="sm"
                className="px-4 py-2"
                data-testid="nav-intake"
              >
                <i className="fas fa-plus mr-2"></i>Intake
              </Button>
            </Link>
            <Link href="/journal">
              <Button 
                variant={isActive('/journal') ? 'default' : 'ghost'} 
                size="sm"
                className="px-4 py-2"
                data-testid="nav-journal"
              >
                <i className="fas fa-journal-whills mr-2"></i>Journal
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                variant={isActive('/analytics') ? 'default' : 'ghost'} 
                size="sm"
                className="px-4 py-2"
                data-testid="nav-analytics"
              >
                <i className="fas fa-chart-bar mr-2"></i>Analytics
              </Button>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {user.role}
                  </span>
                  <span className="text-sm text-muted-foreground" data-testid="user-email">
                    {user.email}
                  </span>
                </div>
                <Button variant="ghost" size="sm" data-testid="button-signout">
                  <i className="fas fa-sign-out-alt"></i>
                </Button>
              </>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm" data-testid="link-signin">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
