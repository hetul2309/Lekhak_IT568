import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { RouteAddCategory, RouteEditCategory } from '@/helpers/RouteName';
import { useFetch } from '@/hooks/useFetch';
import { getEnv } from '@/helpers/getEnv';
import Loading from '@/components/Loading';
import { FiEdit } from 'react-icons/fi';
import { FaRegTrashAlt } from 'react-icons/fa';
import { deleteData } from '@/helpers/handleDelete';
import { showToast } from '@/helpers/showToast';
import { Sparkles, FolderKanban } from 'lucide-react';

const FALLBACK_DESCRIPTION = 'Keep this space updated so readers know what belongs here.';

const normalizeCategories = (raw) => (Array.isArray(raw) ? raw : []);

const getCategoryVisual = (name = '') => {
  if (!name) return { emoji: '📁', label: 'Untitled' };
  const emojiMatch = name.match(/^(\p{Extended_Pictographic})\s*(.*)$/u);
  if (emojiMatch) {
    return {
      emoji: emojiMatch[1],
      label: emojiMatch[2] ? emojiMatch[2].trim() : 'Untitled',
    };
  }
  return { emoji: '📁', label: name };
};

const getCategoryDescription = (category) =>
  category?.description?.trim() || FALLBACK_DESCRIPTION;

const getPostCount = (category) => {
  const count = category?.blogCount ?? category?.postCount ?? category?.postsCount ?? category?.count ?? 0;
  return Number.isFinite(count) ? count : 0;
};

const ACCENT_PILLS = [
  'from-[#FF6A00] via-[#7C6BEE] to-[#8B5CF6]',
  'from-[#F97316] via-[#FB923C] to-[#FDBA74]',
  'from-[#10B981] via-[#34D399] to-[#6EE7B7]',
  'from-[#3B82F6] via-[#60A5FA] to-[#93C5FD]',
];

const CategoryDetails = () => {
  const [refreshData, setRefreshData] = useState(false);

  const categoriesEndpoint = `${getEnv('VITE_API_BASE_URL')}/category/all-category`;

  const { data: categoryData, loading, error } = useFetch(
    categoriesEndpoint,
    {
      method: 'get',
      credentials: 'include',
    },
    [refreshData, categoriesEndpoint],
  );

  const categories = useMemo(
    () => normalizeCategories(categoryData?.category),
    [categoryData],
  );

  const totalPosts = useMemo(
    () => categories.reduce((sum, cat) => sum + getPostCount(cat), 0),
    [categories],
  );

  const handleDelete = async (id) => {
    const deleted = await deleteData(`${getEnv('VITE_API_BASE_URL')}/category/delete/${id}`);
    if (deleted) {
      setRefreshData((prev) => !prev);
      showToast('success', 'Data deleted.');
    } else {
      showToast('error', 'Data not deleted.');
    }
  };

  if (loading) return <Loading />;
  if (error) {
    return (
      <div className="px-4 py-6 text-center text-sm text-red-500">
        Error loading categories: {error.message}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-8 lg:px-12">
      <BackButton className="mb-6" />
      <section className="relative mb-10 overflow-hidden rounded-[40px] bg-[#FF6A00] px-6 py-12 text-white shadow-[0_35px_80px_-45px_rgba(15,23,42,0.9)] sm:px-10">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-16 h-56 w-56 translate-y-1/2 rounded-full bg-orange-300/40 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.4em] text-white/70">
              <Sparkles className="h-4 w-4" />
              Content taxonomy
            </p>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">Manage Categories</h1>
            <p className="text-base text-white/80">
              Shape the reading journey by curating categories that feel personal, organized, and on-brand.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur">
                <FolderKanban className="h-4 w-4" />
                {categories.length} active categories
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto">
            <Button
              asChild
              className="rounded-full bg-white px-8 py-4 font-semibold text-[#FF6A00] shadow-lg shadow-purple-400/40 hover:bg-white/90"
            >
              <Link to={RouteAddCategory}>Create category</Link>
            </Button>
            <p className="text-xs text-white/60 md:text-right">
              Need inspiration? Try grouping by intent, not topic.
            </p>
          </div>
        </div>
      </section>

      <div className="mb-10" />

      {categories.length > 0 ? (
        <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_15px_40px_-20px_rgba(0,0,0,0.1)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 text-[11px] uppercase font-bold tracking-[0.2em] text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Linked Posts</th>
                  <th className="px-6 py-4 text-center font-bold">Edit</th>
                  <th className="px-6 py-4 text-center font-bold">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category, index) => {
                  const { emoji, label } = getCategoryVisual(category?.name || '');
                  const postsCount = getPostCount(category);

                  return (
                    <tr key={category._id} className="hover:bg-slate-50/30 transition duration-150 ease-in-out">
                      {/* 1. CATEGORY */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{emoji}</span>
                          <div>
                            <span className="font-semibold text-slate-800 text-sm">{label}</span>
                            {category?.slug && (
                              <span className="ml-2 rounded-full bg-slate-50 border border-slate-200/50 px-2 py-0.5 text-[10px] text-slate-400 font-medium">
                                {category.slug}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. NUMBER OF LINKED POSTS */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-700 text-sm bg-orange-50 text-orange-600 px-3 py-1 rounded-full">{postsCount} posts</span>
                      </td>

                      {/* 3. EDIT */}
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="rounded-full border border-slate-200 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 h-8 text-xs cursor-pointer"
                        >
                          <Link to={RouteEditCategory(category._id)} className="flex items-center gap-1.5 justify-center">
                            <FiEdit className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </Button>
                      </td>

                      {/* 4. DELETE */}
                      <td className="px-6 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category._id)}
                          className="rounded-full border border-red-100 text-red-500 hover:border-red-200 hover:bg-red-50 h-8 text-xs cursor-pointer"
                        >
                          <FaRegTrashAlt className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-4xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-slate-500">
          <p className="text-lg font-semibold">No categories yet.</p>
          <p className="mt-2 text-sm">Spark inspiration by creating your first collection.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryDetails;
