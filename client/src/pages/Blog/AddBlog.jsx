import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { z } from 'zod'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from '@/components/ui/button'
import { showToast } from '@/helpers/showToast'
import { getEnv } from '@/helpers/getEnv' 
import { useFetch } from '@/hooks/useFetch'
import JoditEditor from "jodit-react"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RouteBlog } from '@/helpers/RouteName'
import { Loader2, Save, Send, Image as ImageIcon, X, Sparkles, ImagePlus, Upload, ArrowLeft } from 'lucide-react'
import ModerationErrorList from '@/components/ModerationErrorList'
import ModerationErrorDisplay from '@/components/ModerationErrorDisplay'
import Block from '@/components/ui/Block'


const MAX_CATEGORIES = 5


const AddBlog = () => {

        const user=useSelector((state) => state.user)
        const [filePreview, setFilePreview] = useState(null)
        const [file, setFile] = useState(null)
        const [categorizing, setCategorizing] = useState(false)
        const [moderationErrors, setModerationErrors] = useState({ badLines: [], suggestions: [], message: '', summary: '' })
        const [isSubmitting, setIsSubmitting] = useState(false)
        const [isSavingDraft, setIsSavingDraft] = useState(false)
        const [generatingDescription, setGeneratingDescription] = useState(false)
        const autoSaveTimerRef = useRef(null)
        const [lastSaved, setLastSaved] = useState(null)
        const [contentLength, setContentLength] = useState(0)
        const MAX_CONTENT_LENGTH = 35000
        const [savedDraftId, setSavedDraftId] = useState(null)
        const [lastCategorizedContent, setLastCategorizedContent] = useState('')
        const [lastDescriptionContent, setLastDescriptionContent] = useState('')
        const [cachedCategories, setCachedCategories] = useState(null)
        const [cachedDescription, setCachedDescription] = useState(null)


  const { data: categoryData, loading, error } = useFetch(`${getEnv('VITE_API_BASE_URL')}/category/all-category`, {
          method: 'get',
          credentials: 'include'
      }) 

    const formSchema = z.object({
                categories: z.array(z.string().min(1))
                    .max(MAX_CATEGORIES, { message: `Select max ${MAX_CATEGORIES} categories.` })
                    .optional()
                    .default([]),
                title: z.string().optional().default(''),
                blogContent: z.string().optional().default(''),
                description: z.string().optional().default(''),
        })
  
      const form = useForm({
          resolver: zodResolver(formSchema),
          defaultValues: {
              categories: [],
              title: '',
              blogContent: '',
              description: '',
          },
      })

      const handleEditorData = (data) => {
        const textContent = data.replace(/<[^>]*>/g, '').trim();
        const length = textContent.length;
        
        if (length > MAX_CONTENT_LENGTH) {
            showToast('error', `Content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`);
            return;
        }
        
        setContentLength(length);
        form.setValue('blogContent', data, { shouldValidate: true, shouldDirty: true });
    }

    const editor = useRef(null)
    const fileInputRef = useRef(null)

    const config = useMemo(() => ({
        readonly: false,
        placeholder: "Start typing your blog content here...",
        height: 450,
    }), [])

    const navigate = useNavigate()

    // Auto-save draft functionality
    const saveDraft = useCallback(async (values, silent = false) => {
        try {
            if (!silent) {
                setIsSavingDraft(true)
            }

            const formData = new FormData()
            const draftData = { ...values, status: 'draft' }
            formData.append('data', JSON.stringify(draftData))
            if (file) {
                formData.append('file', file)
            }

            // If we have a saved draft ID, update it instead of creating new
            const endpoint = savedDraftId 
                ? `${getEnv('VITE_API_BASE_URL')}/blog/update/${savedDraftId}`
                : `${getEnv('VITE_API_BASE_URL')}/blog/add`
            
            const method = savedDraftId ? 'put' : 'post'

            const response = await fetch(endpoint, {
                method: method,
                credentials: 'include',
                body: formData
            })
            const data = await response.json()
            
            if (!response.ok) {
                if (!silent) {
                    showToast('error', data.message)
                }
                return null
            }
            
            // Store the draft ID for future updates
            if (!savedDraftId && data.blog?._id) {
                setSavedDraftId(data.blog._id)
            }
            
            if (!silent) {
                showToast('success', 'Draft saved successfully')
            }
            setLastSaved(new Date())
            return data.blog
        } catch (error) {
            if (!silent) {
                showToast('error', error.message)
            }
            return null
        } finally {
            if (!silent) {
                setIsSavingDraft(false)
            }
        }
    }, [file, savedDraftId])

    // Auto-save timer
    const scheduleAutoSave = useCallback(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current)
        }
        
        autoSaveTimerRef.current = setTimeout(() => {
            const values = form.getValues()
            if (values.title || values.blogContent) {
                saveDraft(values, true)
            }
        }, 30000) // Auto-save every 30 seconds
    }, [form, saveDraft])

    // Clean up auto-save timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current)
            }
        }
    }, [])

    // Trigger auto-save when content changes
    useEffect(() => {
        scheduleAutoSave()
    }, [form.watch('title'), form.watch('blogContent'), scheduleAutoSave])

    async function onSubmit(values, isDraft = false) {
        setIsSubmitting(true)
        try {
            setModerationErrors({ badLines: [], suggestions: [], message: '', summary: '' })

            // Require a featured image when publishing
            if (!isDraft && !file && !filePreview) {
                showToast('error', 'Featured image is required.')
                return
            }

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
                const textContent = values.blogContent.replace(/<[^>]*>/g, '').trim()
                if (textContent.length > MAX_CONTENT_LENGTH) {
                    showToast('error', `Blog content exceeds maximum length of ${MAX_CONTENT_LENGTH.toLocaleString()} characters`)
                    return
                }
            }

            const payload = { ...values, author: user?.user?._id, status: isDraft ? 'draft' : 'published' }

            const formData = new FormData()
            if (file) {
                formData.append('file', file)
            }
            formData.append('data', JSON.stringify(payload))

            // If we have a saved draft, update instead of create
            const endpoint = savedDraftId
                ? `${getEnv('VITE_API_BASE_URL')}/blog/update/${savedDraftId}`
                : `${getEnv('VITE_API_BASE_URL')}/blog/add`
            const method = savedDraftId ? 'put' : 'post'

            const response = await fetch(endpoint, {
                method,
                credentials: 'include',
                body: formData
            })

            const data = await response.json()
            if (!response.ok) {
                if (data.badLines || data.suggestions || data.summary) {
                    setModerationErrors({
                        badLines: data.badLines || [],
                        suggestions: data.suggestions || [],
                        message: data.summary || data.message || 'Blog content failed moderation.',
                        summary: data.summary || '',
                    })
                }
                showToast('error', data.message || 'Failed to submit blog')
                return
            }

            form.reset()
            setFile(null)
            setFilePreview(null)
            setLastSaved(null)
            setSavedDraftId(null)
            setModerationErrors({ badLines: [], suggestions: [], message: '', summary: '' })
            navigate(RouteBlog)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleSaveDraft = async () => {
        const values = form.getValues()
        await saveDraft(values, false)
    }

      const handleFileSelection = (files) => {
        const file = files[0]
        if (file) {
            // Validate file size (5MB = 5 * 1024 * 1024 bytes)
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast('error', 'Image size must be less than 5MB');
                return;
            }
            const preview = URL.createObjectURL(file)
            setFile(file)
            setFilePreview(preview)
        }
    }

    const removeImage = () => {
        if (filePreview) {
            URL.revokeObjectURL(filePreview)
        }
        setFile(null)
        setFilePreview(null)
    }

    const availableCategories = useMemo(() => {
        if (!Array.isArray(categoryData?.category)) {
            return []
        }
        return categoryData.category.filter(Boolean)
    }, [categoryData])

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
                showToast('info', `AI suggested more than ${MAX_CATEGORIES} categories. Using the first ${MAX_CATEGORIES}.`)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-white pb-10">
      <header className="h-16 flex items-center gap-3 px-6 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="font-semibold text-lg">Write a Blog</h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <ModerationErrorList badLines={moderationErrors.badLines} suggestions={moderationErrors.suggestions} />
        {moderationErrors.badLines?.length > 0 && (
          <ModerationErrorDisplay
            errors={moderationErrors.badLines}
            suggestions={moderationErrors.suggestions}
            summary={moderationErrors.summary || moderationErrors.message}
            onClose={() => setModerationErrors({ badLines: [], suggestions: [], message: '', summary: '' })}
            onFixLine={(lineNum) => {
              if (lineNum === 1) {
                const titleInput = document.querySelector('input[name="title"]')
                if (titleInput) {
                  titleInput.focus()
                  titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  return
                }
              }
              showToast('info', `Please fix line ${lineNum} in the editor`)
            }}
          />
        )}

        <div className="mb-2">
          {lastSaved && (
            <p className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => onSubmit(values, false))} className="space-y-6">
            
            {/* 1. TITLE */}
            <Block index={1} title="Blog Title" hint="Maximum 100 characters">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Give your blog a captivating title…" 
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
                        placeholder="Write a short summary that hooks the reader…"
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
                        {availableCategories.length > 0 ? (
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
                                    showToast('error', `You can select up to ${MAX_CATEGORIES} categories.`);
                                    return;
                                  }
                                  const next = isChecked
                                    ? selected.filter((id) => id !== category._id)
                                    : Array.from(new Set([...selected, category._id])).slice(0, MAX_CATEGORIES);
                                  field.onChange(next);
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
                Save Draft
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isSavingDraft}
                className="bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 cursor-pointer border-0"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Publish Blog
              </Button>
            </div>

          </form>
        </Form>
      </main>
    </div>
  )
}

export default AddBlog