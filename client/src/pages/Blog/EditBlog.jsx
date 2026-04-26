import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import JoditEditor from "jodit-react"
import { getEnv } from '@/helpers/getEnv'
import { useFetch } from '@/hooks/useFetch'
import Loading from '@/components/Loading'
import { showToast } from '@/helpers/showToast'
import { decode } from 'entities'
import { RouteBlog } from '@/helpers/RouteName'
import { Loader2, Save, Send, Image as ImageIcon, X, Sparkles, ImagePlus, Upload, ArrowLeft } from 'lucide-react'
import ModerationErrorDisplay from '@/components/ModerationErrorDisplay'
import Block from '@/components/ui/Block'

const MAX_CATEGORIES = 5

const formSchema = z.object({
  categories: z.array(z.string().min(1))
    .max(MAX_CATEGORIES, { message: `Select max ${MAX_CATEGORIES} categories.` })
    .optional()
    .default([]),
  title: z.string().optional().default(''),
  blogContent: z.string().optional().default(''),
  description: z.string().optional().default(''),
})

function EditBlog() {
  const { blogid } = useParams()
  const navigate = useNavigate()
  const [filePreview, setFilePreview] = useState(null)
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [editorData, setEditorData] = useState('')
  const [categorizing, setCategorizing] = useState(false)
  const [moderationErrors, setModerationErrors] = useState({ badLines: [], suggestions: [], message: '', summary: '' })
  const [generatingDescription, setGeneratingDescription] = useState(false)
  const [blogStatus, setBlogStatus] = useState('published')
  const [contentLength, setContentLength] = useState(0)
  const MAX_CONTENT_LENGTH = 35000
  const [lastCategorizedContent, setLastCategorizedContent] = useState('')
  const [lastDescriptionContent, setLastDescriptionContent] = useState('')
  const [cachedCategories, setCachedCategories] = useState(null)
  const [cachedDescription, setCachedDescription] = useState(null)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: [],
      title: '',
      blogContent: '',
      description: '',
    },
  })

  const { data: categoryData } = useFetch(`${getEnv('VITE_API_BASE_URL')}/category/all-category`, {
    method: 'get',
    credentials: 'include',
  })

  const availableCategories = useMemo(() => {
    if (!Array.isArray(categoryData?.category)) {
      return []
    }
    return categoryData.category.filter(Boolean)
  }, [categoryData])

  const { data: blogData, loading: blogLoading, error: blogError } = useFetch(
    blogid ? `${getEnv('VITE_API_BASE_URL')}/blog/edit/${blogid}` : null,
    {
      method: 'get',
      credentials: 'include',
    },
    [blogid]
  )

  useEffect(() => {
    if (!blogData?.blog) {
      return
    }

    const { blog } = blogData
    const decodedContent = decode(blog.blogContent || '')

    setBlogStatus(blog.status || 'published')

    const initialCategoryIds = Array.isArray(blog.categories)
      ? blog.categories.map((cat) => String(cat?._id || cat)).filter(Boolean)
      : []
    const uniqueCategoryIds = Array.from(new Set(initialCategoryIds)).slice(0, MAX_CATEGORIES)
    if (initialCategoryIds.length > MAX_CATEGORIES) {
      showToast('info', `Max ${MAX_CATEGORIES} categories allowed. Loaded the first ${MAX_CATEGORIES}.`)
    }

    form.reset({
      categories: uniqueCategoryIds,
      title: blog.title || '',
      blogContent: decodedContent || '',
      description: blog.description || '',
    })

    const textContent = decodedContent.replace(/<[^>]*>/g, '').trim();
    setContentLength(textContent.length);
    setEditorData(decodedContent || '')
    setFilePreview(blog.featuredImage || null)
    setFile(null)
  }, [blogData, form])

  const blogTitle = form.watch('title')

  const handleGenerateDescription = async () => {
    const values = form.getValues()
    const title = values?.title || ''
    const blogContent = values?.blogContent || ''
    const strippedContent = blogContent.replace(/<[^>]*>/g, '').trim()

    if (!title && !strippedContent) {
      showToast('error', 'Add a title or blog content before generating description.')
      return
    }

    // Check if content has changed since last description generation
    const contentSignature = `${title}::${strippedContent}`
    if (contentSignature === lastDescriptionContent && cachedDescription) {
      form.setValue('description', cachedDescription, {
        shouldDirty: true,
        shouldValidate: true,
      })
      showToast('info', 'Content unchanged - using previous description.')
      return
    }

    try {
      setGeneratingDescription(true)

      const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/blog/generate-description`, {
        method: 'post',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: blogContent,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        showToast('error', data?.message || 'Failed to generate description.')
        return
      }

      if (data?.description) {
        form.setValue('description', data.description, {
          shouldDirty: true,
          shouldValidate: true,
        })
        
        // Cache the result and content signature
        setCachedDescription(data.description)
        setLastDescriptionContent(contentSignature)
        
        showToast('success', 'Description generated successfully.')
      } else {
        showToast('error', 'No description was generated.')
      }
    } catch (error) {
      showToast('error', error.message || 'Failed to generate description.')
    } finally {
      setGeneratingDescription(false)
    }
  }

  useEffect(() => {
    if (!blogTitle) {
      return
    }
    // Auto-generate slug logic removed as we don't need slug in form
  }, [blogTitle, form])

  const handleEditorData = (data) => {
    const textContent = data.replace(/<[^>]*>/g, '').trim();
    const length = textContent.length;
    
    if (length > MAX_CONTENT_LENGTH) {
      showToast('error', `Content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
      return;
    }
    
    setContentLength(length);
    form.setValue('blogContent', data, { shouldDirty: true, shouldValidate: true })
  }

  const editor = useRef(null)
  const fileInputRef = useRef(null)

  const config = useMemo(() => ({
    readonly: false,
    placeholder: "Start typing your blog content here...",
    height: 450,
  }), [])

  const handleFileSelection = (files) => {
    const selected = files?.[0]
    if (!selected) {
      return
    }
    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (selected.size > maxSize) {
      showToast('error', 'Image size must be less than 5MB');
      return;
    }
    if (filePreview && file instanceof File) {
      URL.revokeObjectURL(filePreview)
    }
    const preview = URL.createObjectURL(selected)
    setFile(selected)
    setFilePreview(preview)
  }

  const handleCategorizeWithAI = async () => {
    const values = form.getValues()
    const title = values?.title || ''
    const blogContent = values?.blogContent || ''
    const strippedContent = blogContent.replace(/<[^>]*>/g, '').trim()

    if (!strippedContent) {
      showToast('error', 'Add some blog content before using AI categorization.')
      return
    }

    // Check if content has changed since last categorization
    const contentSignature = `${title}::${strippedContent}`
    if (contentSignature === lastCategorizedContent && cachedCategories) {
      form.setValue('categories', cachedCategories, {
        shouldDirty: true,
        shouldValidate: true,
      })
      showToast('info', 'Content unchanged - using previous categorization.')
      return
    }

    if (!availableCategories.length) {
      showToast('error', 'No categories are available to match against yet.')
      return
    }

    try {
      setCategorizing(true)

      const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/blog/categorize`, {
        method: 'post',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: blogContent,
          maxCategories: MAX_CATEGORIES,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        showToast('error', data?.message || 'Failed to categorize blog.')
        return
      }

      const aiCategories = Array.isArray(data?.categories) ? data.categories.filter(Boolean) : []
      if (!aiCategories.length) {
        showToast('error', 'AI could not map this post to existing categories.')
        return
      }

      const availableIds = new Set(availableCategories.map((category) => category._id))
      const suggestedIds = aiCategories
        .map((category) => category?._id)
        .filter((id) => Boolean(id) && availableIds.has(id))

      if (!suggestedIds.length) {
        showToast('error', 'AI returned categories that are not available in the system.')
        return
      }

      const uniqueSuggested = Array.from(new Set(suggestedIds))
      const limitedSuggested = uniqueSuggested.slice(0, MAX_CATEGORIES)
      if (uniqueSuggested.length > MAX_CATEGORIES) {
        showToast('info', `AI suggested more than ${MAX_CATEGORIES} categories. Using the first ${MAX_CATEGORIES} (max).`)
      }

      form.setValue('categories', limitedSuggested, {
        shouldDirty: true,
        shouldValidate: true,
      })

      // Cache the result and content signature
      setCachedCategories(limitedSuggested)
      setLastCategorizedContent(contentSignature)

      showToast('success', 'Categories updated using AI suggestions.')
    } catch (error) {
      showToast('error', error.message || 'Failed to categorize blog.')
    } finally {
      setCategorizing(false)
    }
  }

  const onSubmit = async (values, isDraft = false) => {
    if (!blogid) {
      showToast('error', 'Missing blog id.')
      return
    }

    try {
      setIsSubmitting(true)
      setModerationErrors({ badLines: [], suggestions: [], message: '', summary: '' })

      // Validate required fields for published blogs
      if (!isDraft) {
        if (!values.categories || values.categories.length === 0) {
          showToast('error', 'Please select at least one category.')
          return
        }
        if (!values.title || values.title.trim().length < 3) {
          showToast('error', 'Title must be at least 3 characters long.')
          return
        }
        if (!values.blogContent || values.blogContent.trim().length < 3) {
          showToast('error', 'Blog content must be at least 3 characters long.')
          return
        }
        const textContent = values.blogContent.replace(/<[^>]*>/g, '').trim();
        if (textContent.length > MAX_CONTENT_LENGTH) {
          showToast('error', `Blog content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
          return
        }
        if (!file && !filePreview) {
          showToast('error', 'Featured image is required.')
          return
        }
      }

      const updatedValues = { ...values, status: isDraft ? 'draft' : 'published' }

      const formData = new FormData()
      formData.append('data', JSON.stringify(updatedValues))
      if (file) {
        formData.append('file', file)
      }

      const response = await fetch(`${getEnv('VITE_API_BASE_URL')}/blog/update/${blogid}`, {
        method: 'put',
        credentials: 'include',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.badLines || data.suggestions || data.summary) {
          setModerationErrors({
            badLines: data.badLines || [],
            suggestions: data.suggestions || [],
            message: data.message || 'Blog content failed moderation.',
            summary: data.summary || '',
          });
        }
        showToast('error', data?.message || 'Failed to update blog.')
        return
      }

      showToast('success', data?.message || 'Blog updated successfully.')
      navigate(RouteBlog)
    } catch (error) {
      showToast('error', error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    const values = form.getValues()
    setIsSavingDraft(true)
    await onSubmit(values, true)
    setIsSavingDraft(false)
  }

  const handlePublish = async () => {
    const values = form.getValues()
    await onSubmit(values, false)
  }

  const removeImage = () => {
    if (filePreview && file instanceof File) {
      URL.revokeObjectURL(filePreview)
    }
    setFile(null)
    setFilePreview(null)
  }

  useEffect(() => () => {
    if (filePreview && file instanceof File) {
      URL.revokeObjectURL(filePreview)
    }
  }, [filePreview, file])

  if (blogLoading) {
    return <Loading />
  }

  if (blogError) {
    return <div className="text-red-500">{blogError.message}</div>
  }

  if (!blogData?.blog) {
    return <div className="text-red-500">Blog not found.</div>
  }

  const editorKey = blogData?.blog?._id ? `blog-editor-${blogData.blog._id}` : 'blog-editor'
  const isDraft = blogStatus === 'draft'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white pb-10">
      <header className="h-16 flex items-center gap-3 px-6 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="font-semibold text-lg">{isDraft ? 'Edit Draft' : 'Edit Blog Post'}</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {moderationErrors.badLines?.length > 0 && (
          <ModerationErrorDisplay
            errors={moderationErrors.badLines}
            suggestions={moderationErrors.suggestions}
            summary={moderationErrors.summary}
            onClose={() => setModerationErrors({ badLines: [], suggestions: [], message: '', summary: '' })}
            onFixLine={(lineNum) => {
              if (lineNum === 1) {
                const titleInput = document.querySelector('input[name="title"]');
                if (titleInput) {
                  titleInput.focus();
                  titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  return;
                }
              }
              showToast('info', `Please fix line ${lineNum} in the editor`);
            }}
          />
        )}

        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); handlePublish(); }} className="space-y-6">
            
            {/* 1. TITLE */}
            <Block index={1} title="Blog Title" hint="Maximum 100 characters">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Enter an engaging title for your blog post..." 
                        {...field} 
                        maxLength={100}
                        className="h-12 text-lg"
                      />
                    </FormControl>
                    <div className="text-right text-xs text-muted-foreground mt-2">
                      {field.value?.length || 0}/100
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Block>

            {/* 2. CONTENT */}
            <Block index={2} title="Blog Content" hint="Rich text editor with formatting options">
              <FormField
                control={form.control}
                name="blogContent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <JoditEditor
                          ref={editor}
                          value={field.value}
                          config={config}
                          onBlur={newContent => handleEditorData(newContent)}
                          onChange={newContent => handleEditorData(newContent)}
                        />
                      </div>
                    </FormControl>
                    <div className="text-right text-xs text-muted-foreground mt-2">
                      {contentLength.toLocaleString()}/35,000 characters
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Block>

            {/* 3. DESCRIPTION */}
            <Block 
              index={3} 
              title="Blog Description" 
              hint="A short 1–2 line summary, max 300 characters"
              action={
                <Button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={generatingDescription}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100"
                >
                  {generatingDescription ? <Loader2 className="h-4 w-4 text-pink-500 animate-spin" /> : <Sparkles className="h-4 w-4 text-pink-500" />}
                  AI Generate
                </Button>
              }
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a short summary that hooks the reader..."
                        {...field}
                        maxLength={300}
                        rows={4}
                        className="resize-none"
                      />
                    </FormControl>
                    <div className="text-right text-xs text-muted-foreground mt-2">
                      {field.value?.length || 0}/300
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Block>

            {/* 4. CATEGORIES */}
            <Block 
              index={4} 
              title="Categories" 
              hint={`Select up to ${MAX_CATEGORIES} (${form.watch('categories')?.length || 0}/${MAX_CATEGORIES} selected)`}
              action={
                <Button
                  type="button"
                  onClick={handleCategorizeWithAI}
                  disabled={categorizing}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100"
                >
                  {categorizing ? <Loader2 className="h-4 w-4 text-pink-500 animate-spin" /> : <Sparkles className="h-4 w-4 text-pink-500" />}
                  AI Generate
                </Button>
              }
            >
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-wrap gap-3">
                        {availableCategories.length ? (
                          availableCategories.map((category) => {
                            const selected = Array.isArray(field.value) ? field.value : []
                            const isChecked = selected.includes(category._id)
                            return (
                              <button
                                key={category._id}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isChecked && selected.length >= MAX_CATEGORIES) {
                                    showToast('error', `Max ${MAX_CATEGORIES} categories allowed.`)
                                    return
                                  }
                                  const next = isChecked
                                    ? selected.filter((id) => id !== category._id)
                                    : Array.from(new Set([...selected, category._id])).slice(0, MAX_CATEGORIES)
                                  field.onChange(next)
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                                  isChecked 
                                    ? 'bg-gradient-to-r from-orange-500 via-pink-500 to-rose-500 text-white border-transparent shadow-md hover:scale-105' 
                                    : 'bg-white text-foreground border-gray-200 hover:bg-gradient-to-r hover:from-orange-100 hover:to-pink-100'
                                }`}
                              >
                                {category.name}
                              </button>
                            )
                          })
                        ) : (
                          <span className="text-sm text-gray-500">No categories available</span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Block>

            {/* 5. IMAGE */}
            <Block index={5} title="Upload Image" hint="JPG, JPEG, PNG up to 5MB">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg, image/png, image/jpg"
                onChange={(e) => handleFileSelection(e.target.files)}
              />
              {filePreview ? (
                <div className="relative group">
                  <img src={filePreview} className="w-full max-h-96 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex justify-center items-center gap-3 transition rounded-lg">
                    <Button type="button" onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button type="button" variant="destructive" onClick={removeImage} className="cursor-pointer">
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
                  <p>Click to upload image</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPG, JPEG, PNG · Max 5MB
                  </p>
                </div>
              )}
            </Block>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 pt-4 pb-12">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
                className="cursor-pointer"
              >
                {isSavingDraft ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save as Draft
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isSavingDraft}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 cursor-pointer border-0"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {isDraft ? 'Publish Blog' : 'Update Blog'}
              </Button>
            </div>

          </form>
        </Form>
      </main>
    </div>
  )
}

export default EditBlog;