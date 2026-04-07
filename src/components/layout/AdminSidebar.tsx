import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Users,
  LogIn,
  Home,
  Menu,
  X,
  Grid2x2Plus,
  Boxes,
  ShoppingCart,
  Percent,
  MessageCircle,
  CreditCard,
  BookOpen,
  ChevronDown,
} from "lucide-react";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
};

const SidebarItem = ({ icon: Icon, label, to, isActive }: SidebarItemProps) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-4 py-3 rounded-lg font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
            : "hover:bg-sidebar-accent/20 hover:text-sidebar-foreground text-sidebar-foreground/80"
        )}
      >
        <Icon size={20} />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [productMenuOpen, setProductMenuOpen] = useState(
    location.pathname.startsWith("/products") || location.pathname.startsWith("/categories")
  );
  const [blogMenuOpen, setBlogMenuOpen] = useState(
    location.pathname.startsWith("/blogs") || location.pathname.startsWith("/blog-categories")
  );

  const topMenuItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: ShoppingCart, label: "Orders", to: "/orders" },
    { icon: CreditCard, label: "Payments history", to: "/payments-history" },
    { icon: Percent, label: "Coupons", to: "/coupons" },
  ];

  const bottomMenuItems = [
    { icon: MessageCircle, label: "Inquiries", to: "/inquiries" },
    { icon: Users, label: "Users", to: "/users" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: LogIn, label: "Logout", to: "/logout" },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-sidebar-foreground bg-sidebar-background border border-sidebar-border shadow-md rounded-full"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ease-in-out border-r border-sidebar-border",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / header */}
          <div className="p-5 border-b border-sidebar-border bg-sidebar/90">
            <h1 className="text-xl font-bold flex items-center gap-3">
              <span className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-full shadow">
                BetterZoJewels
              </span>
              Portal
            </h1>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
            <div className="space-y-1">
              {topMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={
                    item.to === "/payments-history"
                      ? location.pathname.startsWith("/payments-history")
                      : item.to === "/blog-categories"
                      ? location.pathname.startsWith("/blog-categories")
                      : location.pathname === item.to
                  }
                />
              ))}

              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between gap-3 pl-4 py-3 rounded-lg font-medium transition-all duration-200",
                  location.pathname.startsWith("/products") || location.pathname.startsWith("/categories")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                    : "hover:bg-sidebar-accent/20 hover:text-sidebar-foreground text-sidebar-foreground/80"
                )}
                onClick={() => setProductMenuOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-3">
                  <Boxes size={20} />
                  <span>Product Management</span>
                </span>
                <ChevronDown
                  size={16}
                  className={cn("transition-transform", productMenuOpen ? "rotate-180" : "rotate-0")}
                />
              </Button>
              {productMenuOpen && (
                <div className="ml-4 space-y-1">
                  <SidebarItem
                    icon={Boxes}
                    label="Products"
                    to="/products"
                    isActive={location.pathname === "/products"}
                  />
                  <SidebarItem
                    icon={Grid2x2Plus}
                    label="Categories"
                    to="/categories"
                    isActive={location.pathname === "/categories"}
                  />
                 
                </div>
              )}

              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between gap-3 pl-4 py-3 rounded-lg font-medium transition-all duration-200",
                  location.pathname.startsWith("/blogs") || location.pathname.startsWith("/blog-categories")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-inner"
                    : "hover:bg-sidebar-accent/20 hover:text-sidebar-foreground text-sidebar-foreground/80"
                )}
                onClick={() => setBlogMenuOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-3">
                  <BookOpen size={20} />
                  <span>Blog Management</span>
                </span>
                <ChevronDown
                  size={16}
                  className={cn("transition-transform", blogMenuOpen ? "rotate-180" : "rotate-0")}
                />
              </Button>

              {blogMenuOpen && (
                <div className="ml-4 space-y-1">
                  <SidebarItem
                    icon={BookOpen}
                    label="Blog"
                    to="/blogs"
                    isActive={location.pathname === "/blogs"}
                  />
                
                  <SidebarItem
                    icon={BookOpen}
                    label="Blog Categories"
                    to="/blog-categories"
                    isActive={location.pathname.startsWith("/blog-categories")}
                  />
                </div>
              )}

              {bottomMenuItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={location.pathname === item.to}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border text-sm text-sidebar-foreground/60">
            <p>BetterZoJewels Admin v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
