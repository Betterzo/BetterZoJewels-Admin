import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import {
  createBlogCategory,
  fetchBlogCategory,
  updateBlogCategory,
} from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/imageUploader";

const BlogCategoryForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!metaTitle.trim()) nextErrors.metaTitle = "Meta title is required";
    if (!metaKeywords.trim()) nextErrors.metaKeywords = "Meta keywords are required";
    if (!metaDescription.trim()) nextErrors.metaDescription = "Meta description is required";
    if (!description.trim()) nextErrors.description = "Description is required";
    if (!image.trim()) nextErrors.image = "Image is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    fetchBlogCategory(id)
      .then((res) => {
        setTitle(res.data?.title || res.data?.name || "");
        setMetaTitle(res.data?.meta_title || "");
        setMetaKeywords(res.data?.meta_keywords || "");
        setMetaDescription(res.data?.meta_description || "");
        setDescription(res.data?.description || "");
        setImage(res.data?.image || "");
      })
      .catch(() => {
        toast.error("Failed to load blog category");
        navigate("/blog-categories");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = {
        title,
        // name: title, // compatibility with possible old backend key
        meta_title: metaTitle,
        meta_keywords: metaKeywords,
        meta_description: metaDescription,
        description,
        image,
      };
      if (isEdit && id) {
        await updateBlogCategory(id, payload);
        toast.success("Blog category updated successfully");
      } else {
        await createBlogCategory(payload);
        toast.success("Blog category created successfully");
      }
      navigate("/blog-categories");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          (isEdit ? "Failed to update blog category" : "Failed to create blog category")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate("/blog-categories")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blog Categories
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Blog Category" : "Create Blog Category"}</CardTitle>
          <CardDescription>
            {isEdit ? "Update an existing blog category." : "Add a new category for blog posts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <BlogCategoryFormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearFieldError("title");
                  }}
                  placeholder="Enter blog category title"
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_title" className="text-sm font-medium">
                  Meta Title
                </label>
                <Input
                  id="meta_title"
                  name="meta_title"
                  value={metaTitle}
                  onChange={(e) => {
                    setMetaTitle(e.target.value);
                    clearFieldError("metaTitle");
                  }}
                  placeholder="Enter meta title"
                />
                {errors.metaTitle && <p className="text-xs text-red-500">{errors.metaTitle}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_keywords" className="text-sm font-medium">
                  Meta Keywords
                </label>
                <Input
                  id="meta_keywords"
                  name="meta_keywords"
                  value={metaKeywords}
                  onChange={(e) => {
                    setMetaKeywords(e.target.value);
                    clearFieldError("metaKeywords");
                  }}
                  placeholder="keyword1, keyword2"
                />
                {errors.metaKeywords && <p className="text-xs text-red-500">{errors.metaKeywords}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="meta_description" className="text-sm font-medium">
                  Meta Description
                </label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={metaDescription}
                  onChange={(e) => {
                    setMetaDescription(e.target.value);
                    clearFieldError("metaDescription");
                  }}
                  placeholder="Enter meta description"
                  rows={3}
                />
                {errors.metaDescription && (
                  <p className="text-xs text-red-500">{errors.metaDescription}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    clearFieldError("description");
                  }}
                  placeholder="Enter description"
                  rows={4}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
              </div>
              <div className="space-y-2">
                <ImageUploader
                  label="Image"
                  value={image}
                  onChange={(v) => {
                    setImage(String(v || ""));
                    clearFieldError("image");
                  }}
                  disabled={loading}
                  onUploadingChange={setImageUploading}
                />
                {errors.image && <p className="text-xs text-red-500">{errors.image}</p>}
              </div>
              <CardFooter className="flex justify-between px-0">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/blog-categories")}
                  disabled={loading || imageUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || imageUploading}>
                  {loading ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Create"}
                </Button>
              </CardFooter>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const BlogCategoryFormSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </CardContent>
  </Card>
);

export default BlogCategoryForm;
