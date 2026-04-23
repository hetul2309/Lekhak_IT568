import BlogEditorPage from "@/components/blog/BlogEditorPage";
import { createBlog } from "@/lib/blog-api";

const WriteBlog = () => (
  <BlogEditorPage
    pageTitle="Write a new blog"
    submitLabel="Publish Blog"
    successTitle="Blog published!"
    successDescription="Your blog is now live."
    submitNavigateTo="/my-blogs"
    onSubmit={(values) =>
      createBlog({
        title: values.title,
        content: values.content,
        description: values.description,
        categories: values.categories,
        thumbnail: values.thumbnail,
        status: "published",
      })
    }
    onSaveDraft={(values) =>
      createBlog({
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

export default WriteBlog;
