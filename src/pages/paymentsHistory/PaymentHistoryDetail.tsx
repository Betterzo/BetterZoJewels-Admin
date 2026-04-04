import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { fetchPayment } from "@/lib/api";
import { ArrowLeft, CreditCard, User, Package } from "lucide-react";

const DetailSkeleton = () => (
  <div className="space-y-6">
    <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
    <Card>
      <CardHeader>
        <div className="h-6 w-1/3 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
        ))}
      </CardContent>
    </Card>
  </div>
);

const statusBadge = (status: string) => {
  const key = (status || "").toLowerCase();
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline" }> = {
    completed: { variant: "default" },
    paid: { variant: "default" },
    success: { variant: "default" },
    pending: { variant: "outline" },
    failed: { variant: "destructive" },
    refunded: { variant: "destructive" },
  };
  const config = map[key] || { variant: "secondary" as const };
  return <Badge variant={config.variant}>{status || "—"}</Badge>;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const normalizePayment = (raw: any) => {
  if (!raw) return null;
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    return raw.data;
  }
  return raw;
};

const PaymentHistoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPayment(id);
        const p = normalizePayment(res);
        setPayment(p);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load payment");
        navigate("/payments-history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (!payment) {
    return null;
  }

  const amount = parseFloat(
    payment.amount ?? payment.paid_amount ?? payment.total ?? 0
  );
  const status = payment.status ?? payment.payment_status ?? "";
  const orderId = payment.order_id ?? payment.order?.id;
  const orderLabel =
    payment.order?.order_number ??
    payment.order_number ??
    (orderId ? `#${orderId}` : null);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/payments-history" aria-label="Back to payments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment #{payment.id}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {formatDate(payment.created_at ?? payment.paid_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">{formatCurrency(amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{statusBadge(status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Method</p>
                <p className="font-medium capitalize">
                  {(payment.payment_method ?? payment.method ?? "—")
                    .toString()
                    .replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium">{payment.currency ?? "INR"}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Razorpay order ID</p>
                <p className="font-mono break-all">
                  {payment.rzpay_order_id ?? payment.razorpay_order_id ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Transaction / payment ID</p>
                <p className="font-mono break-all">
                  {payment.rzpay_transaction_id ??
                    payment.razorpay_payment_id ??
                    payment.transaction_id ??
                    "—"}
                </p>
              </div>
            </div>
            {payment.notes || payment.meta ? (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Notes / metadata</p>
                  <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(payment.notes ?? payment.meta, null, 2)}
                  </pre>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Name: </span>
                {payment.user_name ?? payment.user?.name ?? payment.customer_name ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Email: </span>
                {payment.user_email ?? payment.user?.email ?? payment.customer_email ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Phone: </span>
                {payment.phone ?? payment.user?.phone ?? "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderId ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/orders/${orderId}`}>
                    Open order {orderLabel ? `(${orderLabel})` : ""}
                  </Link>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No linked order.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryDetail;
