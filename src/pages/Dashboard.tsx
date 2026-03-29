import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, Users, MessageSquare } from "lucide-react";
import { fetchDashboardStats, fetchOrders, fetchProducts } from "@/lib/api";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const StatCard = ({ title, value, description, icon, color, action, to }: any) => {
  const cardContent = (
    <Card className="transition-shadow shadow hover:shadow-lg hover:-translate-y-1 duration-200 relative h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color} animate-pulse-slow`}>{icon}</div>
        {action && (
          <div
            className="absolute top-3 right-3 z-10"
            onClick={(e) => {
              if (to) e.preventDefault();
            }}
          >
            {action}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block outline-none">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

const StatCardSkeleton = () => (
  <Card className="transition-shadow shadow hover:shadow-lg hover:-translate-y-1 duration-200">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-20 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
    </CardContent>
  </Card>
);

const RecentActivityCard = () => {
  const activities = [
    { id: 1, action: "New booking", details: "Golden Triangle Tour", time: "2 minutes ago" },
    { id: 2, action: "Updated tour", details: "Bangkok City Tour", time: "1 hour ago" },
    { id: 3, action: "New user registered", details: "john.doe@example.com", time: "3 hours ago" },
    { id: 4, action: "New blog post", details: "Top 10 Places to Visit in Thailand", time: "Yesterday" },
    { id: 5, action: "Updated destination", details: "Phuket Island", time: "Yesterday" }
  ];

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the admin portal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-start border-b pb-3 last:border-0 last:pb-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary mr-3"></div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.action}</p>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const UpcomingToursCard = () => {
  const upcomingTours = [
    { id: 1, name: "Jaipur City Tour", date: "Apr 25, 2025", bookings: 12 },
    { id: 2, name: "Bangkok Explorer", date: "Apr 28, 2025", bookings: 8 },
    { id: 3, name: "Phuket Beach Getaway", date: "May 3, 2025", bookings: 15 },
    { id: 4, name: "Chiang Mai Adventure", date: "May 5, 2025", bookings: 7 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tours</CardTitle>
        <CardDescription>Tours starting in the next 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingTours.map(tour => (
            <div key={tour.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-sm">{tour.name}</p>
                <p className="text-xs text-muted-foreground">{tour.date}</p>
              </div>
              <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                {tour.bookings} bookings
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [statsData, ordersData, productsData] = await Promise.all([
          fetchDashboardStats().catch(() => null),
          fetchOrders({ page: 1 }).catch(() => null),
          fetchProducts({ page: 1 }).catch(() => null),
        ]);

        const totalOrders = ordersData?.data?.total || ordersData?.data?.data?.length || 0;
        const totalProducts = productsData?.data?.total || productsData?.data?.data?.length || 0;

        setStats({
          ...(statsData || {}),
          total_orders: totalOrders > 0 ? totalOrders : "-",
          total_products: totalProducts > 0 ? totalProducts : "-",
        });
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      <h2 className="text-xl font-semibold mt-8 mb-2">Overview</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Orders"
              value={stats?.total_orders ?? "-"}
              description="Total orders"
              icon={<ShoppingCart className="h-4 w-4 text-white" />}
              color="bg-gradient-to-tr from-blue-500 to-blue-700 text-white"
              to="/orders"
            />
            <StatCard
              title="Products"
              value={stats?.total_products ?? "-"}
              description="Total products"
              icon={<Package className="h-4 w-4 text-white" />}
              color="bg-gradient-to-tr from-purple-500 to-pink-500 text-white"
              to="/products"
              action={
                <Link to="/products/add">
                  <button className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-1 shadow transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </Link>
              }
            />
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? "-"}
              description="Total registered users"
              icon={<Users className="h-4 w-4 text-white" />}
              color="bg-gradient-to-tr from-orange-400 to-yellow-500 text-white"
              to="/users"
              action={
                <Link to="/users">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1 shadow transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </Link>
              }
            />
            <StatCard
              title="Contact Enquiries"
              value={stats?.total_enquiries ?? "-"}
              description="Total received enquiries"
              icon={<MessageSquare className="h-4 w-4 text-white" />}
              color="bg-gradient-to-tr from-teal-400 to-teal-700 text-white"
              to="/enquiries"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
