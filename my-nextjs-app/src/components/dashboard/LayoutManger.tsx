
'use client'
import { useState, useEffect, useContext, createContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Sun, Moon } from 'lucide-react'

// Theme Context
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => {} })

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' ? (localStorage.getItem('theme') as 'light' | 'dark') || 'light' : 'light'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

// Simulated Auth Hook
const useAuth = () => {
  const [token] = useState<string>('your-jwt-token') // Replace with actual auth logic
  const [isAdmin] = useState<boolean>(true) // Replace with actual admin check
  return { token, isAdmin }
}

interface FaqItem {
  question: string
  answer: string
}

interface Category {
  title: string
}

interface BannerImage {
  public_id: string
  url: string
}

interface Layout {
  _id: string
  type: string
  faq?: FaqItem[]
  categories?: Category[]
  banner?: {
    image: BannerImage
    title: string
    subTitle: string
  }
}

export function LayoutManager() {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [layoutType, setLayoutType] = useState<'Banner' | 'FAQ' | 'Categories'>('Banner')
  const [bannerForm, setBannerForm] = useState({ image: null as File | null, preview: '', title: '', subTitle: '' })
  const [faqForm, setFaqForm] = useState<FaqItem[]>([{ question: '', answer: '' }])
  const [categoriesForm, setCategoriesForm] = useState<Category[]>([{ title: '' }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { token, isAdmin } = useAuth()
  const { theme, toggleTheme } = useContext(ThemeContext)

  const API_URL = 'http://localhost:8080/api/v1'

  const fetchLayout = async (type: string) => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_URL}/get-layout/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success && res.data.layout) {
        setLayouts((prev) => {
          const updated = prev.filter((l) => l.type !== type)
          return [...updated, res.data.layout]
        })
      }
    } catch (err) {
      setError(`Failed to fetch ${type} layout`)
      toast.error(`Failed to fetch ${type} layout`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && isAdmin) {
      ;['Banner', 'FAQ', 'Categories'].forEach(fetchLayout)
    }
  }, [token, isAdmin])

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required')
      return
    }
    try {
      setLoading(true)
      if (layoutType === 'Banner') {
        if (!bannerForm.image && !bannerForm.preview) {
          throw new Error('Image is required for Banner')
        }
        const formData = new FormData()
        if (bannerForm.image) {
          formData.append('image', bannerForm.image)
        } else {
          formData.append('image', bannerForm.preview)
        }
        formData.append('title', bannerForm.title)
        formData.append('subTitle', bannerForm.subTitle)
        formData.append('type', 'Banner')
        await axios.post(`${API_URL}/create-layout`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
      } else if (layoutType === 'FAQ') {
        if (faqForm.some((faq) => !faq.question || !faq.answer)) {
          throw new Error('All FAQ fields are required')
        }
        await axios.post(
          `${API_URL}/create-layout`,
          { type: 'FAQ', faq: faqForm },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else if (layoutType === 'Categories') {
        if (categoriesForm.some((cat) => !cat.title)) {
          throw new Error('All Category fields are required')
        }
        await axios.post(
          `${API_URL}/create-layout`,
          { type: 'Categories', categories: categoriesForm },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      toast.success(`${layoutType} layout created successfully`)
      fetchLayout(layoutType)
      resetForms()
    } catch (err: any) {
      setError(`Failed to create ${layoutType} layout: ${err.message}`)
      toast.error(`Failed to create ${layoutType} layout`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditLayout = async (layoutId: string) => {
    if (!isAdmin) {
      toast.error('Unauthorized: Admin access required')
      return
    }
    try {
      setLoading(true)
      if (layoutType === 'Banner') {
        const formData = new FormData()
        if (bannerForm.image) {
          formData.append('image', bannerForm.image)
        } else {
          formData.append('image', bannerForm.preview || layouts.find((l) => l._id === layoutId)?.banner?.image.url || '')
        }
        formData.append('title', bannerForm.title)
        formData.append('subTitle', bannerForm.subTitle)
        formData.append('type', 'Banner')
        await axios.put(`${API_URL}/edit-layout`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
      } else if (layoutType === 'FAQ') {
        if (faqForm.some((faq) => !faq.question || !faq.answer)) {
          throw new Error('All FAQ fields are required')
        }
        await axios.put(
          `${API_URL}/edit-layout`,
          { type: 'FAQ', faq: faqForm },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      } else if (layoutType === 'Categories') {
        if (categoriesForm.some((cat) => !cat.title)) {
          throw new Error('All Category fields are required')
        }
        await axios.put(
          `${API_URL}/edit-layout`,
          { type: 'Categories', categories: categoriesForm },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      toast.success(`${layoutType} layout updated successfully`)
      fetchLayout(layoutType)
      resetForms()
    } catch (err: any) {
      setError(`Failed to update ${layoutType} layout: ${err.message}`)
      toast.error(`Failed to update ${layoutType} layout`)
    } finally {
      setLoading(false)
    }
  }

  const resetForms = () => {
    setBannerForm({ image: null, preview: '', title: '', subTitle: '' })
    setFaqForm([{ question: '', answer: '' }])
    setCategoriesForm([{ title: '' }])
  }

  const addFaqItem = () => setFaqForm([...faqForm, { question: '', answer: '' }])
  const removeFaqItem = (index: number) => setFaqForm(faqForm.filter((_, i) => i !== index))
  const addCategory = () => setCategoriesForm([...categoriesForm, { title: '' }])
  const removeCategory = (index: number) => setCategoriesForm(categoriesForm.filter((_, i) => i !== index))

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerForm({ ...bannerForm, image: file, preview: URL.createObjectURL(file) })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-6 fixed h-full">
          <h1 className="text-2xl font-bold mb-6">Layout Manager</h1>
          <nav className="space-y-2">
            {['Banner', 'FAQ', 'Categories'].map((type) => (
              <button
                key={type}
                onClick={() => setLayoutType(type as 'Banner' | 'FAQ' | 'Categories')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 ${
                  layoutType === type
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-blue-100 dark:hover:bg-blue-700'
                }`}
              >
                {type}
              </button>
            ))}
          </nav>
          <button
            onClick={toggleTheme}
            className="mt-4 flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </button>
        </aside>
        <main className="ml-64 p-6 flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 rounded-lg">
              Loading...
            </div>
          )}
          {isAdmin ? (
            <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 transition-all duration-300">
              <h3 className="text-xl font-semibold mb-4">
                {layouts.find((l) => l.type === layoutType) ? 'Edit' : 'Create'} {layoutType} Layout
              </h3>
              <form onSubmit={handleCreateLayout} className="space-y-4">
                {layoutType === 'Banner' && (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="p-2 border rounded-lg w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      {bannerForm.preview && (
                        <img
                          src={bannerForm.preview}
                          alt="Preview"
                          className="mt-2 max-w-xs h-auto rounded-lg"
                        />
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Title"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      className="p-2 border rounded-lg w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={bannerForm.subTitle}
                      onChange={(e) => setBannerForm({ ...bannerForm, subTitle: e.target.value })}
                      className="p-2 border rounded-lg w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                {layoutType === 'FAQ' && (
                  <div className="space-y-4">
                    {faqForm.map((faq, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <input
                          type="text"
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) => {
                            const newFaq = [...faqForm]
                            newFaq[index].question = e.target.value
                            setFaqForm(newFaq)
                          }}
                          className="p-2 border rounded-lg flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-

600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Answer"
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaq = [...faqForm]
                            newFaq[index].answer = e.target.value
                            setFaqForm(newFaq)
                          }}
                          className="p-2 border rounded-lg flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {faqForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFaqItem(index)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFaqItem}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
                    >
                      Add FAQ Item
                    </button>
                  </div>
                )}
                {layoutType === 'Categories' && (
                  <div className="space-y-4">
                    {categoriesForm.map((category, index) => (
                      <div key={index} className="flex space-x-2 items-center">
                        <input
                          type="text"
                          placeholder="Category Title"
                          value={category.title}
                          onChange={(e) => {
                            const newCategories = [...categoriesForm]
                            newCategories[index].title = e.target.value
                            setCategoriesForm(newCategories)
                          }}
                          className="p-2 border rounded-lg flex-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        {categoriesForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCategory(index)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all duration-200"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCategory}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all duration-200"
                    >
                      Add Category
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-200"
                >
                  {layouts.find((l) => l.type === layoutType) ? 'Update' : 'Create'} Layout
                </button>
              </form>
            </div>
          ) : (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg">
              Admin access required to modify layouts
            </div>
          )}
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80 transition-all duration-300">
            <h3 className="text-xl font-semibold mb-4">Current {layoutType} Layout</h3>
            {layouts.find((l) => l.type === layoutType) ? (
              <div>
                {layoutType === 'Banner' && (
                  <div className="text-center">
                    <img
                      src={layouts.find((l) => l.type === 'Banner')?.banner?.image.url}
                      alt="Banner"
                      className="max-w-full h-auto mx-auto mb-4 rounded-lg shadow-md"
                    />
                    <h4 className="text-lg font-semibold">{layouts.find((l) => l.type === 'Banner')?.banner?.title}</h4>
                    <p>{layouts.find((l) => l.type === 'Banner')?.banner?.subTitle}</p>
                  </div>
                )}
                {layoutType === 'FAQ' && (
                  <ul className="space-y-4">
                    {layouts
                      .find((l) => l.type === 'FAQ')
                      ?.faq?.map((faq, index) => (
                        <li
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <p className="font-semibold">{faq.question}</p>
                          <p>{faq.answer}</p>
                        </li>
                      ))}
                  </ul>
                )}
                {layoutType === 'Categories' && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {layouts
                      .find((l) => l.type === 'Categories')
                      ?.categories?.map((category, index) => (
                        <li
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-center"
                        >
                          {category.title}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No {layoutType} layout found</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}