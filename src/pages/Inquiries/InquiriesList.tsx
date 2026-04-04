import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Eye, Plus, Search, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { fetchInquiries, deleteBlog } from "@/lib/api";
import Swal from "sweetalert2";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const InquiriesSkeleton = () => (
  <div className="p-4 space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 animate-pulse">
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-[600px] bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-24 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
        <div className="h-8 w-20 bg-gray-200 rounded ml-auto" />
      </div>
    ))}
  </div>
);

const Inquiries = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
const [viewOpen, setViewOpen] = useState(false);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      // console.log("Loading inquiries for page:", page, "with search query:", searchQuery);
      const res = await fetchInquiries({ page, search: searchQuery });
      // console.log("Fetched inquiries:", res);
      setInquiries(res.data || []);
      setTotalPages(res.meta.last_page || 1);
    } catch (e) {
      toast.error("Failed to load inquiries");
      console.error("Error fetching inquiries:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
    // eslint-disable-next-line
  }, [page, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

 

  const handleViewInquiry = (inquiry: any) => {
  setSelectedInquiry(inquiry);
  setViewOpen(true);
};
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
       
      </div>

      <Card className="p-4">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <Input
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border min-h-[200px]">
          {loading ? (
            <InquiriesSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  {/* <TableHead>Category</TableHead> */}
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No inquiries found. Try a different search term or create a new inquiry.
                    </TableCell>
                  </TableRow>
                ) : (
                  inquiries.map((inquiry: any) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.id}</TableCell>
                      <TableCell>{inquiry.name}</TableCell>
                      <TableCell>{inquiry.email}</TableCell>
                      {/* <TableCell>{inquiry.author}</TableCell> */}
                       <TableCell className="max-w-[250px]">
  <p className="truncate">
    {inquiry.message?.length > 60
      ? `${inquiry.message.slice(0, 60)}...`
      : inquiry.message}
  </p>
</TableCell>
                      <TableCell>
                        {inquiry.created_at
                          ? format(new Date(inquiry.created_at), 'MMM d, yyyy')
                          : "-"}
                      </TableCell>
                      
                      <TableCell className="text-right">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="icon">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => handleViewInquiry(inquiry)}>
        <Eye className="mr-2 h-4 w-4" />
        View
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
              {inquiries.length === 0 ? 0 : (page - 1) * 10 + 1}{" "}
              to{" "}
              <span className="font-semibold">
                {page * 10 > totalPages * 10 ? totalPages * 10 : page * 10}
              </span>{" "}
              of{" "}
              <span className="font-semibold">{totalPages * 10}</span>{" "}
              entries
            </span>
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
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Inquiry Details</DialogTitle>
    </DialogHeader>

    {selectedInquiry && (
      <div className="space-y-4 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{selectedInquiry.name}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium break-all">{selectedInquiry.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-medium">
            {selectedInquiry.created_at
              ? format(new Date(selectedInquiry.created_at), "MMM d, yyyy hh:mm a")
              : "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Message</p>
          <div className="rounded-lg border p-4 bg-muted/30 whitespace-pre-wrap leading-7">
            {selectedInquiry.message}
          </div>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
};

export default Inquiries;
