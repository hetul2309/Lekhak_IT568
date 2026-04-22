import { Link, useParams } from "react-router-dom";
import BlogEditorPage from "@/components/blog/BlogEditorPage";
import { Button } from "@/components/ui/button";
import { getPostById } from "@/data/mockPosts";

const EditBlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const post = getPostById(id ?? "");

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
      successDescription="Your blog changes have been saved (mock)."
      submitNavigateTo="/my-blogs"
      initialValues={{
        title: post.title,
        content: post.content,
        description: post.preview,
        categories: post.categories,
        image: post.image,
      }}
    />
  );
};

export default EditBlogPost;