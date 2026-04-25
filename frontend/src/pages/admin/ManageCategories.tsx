import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LayoutList, Plus, Trash2, Edit2, Loader2, Save, X, Sparkles } from "lucide-react";

export default function ManageCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Add Category State
  const [newCategoryName, setNewCategoryName] = useState("");

  // Edit Category State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const isAdminAuth = localStorage.getItem('isAdminAuth') === 'true';

  useEffect(() => {
    if (!isAdminAuth) {
      toast.error("Please sign in to continue.");
      navigate('/admin/login');
    }
  }, [isAdminAuth, navigate]);

  // Fetch categories with a mock data fallback
  useEffect(() => {
    if (!isAdminAuth) return;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/category/get-all-category`, {
          method: "GET",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Unable to fetch categories.");
        }
        
        const data = await response.json();
        setCategories(Array.isArray(data?.category) ? data.category : []);
      } catch (err: any) {
        // Mock data fallback
        setCategories([
          { _id: 'c1', name: 'Technology', slug: 'technology' },
          { _id: 'c2', name: 'Lifestyle & Culture', slug: 'lifestyle-culture' },
          { _id: 'c3', name: 'Health & Wellness', slug: 'health-wellness' },
          { _id: 'c4', name: 'Finance', slug: 'finance' },
        ]);
        toast.error("Unable to reach backend. Showing sample categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [isAdminAuth]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      setActionInProgress('add');
      const response = await fetch(`/api/category/add-category`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      
      if (!response.ok) throw new Error("Failed to add category.");
      
      const data = await response.json();
      setCategories([...categories, data.category]);
      setNewCategoryName("");
      toast.success("Category added successfully.");
    } catch (error) {
      // Mock addition for frontend development
      const mockNew = {
        _id: `c${Date.now()}`,
        name: newCategoryName,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      };
      setCategories([...categories, mockNew]);
      setNewCategoryName("");
      toast.success("Mock category added.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;
    
    try {
      setActionInProgress(`edit-${id}`);
      const response = await fetch(`/api/category/edit-category/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCategoryName }),
      });
      
      if (!response.ok) throw new Error("Failed to update category.");
      
      const data = await response.json();
      setCategories(categories.map(c => c._id === id ? data.category : c));
      setEditingId(null);
      toast.success("Category updated successfully.");
    } catch (error) {
      // Mock update
      setCategories(categories.map(c => 
        c._id === id ? { ...c, name: editCategoryName, slug: editCategoryName.toLowerCase().replace(/\s+/g, '-') } : c
      ));
      setEditingId(null);
      toast.success("Mock category updated.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      setActionInProgress(`delete-${id}`);
      const response = await fetch(`/api/category/delete-category/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) throw new Error("Failed to delete category.");
      
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Category deleted.");
    } catch (error) {
      // Mock deletion
      setCategories(categories.filter(c => c._id !== id));
      toast.success("Mock category deleted.");
    } finally {
      setActionInProgress(null);
    }
  };

  const startEditing = (category: any) => {
    setEditingId(category._id);
    setEditCategoryName(category.name);
  };

  if (!isAdminAuth) return null;

  return (
    <div className="flex-1 flex flex-col min-w-0 w-full p-4 md:p-8 bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[40px] bg-gradient-primary text-primary-foreground px-6 sm:px-10 py-10 shadow-glow">
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 rounded-full w-96 h-96 bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 translate-y-1/2 rounded-full left-16 w-60 h-60 bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between z-10">
            <div className="max-w-2xl space-y-4">
              <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/80 font-medium">
                <Sparkles className="w-4 h-4" />
                Content taxonomy
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl text-white">
                Manage Categories
              </h1>
              <p className="text-[13px] sm:text-base text-white/90">
                Organize and structure the platform's content. Create, update, or remove categories to keep the directory clean and navigable.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-white/90">
                <span className="inline-flex items-center gap-2 px-4 py-2 border rounded-full border-white/30 bg-white/10 backdrop-blur font-medium">
                  <LayoutList className="w-4 h-4" />
                  {categories.length} total categories
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/25 bg-white/10 px-6 py-5 shadow-lg backdrop-blur-sm min-w-[180px]">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/80 font-medium">
                Total Tags
              </p>
              <p className="text-4xl font-bold text-white mt-1">{categories.length}</p>
              <p className="text-xs text-white/80 mt-1">active on platform</p>
            </div>
          </div>
        </section>

        <Card className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col gap-4 pb-4 border-b border-[var(--border)] bg-background/50">
            <CardTitle className="text-xl font-semibold text-[var(--foreground)]">
              Directory
            </CardTitle>
            <CardDescription className="text-[var(--muted-foreground)] mt-1">
              View, edit, or remove content categories. Add new ones at the bottom of the list.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="hover:bg-transparent border-[var(--border)]">
                    <TableHead className="w-16 px-6 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">#</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)] w-[40%]">Category Name</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Slug</TableHead>
                    <TableHead className="px-6 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-[var(--muted-foreground)]">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category, index) => (
                      <TableRow key={category._id} className="hover:bg-accent/50 border-[var(--border)] transition-colors">
                        <TableCell className="px-6 text-sm text-[var(--muted-foreground)] font-medium">{index + 1}</TableCell>
                        <TableCell className="font-semibold text-[var(--foreground)]">
                          {editingId === category._id ? (
                            <Input 
                              value={editCategoryName} 
                              onChange={(e) => setEditCategoryName(e.target.value)}
                              className="h-9 w-full max-w-xs border-[var(--border)] bg-background"
                              autoFocus
                            />
                          ) : (
                            category.name
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[var(--muted-foreground)]">{category.slug}</TableCell>
                        <TableCell className="px-6 text-right">
                          {editingId === category._id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 px-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                                <X className="w-4 h-4" />
                              </Button>
                              <Button size="sm" onClick={() => handleEditCategory(category._id)} disabled={actionInProgress === `edit-${category._id}`} className="h-8 px-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none">
                                {actionInProgress === `edit-${category._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />} Save
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => startEditing(category)} className="h-8 px-2 text-[var(--muted-foreground)] hover:text-primary">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category._id)} disabled={actionInProgress === `delete-${category._id}`} className="h-8 px-2 text-[var(--muted-foreground)] hover:text-destructive hover:bg-destructive/10">
                                {actionInProgress === `delete-${category._id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {/* Add New Category Row (Always at the bottom) */}
                  <TableRow className="bg-primary/5 hover:bg-primary/5 border-t-2 border-[var(--border)]">
                    <TableCell className="px-6 text-sm text-primary font-bold">+</TableCell>
                    <TableCell>
                      <Input 
                        placeholder="Add new category name..." 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        className="h-10 w-full max-w-xs border-[var(--border)] bg-background/80 focus:bg-background transition-colors"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-[var(--muted-foreground)]/60 italic">
                      Auto-generated slug
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <Button 
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim() || actionInProgress === 'add'}
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-full px-6"
                      >
                        {actionInProgress === 'add' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}