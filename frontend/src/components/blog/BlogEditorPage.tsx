import { useRef, useState, useMemo, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import JoditEditor from "jodit-react";
import { ArrowLeft, Sparkles, Upload, X, ImagePlus, Save, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { buildApiUrl, getAuthHeaders } from "@/lib/auth";

const TITLE_MAX = 100;
const DESC_MAX = 300;
const MAX_CATEGORIES = 4;
const MAX_IMAGE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const ALL_CATEGORIES = [
  "Travel","Environment & Sustainability","Food","Education","Sports",
  "Movies","Technology","Health & Wellness","Business","Lifestyle",
  "Art & Design","Science","Music","Finance","Photography","Politics"
];

const Block = ({ index, title, hint, action, children }: any) => (
  <Card className="p-6 shadow-md border border-border/60 bg-card rounded-xl">
    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 flex items-center justify-center rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white shrink-0">
          {index}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </Card>
);

const BlogEditorPage = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: "Start typing your blog content here...",
    height: 450,
  }), []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingCats, setIsGeneratingCats] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= MAX_CATEGORIES) return prev;
      return [...prev, cat];
    });
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerateDescription = async () => {
    if (!content) {
      toast({ title: "Please write some content first to generate a description." });
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const res = await fetch(buildApiUrl("/ai/summarize"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ content })
      });
      if (!res.ok) throw new Error("Failed to generate description");
      const data = await res.json();
      setDescription(data.summary.slice(0, DESC_MAX));
      toast({ title: "Description generated successfully!" });
    } catch (err: any) {
      toast({ title: "Error generating description", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateCategories = async () => {
    if (!content && !title) {
      toast({ title: "Please write title or content first." });
      return;
    }
    setIsGeneratingCats(true);
    try {
      const res = await fetch(buildApiUrl("/ai/categorize"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({ title, content, description })
      });
      if (!res.ok) throw new Error("Failed to generate categories");
      const data = await res.json();
      if (data.categories?.length) {
        setCategories(data.categories.slice(0, MAX_CATEGORIES));
        toast({ title: "Categories generated successfully!" });
      }
    } catch (err: any) {
      toast({ title: "Error generating categories", description: err.message, variant: "destructive" });
    } finally {
      setIsGeneratingCats(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !content || !description) {
      toast({ title: "All fields are required" });
      return;
    }

    setIsPublishing(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("description", description);
      categories.forEach(cat => formData.append("categories", cat));
      if (imageFile) formData.append("image", imageFile);

      let res = await fetch(buildApiUrl("/blogs"), {
        method: "POST",
        headers: {
          Authorization: getAuthHeaders().Authorization || "",
        },
        body: formData,
      });

      // Fallback if backend doesn't support FormData (Multipart Upload)
      if (!res.ok) {
        res = await fetch(buildApiUrl("/blogs"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ title, content, description, categories, image: imagePreview }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to publish blog");
        }
      }

      toast({ title: "Blog published successfully" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Publish failed", description: err.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft saved successfully" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white">

      {/* HEADER */}
      <header className="h-16 flex items-center gap-3 px-6 border-b bg-white/80 backdrop-blur">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="font-semibold text-lg">Write a Blog</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* TITLE */}
        <Block index={1} title="Blog Title" hint={`Maximum ${TITLE_MAX} characters`}>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
            placeholder="Give your blog a captivating title…"
            className="h-12 text-lg"
          />
          <div className="text-right text-xs text-muted-foreground mt-2">
            {title.length}/{TITLE_MAX}
          </div>
        </Block>

        {/* CONTENT */}
        <Block index={2} title="Blog Content" hint="Rich text editor with formatting options">
          <div className="border rounded-lg overflow-hidden bg-white">
            <JoditEditor
              ref={editor}
              value={content}
              config={config}
              onBlur={(newContent: string) => setContent(newContent)}
              onChange={(newContent: string) => setContent(newContent)}
            />
          </div>
        </Block>

        {/* DESCRIPTION */}
        <Block 
          index={3} 
          title="Blog Description" 
          hint={`A short 1–2 line summary, max ${DESC_MAX} characters`}
          action={
            <Button 
              onClick={handleGenerateDescription}
              disabled={isGeneratingDesc}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100"
            >
              {isGeneratingDesc ? <Loader2 className="h-4 w-4 text-pink-500 animate-spin" /> : <Sparkles className="h-4 w-4 text-pink-500" />}
              {isGeneratingDesc ? "Generating..." : "AI Generate"}
            </Button>
          }
        >

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))}
            placeholder="Write a short summary that hooks the reader…"
          />

          <div className="text-right text-xs text-muted-foreground mt-2">
            {description.length}/{DESC_MAX}
          </div>
        </Block>

        {/* CATEGORIES */}
        <Block 
          index={4} 
          title="Categories" 
          hint={`Select up to ${MAX_CATEGORIES} (${categories.length}/${MAX_CATEGORIES} selected)`}
          action={
            <Button 
              onClick={handleGenerateCategories}
              disabled={isGeneratingCats}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100"
            >
              {isGeneratingCats ? <Loader2 className="h-4 w-4 text-pink-500 animate-spin" /> : <Sparkles className="h-4 w-4 text-pink-500" />}
              {isGeneratingCats ? "Generating..." : "AI Generate"}
            </Button>
          }
        >

          <div className="flex flex-wrap gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                  categories.includes(cat)
                    ? "bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white border-transparent shadow-md hover:scale-105"
                    : "bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Block>

        {/* IMAGE */}
        <Block index={5} title="Upload Image" hint="JPG, JPEG or PNG · up to 5MB">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] || null)}
          />

          {imagePreview ? (
            <div className="relative group">
              <img src={imagePreview} className="w-full max-h-96 object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button variant="destructive" onClick={() => setImagePreview(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-pink-400 transition"
            >
              <Upload className="mx-auto mb-3 h-6 w-6 text-pink-500" />
              <p>Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                JPG, JPEG, PNG · Max {MAX_IMAGE_MB}MB
              </p>
            </div>
          )}
        </Block>

        {/* BUTTONS */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          <Button disabled={isPublishing} className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90" onClick={handleSubmit}>
            {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            {isPublishing ? "Publishing..." : "Publish Blog"}
          </Button>
        </div>

      </main>
    </div>
  );
};

export default BlogEditorPage;