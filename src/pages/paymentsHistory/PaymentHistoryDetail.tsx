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
import { formatIndianCurrency as formatCurrency } from "@/lib/utils";

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
  const map: Record<string, any> = {
    completed: { variant: "default" },
    paid: { variant: "default" },
    success: { variant: "default" },
    pending: { variant: "outline" },
    failed: { variant: "destructive" },
    refunded: { variant: "destructive" },
  };
  const config = map[key] || { variant: "secondary" };
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

const normalizePayment = (raw: any) => {
  if (!raw) return null;

  const data = raw.data ?? raw;

  let paymentInfo = data.payment_information;

  // 🔥 string → object
  if (typeof paymentInfo === "string") {
    try {
      paymentInfo = JSON.parse(paymentInfo);
    } catch {
      paymentInfo = {};
    }
  }

  return {
    ...data,
    payment_information: paymentInfo,

    razorpay_order_id:
      data.rzpay_order_id ??
      data.razorpay_order_id ??
      paymentInfo?.razorpay_order_id,

    razorpay_payment_id:
      data.rzpay_transaction_id ??
      data.razorpay_payment_id ??
      paymentInfo?.razorpay_payment_id,
  };
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

  if (loading) return <DetailSkeleton />;
  if (!payment) return null;

  const amount = parseFloat(
    payment.amount ?? payment.paid_amount ?? payment.total ?? 0
  );

  const status = payment.status ?? payment.payment_status ?? "";

  // 🔥 UNIQUE ORDERS
  const orders =
    payment.ordered_products?.reduce((acc: any[], item: any) => {
      if (!acc.find((o) => o.order_id === item.order_id)) {
        acc.push({
          order_id: item.order_id,
          order_number: item.order_number,
        });
      }
      return acc;
    }, []) || [];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/payments-history">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Payment #{payment.id}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(payment.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment details
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">{formatCurrency(amount)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {statusBadge(status)}
              </div>
            </div>

            <Separator />

            {/* Razorpay */}
            <div>
              <p className="text-sm text-muted-foreground">
                Razorpay Order ID
              </p>
              <p className="font-mono">
                {payment.razorpay_order_id ?? "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Payment ID
              </p>
              <p className="font-mono">
                {payment.razorpay_payment_id ?? "—"}
              </p>
            </div>

            {/* PRODUCTS */}
            {payment.ordered_products?.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Products
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {payment.ordered_products.map(
                      (item: any, index: number) => (
                        <Badge key={index} variant="secondary">
                          {item.product_name}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* CUSTOMER */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm space-y-1">
              <p>{payment.user_name}</p>
              <p>{payment.user_email}</p>
              <p>{payment.phone}</p>
            </CardContent>
          </Card>

          {/* ORDERS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Orders
              </CardTitle>
            </CardHeader>

            <CardContent>
              {orders.length > 0 ? (
                <div className="space-y-2">
                  {orders.map((order: any, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link to={`/orders/${order.order_id}`}>
                        Open order ({order.order_number})
                      </Link>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No linked order.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryDetail;