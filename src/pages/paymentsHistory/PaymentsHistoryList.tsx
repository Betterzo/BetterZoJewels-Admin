import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Search, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { fetchPayments } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatIndianCurrency as formatCurrency } from "@/lib/utils";

const PaymentsSkeleton = () => (
  <div className="p-4 space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-[120px] bg-gray-200 rounded" />
        <div className="h-8 w-[180px] bg-gray-200 rounded" />
        <div className="h-8 w-[100px] bg-gray-200 rounded" />
        <div className="h-8 w-[100px] bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded ml-auto" />
      </div>
    ))}
  </div>
);

const paymentStatusBadge = (status: string) => {
  const key = (status || "").toLowerCase();
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    completed: { variant: "default", label: "Completed" },
    paid: { variant: "default", label: "Paid" },
    success: { variant: "default", label: "Success" },
    pending: { variant: "outline", label: "Pending" },
    failed: { variant: "destructive", label: "Failed" },
    refunded: { variant: "destructive", label: "Refunded" },
  };
  const config = map[key] || { variant: "secondary" as const, label: status || "—" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const PaymentsHistoryList = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await fetchPayments({ page, search: searchQuery });
      const rows = res.data?.data ?? res.data?.payments;
      console.log("Fetched payments data:", res.data);
      setPayments(Array.isArray(rows) ? rows : []);
      setTotalPages(res.data?.last_page || 1);
      setPerPage(res.data?.per_page || 10);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const rowAmount = (p: any) =>
    parseFloat(p.amount ?? p.paid_amount ?? p.total ?? 0);

  const rowStatus = (p: any) => p.status ?? p.payment_status ?? "";

  const rowOrderId = (p: any) => p.order_id ?? p.order?.id;

  const rowOrderLabel = (p: any) =>
    p.order?.order_number ?? p.order_number ?? (rowOrderId(p) ? `#${rowOrderId(p)}` : "—");

  const customerName = (p: any) =>
    p.user_name ?? p.user?.name ?? p.customer_name ?? "—";

  const customerEmail = (p: any) =>
    p.user_email ?? p.user?.email ?? p.customer_email ?? "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Payments history</h1>
      </div>

      <Card className="p-4">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search by transaction ID, order, email, or name..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border min-h-[200px]">
          {loading ? (
            <PaymentsSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No.</TableHead>
                  <TableHead>Order Id</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p, idx) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{(page - 1) * perPage + idx + 1}</TableCell>
                      <TableCell>
                        {rowOrderId(p) ? (
                          <Link
                            to={`/orders/${rowOrderId(p)}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {rowOrderLabel(p)}
                          </Link>
                        ) : (
                          rowOrderLabel(p)
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customerName(p)}</div>
                          {customerEmail(p) ? (
                            <div className="text-sm text-gray-500">{customerEmail(p)}</div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(rowAmount(p))}</TableCell>
                      <TableCell>{paymentStatusBadge(rowStatus(p))}</TableCell>
                      <TableCell className="capitalize">
                        {(p.payment_method ?? p.method ?? "—").toString().replace(/_/g, " ")}
                      </TableCell>
                      <TableCell>{formatDate(p.created_at ?? p.paid_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/payments-history/${p.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View details
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            Showing{" "}
            <span className="font-semibold">
              {payments.length === 0 ? 0 : (page - 1) * 10 + 1} to{" "}
              {page * 10 > totalPages * 10 ? totalPages * 10 : page * 10}
            </span>{" "}
            of <span className="font-semibold">{totalPages * 10}</span> entries
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentsHistoryList;
