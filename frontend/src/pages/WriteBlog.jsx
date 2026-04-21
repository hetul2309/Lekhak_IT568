import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Upload, X, ImagePlus, Save, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { cn } from "../lib/utils";
import { toast } from "../hooks/use-toast";
const TITLE_MAX = 100;
const DESC_MAX = 300;
const MAX_CATEGORIES = 4;
const MAX_IMAGE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALL_CATEGORIES = [
    "Travel",
    "Environment & Sustainability",
    "Food",
    "Education",
    "Sports",
    "Movies",
    "Technology",
    "Health & Wellness",
    "Business",
    "Lifestyle",
    "Art & Design",
    "Science",
    "Music",
    "Finance",
    "Photography",
    "Politics",
];
const Block = ({ index, title, hint, children, }) => (<Card className="p-5 md:p-6 shadow-card border-border/60 bg-card">
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 min-w-6 px-2 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
            {index}
          </span>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1 ml-8">{hint}</p>}
      </div>
    </div>
    {children}
  </Card>);
const WriteBlog = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingCats, setIsGeneratingCats] = useState(false);
    const toggleCategory = (cat) => {
        setCategories((prev) => {
            if (prev.includes(cat))
                return prev.filter((c) => c !== cat);
            if (prev.length >= MAX_CATEGORIES) {
                toast({
                    title: "Category limit reached",
                    description: `You can select up to ${MAX_CATEGORIES} categories.`,
                    variant: "info",
                });
                return prev;
            }
            return [...prev, cat];
        });
    };
    const handleFile = (file) => {
        if (!file)
            return;
        if (!ACCEPTED_TYPES.includes(file.type)) {
            toast({
                title: "Unsupported format",
                description: "Please upload a JPG, JPEG or PNG image.",
                variant: "destructive",
            });
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            toast({
                title: "File too large",
                description: `Image must be ${MAX_IMAGE_MB}MB or smaller.`,
                variant: "destructive",
            });
            return;
        }
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result);
        reader.readAsDataURL(file);
    };
    const onFileChange = (e) => handleFile(e.target.files?.[0]);
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    };
    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };
    const handleAIGenerate = () => {
        setIsGeneratingDesc(true);
        // Backend will handle the actual generation. Mocked here.
        setTimeout(() => {
            const mock = title.trim()
                ? `An engaging take on "${title.trim()}" — exploring fresh perspectives, practical insights, and the small ideas that make a big difference.`
                : "A short, compelling summary of your blog will appear here once generated.";
            setDescription(mock.slice(0, DESC_MAX));
            setIsGeneratingDesc(false);
            toast({
                title: "Description generated",
                description: "Feel free to edit it before publishing.",
                variant: "success",
            });
        }, 900);
    };
    const handleAIGenerateCategories = () => {
        setIsGeneratingCats(true);
        // Backend will handle the actual suggestion. Mocked here.
        setTimeout(() => {
            const pool = ALL_CATEGORIES.filter((c) => !categories.includes(c));
            const pick = pool.sort(() => Math.random() - 0.5).slice(0, MAX_CATEGORIES - categories.length);
            setCategories((prev) => [...prev, ...pick].slice(0, MAX_CATEGORIES));
            setIsGeneratingCats(false);
            toast({
                title: "Categories suggested",
                description: "AI picked relevant categories for your blog.",
                variant: "success",
            });
        }, 800);
    };
    const validate = () => {
        if (!title.trim())
            return "Blog title is required.";
        if (!content.trim())
            return "Blog content is required.";
        if (!description.trim())
            return "Blog description is required.";
        if (categories.length === 0)
            return "Select at least one category.";
        if (!imageFile)
            return "Please upload a cover image.";
        return null;
    };
    const handlePublish = () => {
        const err = validate();
        if (err) {
            toast({ title: "Cannot publish", description: err, variant: "destructive" });
            return;
        }
        toast({
            title: "Blog published!",
            description: "Your blog is now live (mock).",
            variant: "success",
        });
        navigate("/");
    };
    const handleSaveDraft = () => {
        toast({
            title: "Draft saved",
            description: "Your draft has been saved locally (mock).",
            variant: "success",
        });
    };
    return (<div className="min-h-screen bg-gradient-soft">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 md:px-8 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4"/>
          <span className="hidden sm:inline">Back</span>
        </Button>
        <h1 className="text-base md:text-lg font-semibold text-foreground">Write a new blog</h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-5 md:space-y-6">
        {/* Block 1: Title */}
        <Block index={1} title="Blog Title" hint={`Maximum ${TITLE_MAX} characters`}>
          <Input value={title} onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))} placeholder="Give your blog a captivating title…" className="text-base md:text-lg h-12"/>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {title.length}/{TITLE_MAX}
          </div>
        </Block>

        {/* Block 2: Content */}
        <Block index={2} title="Blog Content" hint="Rich text editor (CKEditor will be wired up via backend)">
          <div className="rounded-md border border-input bg-background">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/60 text-xs text-muted-foreground">
              <span className="px-2 py-1 rounded bg-muted font-medium">B</span>
              <span className="px-2 py-1 rounded bg-muted italic">I</span>
              <span className="px-2 py-1 rounded bg-muted underline">U</span>
              <span className="ml-auto">Editor placeholder</span>
            </div>
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Start writing your story…" className="min-h-[280px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none rounded-b-md text-base"/>
          </div>
        </Block>

        {/* Block 3: Description */}
        <Block index={3} title="Blog Description" hint={`A short 1–2 line summary, max ${DESC_MAX} characters`}>
          <div className="flex justify-end mb-2">
            <Button type="button" variant="outline" size="sm" onClick={handleAIGenerate} disabled={isGeneratingDesc} className="gap-2">
              <Sparkles className="h-4 w-4 text-primary"/>
              {isGeneratingDesc ? "Generating…" : "AI Generate"}
            </Button>
          </div>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, DESC_MAX))} placeholder="Write a short summary that hooks the reader…" className="min-h-[100px]"/>
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {description.length}/{DESC_MAX}
          </div>
        </Block>

        {/* Block 4: Categories */}
        <Block index={4} title="Categories" hint={`Select up to ${MAX_CATEGORIES} (${categories.length}/${MAX_CATEGORIES} selected)`}>
          <div className="flex justify-end mb-3">
            <Button type="button" variant="outline" size="sm" onClick={handleAIGenerateCategories} disabled={isGeneratingCats || categories.length >= MAX_CATEGORIES} className="gap-2">
              <Sparkles className="h-4 w-4 text-primary"/>
              {isGeneratingCats ? "Generating…" : "AI Generate"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => {
            const selected = categories.includes(cat);
            const disabled = !selected && categories.length >= MAX_CATEGORIES;
            return (<button key={cat} type="button" onClick={() => toggleCategory(cat)} disabled={disabled} className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-smooth", selected
                    ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow"
                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground", disabled && "opacity-50 cursor-not-allowed hover:bg-background hover:text-foreground")}>
                  {cat}
                </button>);
        })}
          </div>
        </Block>

        {/* Block 5: Upload Image */}
        <Block index={5} title="Upload Image" hint="JPG, JPEG or PNG · up to 5MB">
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png" className="hidden" onChange={onFileChange}/>
          {imagePreview ? (<div className="relative rounded-lg overflow-hidden border border-border group">
              <img src={imagePreview} alt="Cover preview" className="w-full max-h-96 object-cover"/>
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <ImagePlus className="h-4 w-4"/> Replace
                </Button>
                <Button size="sm" variant="destructive" onClick={removeImage} className="gap-2">
                  <X className="h-4 w-4"/> Remove
                </Button>
              </div>
              <div className="px-4 py-2 text-xs text-muted-foreground bg-card border-t border-border">
                {imageFile?.name} · {((imageFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>) : (<div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} className={cn("rounded-lg border-2 border-dashed p-8 md:p-12 text-center cursor-pointer transition-smooth", isDragging
                ? "border-primary bg-accent/40"
                : "border-border hover:border-primary/60 hover:bg-accent/20")}>
              <div className="mx-auto h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center mb-3">
                <Upload className="h-6 w-6 text-primary-foreground"/>
              </div>
              <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, JPEG, PNG · Max {MAX_IMAGE_MB}MB</p>
            </div>)}
        </Block>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 pb-10">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4"/>
            Save Draft
          </Button>
          <Button onClick={handlePublish} className="gap-2 bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
            <Send className="h-4 w-4"/>
            Publish Blog
          </Button>
        </div>
      </main>
    </div>);
};
export default WriteBlog;
