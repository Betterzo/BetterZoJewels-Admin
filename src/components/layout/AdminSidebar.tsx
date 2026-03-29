import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Users,
  LogIn,
  FileText,
  Home,
  Menu,
  X,
  Images,
  Grid2x2Plus,
  Boxes,
  ShoppingCart,
  Percent,
  MessageCircle,
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

  const menuItems = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },
    { icon: Grid2x2Plus, label: "Categories", to: "/categories" },
    { icon: Boxes, label: "Products", to: "/products" },
    { icon: ShoppingCart, label: "Orders", to: "/orders" },
    { icon: Percent, label: "Coupons", to: "/coupons" },
    { icon: FileText, label: "Blogs", to: "/blogs" },
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
        {isOpen ? <X size={24} /> : <Menu size={24} />} test
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
              {menuItems.map((item) => (
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
