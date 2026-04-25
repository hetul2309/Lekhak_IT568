import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import BlogEditorPage from "@/components/blog/BlogEditorPage";
import { Button } from "@/components/ui/button";
import { fetchBlogById, updateBlog } from "@/lib/blog-api";

const EditBlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blogs", "detail", id],
    queryFn: () => fetchBlogById(id as string),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soft px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-8 shadow-card text-center">
          <h1 className="text-2xl font-bold">Loading blog...</h1>
          <p className="mt-2 text-sm text-muted-foreground">Fetching the latest blog details.</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-soft px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-8 shadow-card text-center">
          <h1 className="text-2xl font-bold">Blog not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The blog you want to edit is unavailable right now.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/my-blogs">Back to My Blogs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <BlogEditorPage
      pageTitle="Edit blog post"
      submitLabel="Update Blog"
      successTitle="Blog updated"
      successDescription="Your blog changes have been saved."
      submitNavigateTo="/my-blogs"
      initialValues={{
        title: post.title,
        content: post.htmlContent || post.content,
        description: post.preview,
        categories: post.categories,
        image: post.image,
      }}
      onSubmit={(values) =>
        updateBlog(id as string, {
          title: values.title,
          content: values.content,
          description: values.description,
          categories: values.categories,
          thumbnail: values.thumbnail,
          status: "published",
        })
      }
      onSaveDraft={(values) =>
        updateBlog(id as string, {
          title: values.title,
          content: values.content,
          description: values.description,
          categories: values.categories,
          thumbnail: values.thumbnail,
          status: "draft",
        })
      }
    />
  );
};

export default EditBlogPost;
