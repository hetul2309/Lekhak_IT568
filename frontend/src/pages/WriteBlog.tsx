import BlogEditorPage from "@/components/blog/BlogEditorPage";

const WriteBlog = () => (
  <BlogEditorPage
    pageTitle="Write a new blog"
    submitLabel="Publish Blog"
    successTitle="Blog published!"
    successDescription="Your blog is now live (mock)."
    submitNavigateTo="/"
  />
);

export default WriteBlog;
