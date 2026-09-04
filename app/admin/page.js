'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield,
  Lock,
  LogOut,
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
  Layers,
  Briefcase,
  Award,
  User,
  Upload,
  RefreshCw,
  Eye,
  Check,
  Globe,
  Smartphone,
  Bot,
  Palette,
  Cpu,
  Code,
  LayoutGrid,
  Link2,
} from 'lucide-react'
import { usePortfolio } from '@/context/PortfolioContext'

export default function AdminPage() {
  const {
    about,
    projects,
    experience,
    certifications,
    services,
    templates,
    isLive,
    loaded,
    user,
    isAdmin,
    authLoading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    saveAbout,
    saveProj,
    removeProj,
    saveExp,
    removeExp,
    saveCert,
    removeCert,
    saveServ,
    removeServ,
    saveTempl,
    removeTempl,
    resetToDefaults,
  } = usePortfolio()

  const [activeTab, setActiveTab] = useState('about')
  const [toast, setToast] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  // Auth Form State
  const [authEmail, setAuthEmail] = useState('')
  const [authPass, setAuthPass] = useState('')
  const [authError, setAuthError] = useState('')

  // About Form State (derived from about or local user edits)
  const [localAboutOverrides, setLocalAboutOverrides] = useState(null)
  const aboutForm = {
    bio: localAboutOverrides?.bio ?? about?.bio ?? '',
    image: localAboutOverrides?.image ?? about?.image ?? '',
    signature: localAboutOverrides?.signature ?? about?.signature ?? '',
    skills: localAboutOverrides?.skills ?? about?.skills ?? [],
    newSkill: localAboutOverrides?.newSkill ?? '',
  }

  const setAboutForm = (updater) => {
    if (typeof updater === 'function') {
      setLocalAboutOverrides((prev) => updater(prev ? { ...aboutForm, ...prev } : aboutForm))
    } else {
      setLocalAboutOverrides(updater)
    }
  }

  // Project Modal / Form State
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    subtitle: '',
    type: 'Fintech SaaS',
    link: '',
    image: '',
    tech: [],
    newTech: '',
    desc: '',
    order: 1,
  })
  const [isEditingProject, setIsEditingProject] = useState(false)

  // Experience Form State
  const [expForm, setExpForm] = useState({
    id: '',
    order: 1,
    company: '',
    companyShort: '',
    role: '',
    period: '2023',
    periodEnd: 'Present',
    location: 'Jaipur, India',
    type: 'Full-time',
    desc: '',
    bullets: [],
    newBullet: '',
    tech: [],
    newTech: '',
  })
  const [isEditingExp, setIsEditingExp] = useState(false)

  // Certification Form State
  const [certForm, setCertForm] = useState({
    id: '',
    title: '',
    issuer: '',
    year: '2024',
    date: '2024-01-01',
    image: '',
    order: 1,
  })
  const [isEditingCert, setIsEditingCert] = useState(false)

  // Service Modal / Form State
  const [serviceForm, setServiceForm] = useState({
    id: '',
    title: '',
    icon: 'Globe',
    category: 'Web Engineering',
    shortDesc: '',
    features: [],
    newFeature: '',
    tech: [],
    newTech: '',
    order: 1,
  })
  const [isEditingService, setIsEditingService] = useState(false)

  // Template Modal / Form State
  const [templateForm, setTemplateForm] = useState({
    id: '',
    title: '',
    siteName: '',
    category: 'Fashion',
    link: '',
    image: '',
    desc: '',
    tech: [],
    newTech: '',
    order: 1,
  })
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Handle Image Upload Helper (compresses and converts to base64 for reliable Firestore document storage)
  const handleImageFileChange = (e, callback) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 1280
        const MAX_HEIGHT = 1280
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Try WebP first for optimal compression, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', 0.82)
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.82)
        }
        callback(dataUrl)
        showToast('Image uploaded and optimized successfully')
      }
      img.onerror = () => {
        callback(event.target.result)
      }
      img.src = event.target.result
    }
    reader.onerror = () => {
      showToast('Failed to read image file', 'error')
    }
    reader.readAsDataURL(file)
  }

  // --- Auth Handlers ---
  const handleGoogleLogin = async () => {
    setAuthError('')
    try {
      await loginWithGoogle()
      showToast('Logged in successfully')
    } catch (err) {
      setAuthError(err.message || 'Login failed')
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setAuthError('')
    try {
      await loginWithEmail(authEmail, authPass)
      showToast('Logged in successfully')
    } catch (err) {
      setAuthError(err.message || 'Email authentication failed')
    }
  }

  // --- Seed Handler ---
  const handleSeedDefaults = async () => {
    if (!confirm('Populate Firestore with initial portfolio content? This will sync all sections.')) return
    setLoadingAction(true)
    try {
      await resetToDefaults()
      showToast('Initial portfolio data synced to Firestore!')
    } catch (err) {
      showToast('Failed to seed database: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  // --- About Handler ---
  const handleSaveAbout = async (e) => {
    e.preventDefault()
    setLoadingAction(true)
    try {
      await saveAbout({
        bio: aboutForm.bio,
        image: aboutForm.image,
        signature: aboutForm.signature,
        skills: aboutForm.skills,
      })
      showToast('About section updated successfully')
    } catch (err) {
      showToast('Failed to update About: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  // --- Project Handlers ---
  const openNewProject = () => {
    setProjectForm({
      id: String(Date.now()),
      title: '',
      subtitle: '',
      type: 'Web App',
      link: '',
      image: '/assets/projects/crypto-tracker.png',
      tech: ['React', 'Next.js', 'Tailwind CSS'],
      newTech: '',
      desc: '',
      order: (projects?.length || 0) + 1,
    })
    setIsEditingProject(true)
  }

  const openEditProject = (proj) => {
    setProjectForm({
      id: proj.id,
      title: proj.title || '',
      subtitle: proj.subtitle || '',
      type: proj.type || 'Web App',
      link: proj.link || '',
      image: proj.image || '',
      tech: proj.tech || [],
      newTech: '',
      desc: proj.desc || '',
      order: proj.order || 1,
    })
    setIsEditingProject(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    if (!projectForm.title.trim()) {
      showToast('Please enter a project title', 'error')
      return
    }
    setLoadingAction(true)
    try {
      await saveProj(projectForm)
      showToast(`Project "${projectForm.title}" saved`)
      setIsEditingProject(false)
    } catch (err) {
      showToast('Failed to save project: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteProject = async (id, title) => {
    if (!confirm(`Delete project "${title}"?`)) return
    try {
      await removeProj(id)
      showToast(`Deleted "${title}"`)
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error')
    }
  }

  // --- Experience Handlers ---
  const openNewExp = () => {
    setExpForm({
      id: String(Date.now()),
      order: (experience?.length || 0) + 1,
      company: '',
      companyShort: '',
      role: '',
      period: '2024',
      periodEnd: 'Present',
      location: 'Jaipur, India',
      type: 'Full-time',
      desc: '',
      bullets: [],
      newBullet: '',
      tech: ['React', 'TypeScript'],
      newTech: '',
    })
    setIsEditingExp(true)
  }

  const openEditExp = (exp) => {
    setExpForm({
      id: exp.id,
      order: exp.order || 1,
      company: exp.company || '',
      companyShort: exp.companyShort || exp.company || '',
      role: exp.role || '',
      period: exp.period || '',
      periodEnd: exp.periodEnd || 'Present',
      location: exp.location || '',
      type: exp.type || 'Full-time',
      desc: exp.desc || '',
      bullets: exp.bullets || [],
      newBullet: '',
      tech: exp.tech || [],
      newTech: '',
    })
    setIsEditingExp(true)
  }

  const handleSaveExp = async (e) => {
    e.preventDefault()
    if (!expForm.company.trim() || !expForm.role.trim()) {
      showToast('Company and Role are required', 'error')
      return
    }
    setLoadingAction(true)
    try {
      await saveExp(expForm)
      showToast(`Experience at "${expForm.company}" saved`)
      setIsEditingExp(false)
    } catch (err) {
      showToast('Failed to save experience: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteExp = async (id, company) => {
    if (!confirm(`Delete experience record for "${company}"?`)) return
    try {
      await removeExp(id)
      showToast(`Deleted "${company}" record`)
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error')
    }
  }

  // --- Certification Handlers ---
  const openNewCert = () => {
    setCertForm({
      id: String(Date.now()),
      title: '',
      issuer: 'Udemy / Coursera',
      year: new Date().getFullYear().toString(),
      date: new Date().toISOString().split('T')[0],
      image: '/assets/certs/generative-ai.webp',
      order: (certifications?.length || 0) + 1,
    })
    setIsEditingCert(true)
  }

  const openEditCert = (c) => {
    setCertForm({
      id: c.id,
      title: c.title || '',
      issuer: c.issuer || '',
      year: c.year || '',
      date: c.date || '',
      image: c.image || '',
      order: c.order || 1,
    })
    setIsEditingCert(true)
  }

  const handleSaveCert = async (e) => {
    e.preventDefault()
    if (!certForm.title.trim()) {
      showToast('Certificate title is required', 'error')
      return
    }
    setLoadingAction(true)
    try {
      await saveCert(certForm)
      showToast(`Certification "${certForm.title}" saved`)
      setIsEditingCert(false)
    } catch (err) {
      showToast('Failed to save certification: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteCert = async (id, title) => {
    if (!confirm(`Delete certificate "${title}"?`)) return
    try {
      await removeCert(id)
      showToast(`Deleted "${title}"`)
    } catch (err) {
      showToast('Failed to delete: ' + err.message, 'error')
    }
  }

  // --- Services Handlers ---
  const openNewService = () => {
    setServiceForm({
      id: String(Date.now()),
      title: '',
      icon: 'Globe',
      category: 'Web Engineering',
      shortDesc: '',
      features: [],
      newFeature: '',
      tech: ['React', 'Next.js', 'Tailwind CSS'],
      newTech: '',
      order: (services?.length || 0) + 1,
    })
    setIsEditingService(true)
  }

  const openEditService = (s) => {
    setServiceForm({
      id: s.id,
      title: s.title || '',
      icon: s.icon || 'Globe',
      category: s.category || 'Web Engineering',
      shortDesc: s.shortDesc || '',
      features: s.features || [],
      newFeature: '',
      tech: s.tech || [],
      newTech: '',
      order: s.order || 1,
    })
    setIsEditingService(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    if (!serviceForm.title.trim()) {
      showToast('Service title is required', 'error')
      return
    }
    setLoadingAction(true)
    try {
      await saveServ(serviceForm)
      showToast(`Service "${serviceForm.title}" saved`)
      setIsEditingService(false)
    } catch (err) {
      showToast('Failed to save service: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteService = async (id, title) => {
    if (!confirm(`Delete service "${title}"?`)) return
    try {
      await removeServ(id)
      showToast(`Deleted "${title}"`)
    } catch (err) {
      showToast('Failed to delete service: ' + err.message, 'error')
    }
  }

  // --- Template Projects Handlers ---
  const openNewTemplate = () => {
    setTemplateForm({
      id: String(Date.now()),
      title: '',
      siteName: '',
      category: 'Fashion',
      link: 'https://',
      image: '/assets/projects/crypto-tracker.png',
      desc: '',
      tech: ['Next.js', 'Tailwind CSS', 'Stripe'],
      newTech: '',
      order: (templates?.length || 0) + 1,
    })
    setIsEditingTemplate(true)
  }

  const openEditTemplate = (t) => {
    setTemplateForm({
      id: t.id,
      title: t.title || '',
      siteName: t.siteName || '',
      category: t.category || 'Fashion',
      link: t.link || '',
      image: t.image || '',
      desc: t.desc || '',
      tech: t.tech || [],
      newTech: '',
      order: t.order || 1,
    })
    setIsEditingTemplate(true)
  }

  const handleSaveTemplate = async (e) => {
    e.preventDefault()
    if (!templateForm.title.trim() || !templateForm.siteName.trim()) {
      showToast('Template title and site name are required', 'error')
      return
    }
    setLoadingAction(true)
    try {
      await saveTempl(templateForm)
      showToast(`Template "${templateForm.title}" saved`)
      setIsEditingTemplate(false)
    } catch (err) {
      showToast('Failed to save template: ' + err.message, 'error')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleDeleteTemplate = async (id, title) => {
    if (!confirm(`Delete template project "${title}"?`)) return
    try {
      await removeTempl(id)
      showToast(`Deleted "${title}"`)
    } catch (err) {
      showToast('Failed to delete template: ' + err.message, 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-screen overflow-y-auto overflow-x-hidden bg-[#0d0d0f] text-slate-100 selection:bg-orange-500 selection:text-white font-sans antialiased admin-scroll-container">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : 'bg-stone-900/95 border-orange-500/40 text-orange-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#121216]/95 backdrop-blur-md border-b border-white/5 px-3.5 sm:px-6 py-2.5 sm:py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-orange-400/90 hover:text-orange-300 transition-colors bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Portfolio</span>
              <span className="sm:hidden">Portfolio</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-orange-400 shrink-0" />
              <h1 className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-white/90 truncate">
                Admin Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Database live state badge */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Firestore Connected</span>
              <span className="sm:hidden">Live</span>
            </div>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/5 border border-white/5 rounded-full pl-2 sm:pl-3 pr-1 sm:pr-1.5 py-0.5 sm:py-1">
                <span className="text-[11px] sm:text-xs text-slate-300 font-medium truncate max-w-[90px] sm:max-w-[170px]">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-28">
        {authLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
            <p className="text-sm text-slate-400">Authenticating access...</p>
          </div>
        ) : !user ? (
          /* Login Guard View */
          <div className="max-w-md mx-auto my-8 sm:my-12 bg-[#15151b] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access is restricted solely to <span className="text-orange-400 font-semibold">shubham.rapariya2@gmail.com</span>.
              </p>
            </div>

            {authError && (
              <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-sm py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="truncate">Sign in as shubham.rapariya2@gmail.com</span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500">
                  or email login
                </span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="shubham.rapariya2@gmail.com"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/60"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium text-sm py-2.5 rounded-xl transition-colors shadow-lg shadow-orange-600/20"
                >
                  Sign In with Password
                </button>
              </form>
            </div>
          </div>
        ) : !isAdmin ? (
          /* Unauthorized Persona Warning View */
          <div className="max-w-md mx-auto my-8 sm:my-12 bg-[#15151b] border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="inline-flex p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              You are signed in as <span className="font-mono text-red-300 font-semibold">{user.email || 'another account'}</span>.
              <br className="my-1" />
              Only <span className="font-mono text-orange-400 font-semibold">shubham.rapariya2@gmail.com</span> is authorized to access and modify the portfolio database.
            </p>
            <button
              onClick={logout}
              className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              Sign Out & Switch Account
            </button>
          </div>
        ) : (
          /* Authenticated Admin Management Interface */
          <div>
            {/* Navigation Tabs & Actions Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-[#15151b] border border-white/5 rounded-2xl p-2 sm:p-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none -mx-1 px-1">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'about'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>About</span>
                </button>

                <button
                  onClick={() => setActiveTab('work')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'work'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Work ({projects?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('experience')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'experience'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>Experience ({experience?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('certifications')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'certifications'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Certs ({certifications?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'services'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Services ({services?.length || 0})</span>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                    activeTab === 'templates'
                      ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                  <span>Templates ({templates?.length || 0})</span>
                </button>
              </div>

              {/* Seed / Sync Tool */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSeedDefaults}
                  disabled={loadingAction}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                  title="Initialize or restore baseline portfolio data in Firestore"
                >
                  <Database className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Sync Initial Data</span>
                </button>
              </div>
            </div>

            {/* TAB 1: ABOUT SECTION */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Edit Form */}
                <div className="lg:col-span-2 bg-[#15151b] border border-white/5 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-400" />
                        Manage About Information
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Configure the bio text, profile photo, signature, and skills marquee.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveAbout} className="space-y-6">
                    {/* Bio Text */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Bio Text (Typewriter presentation)
                      </label>
                      <textarea
                        rows={6}
                        value={aboutForm.bio}
                        onChange={(e) =>
                          setAboutForm({ ...aboutForm, bio: e.target.value })
                        }
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:outline-none focus:border-orange-500/60 leading-relaxed"
                        placeholder="Frontend Developer with 5+ years of experience across scalable fintech..."
                      />
                      <span className="text-[11px] text-slate-500 mt-1 block">
                        Character count: {aboutForm.bio.length}
                      </span>
                    </div>

                    {/* Image & Signature */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                          Profile Photo
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={aboutForm.image}
                            onChange={(e) =>
                              setAboutForm({ ...aboutForm, image: e.target.value })
                            }
                            placeholder="/assets/subham-about.png or https://..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                          <label className="cursor-pointer p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors" title="Upload local image">
                            <Upload className="w-4 h-4 text-orange-400" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageFileChange(e, (dataUrl) =>
                                  setAboutForm((prev) => ({ ...prev, image: dataUrl }))
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                          Signature Text
                        </label>
                        <input
                          type="text"
                          value={aboutForm.signature}
                          onChange={(e) =>
                            setAboutForm({ ...aboutForm, signature: e.target.value })
                          }
                          placeholder="Subham"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                        />
                      </div>
                    </div>

                    {/* Skills Marquee */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Who I Am / Skills Marquee Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {aboutForm.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-medium"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setAboutForm({
                                  ...aboutForm,
                                  skills: aboutForm.skills.filter((_, i) => i !== idx),
                                })
                              }
                              className="hover:text-red-400"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aboutForm.newSkill}
                          onChange={(e) =>
                            setAboutForm({ ...aboutForm, newSkill: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (aboutForm.newSkill.trim()) {
                                setAboutForm({
                                  ...aboutForm,
                                  skills: [...aboutForm.skills, aboutForm.newSkill.trim()],
                                  newSkill: '',
                                })
                              }
                            }
                          }}
                          placeholder="Add skill tag (e.g. Next.js 15, Agentic AI) & press Enter"
                          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (aboutForm.newSkill.trim()) {
                              setAboutForm({
                                ...aboutForm,
                                skills: [...aboutForm.skills, aboutForm.newSkill.trim()],
                                newSkill: '',
                              })
                            }
                          }}
                          className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-semibold text-white transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-orange-500 hover:bg-orange-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-[0.99]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save About Changes</span>
                    </button>
                  </form>
                </div>

                {/* Live Preview Card */}
                <div className="bg-[#15151b] border border-white/5 rounded-2xl p-6 h-fit">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-orange-400" />
                    Preview Visual
                  </h3>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 mb-4">
                    {aboutForm.image ? (
                      <img
                        src={aboutForm.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                        No image provided
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-serif italic text-2xl text-orange-400">
                      {aboutForm.signature || 'Signature'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Displayed signature</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WORK & PROJECTS */}
            {activeTab === 'work' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                      <span>Manage Featured Projects</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add, update, or remove interactive work items showcased in the horizontal scroll slide.
                    </p>
                  </div>
                  <button
                    onClick={openNewProject}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Project</span>
                  </button>
                </div>

                {/* Projects List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      className="bg-[#15151b] border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-orange-500/40 transition-all"
                    >
                      <div className="relative aspect-video w-full bg-black/60 overflow-hidden">
                        {proj.image ? (
                          <img
                            src={proj.image}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : null}
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-semibold text-orange-400 border border-white/10">
                          {proj.type || 'Web App'}
                        </div>
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white">
                          #{proj.order || idx + 1}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white text-base mb-1">
                            {proj.title}
                          </h3>
                          {proj.subtitle && (
                            <p className="text-xs text-orange-300/80 mb-2 font-medium">
                              {proj.subtitle}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                            {proj.desc}
                          </p>

                          {proj.tech && proj.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {proj.tech.map((t, ti) => (
                                <span
                                  key={ti}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-slate-300"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          {proj.link ? (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors min-h-[36px] py-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live Demo</span>
                            </a>
                          ) : (
                            <span className="text-xs text-slate-600">No link</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditProject(proj)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Edit project"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit / Create Project Modal Form */}
                {isEditingProject && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#181820] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate pr-2">
                          {projectForm.title ? `Edit Project: ${projectForm.title}` : 'Create New Project'}
                        </h3>
                        <button
                          onClick={() => setIsEditingProject(false)}
                          className="text-slate-400 hover:text-white text-xl p-1"
                        >
                          &times;
                        </button>
                      </div>

                      <form onSubmit={handleSaveProject} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Project Title *
                            </label>
                            <input
                              type="text"
                              value={projectForm.title}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, title: e.target.value })
                              }
                              placeholder="e.g. Loan Origination System"
                              required
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Subtitle / Catchphrase
                            </label>
                            <input
                              type="text"
                              value={projectForm.subtitle}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, subtitle: e.target.value })
                              }
                              placeholder="e.g. Enterprise Fintech Platform"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Type Tag
                            </label>
                            <input
                              type="text"
                              value={projectForm.type}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, type: e.target.value })
                              }
                              placeholder="e.g. Fintech SaaS / Web App"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              value={projectForm.order}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, order: Number(e.target.value) })
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Live Demo URL
                            </label>
                            <input
                              type="text"
                              value={projectForm.link}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, link: e.target.value })
                              }
                              placeholder="https://..."
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        {/* Image input with upload */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Project Hero Image
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={projectForm.image}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, image: e.target.value })
                              }
                              placeholder="/assets/projects/... or https://..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <label className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10" title="Upload image file">
                              <Upload className="w-4 h-4 text-orange-400" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageFileChange(e, (dataUrl) =>
                                    setProjectForm((prev) => ({ ...prev, image: dataUrl }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Project Description *
                          </label>
                          <textarea
                            rows={3}
                            value={projectForm.desc}
                            onChange={(e) =>
                              setProjectForm({ ...projectForm, desc: e.target.value })
                            }
                            required
                            placeholder="Architected dynamic rule-driven workflows and dashboard analytics..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        {/* Tech Stack Tags */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Technologies Used
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {projectForm.tech.map((t, ti) => (
                              <span
                                key={ti}
                                className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-orange-300"
                              >
                                {t}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjectForm({
                                      ...projectForm,
                                      tech: projectForm.tech.filter((_, i) => i !== ti),
                                    })
                                  }
                                  className="hover:text-red-400"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={projectForm.newTech}
                              onChange={(e) =>
                                setProjectForm({ ...projectForm, newTech: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (projectForm.newTech.trim()) {
                                    setProjectForm({
                                      ...projectForm,
                                      tech: [...projectForm.tech, projectForm.newTech.trim()],
                                      newTech: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="Add tech (e.g. Next.js, Redux) & press Enter"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (projectForm.newTech.trim()) {
                                  setProjectForm({
                                    ...projectForm,
                                    tech: [...projectForm.tech, projectForm.newTech.trim()],
                                    newTech: '',
                                  })
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 rounded-xl text-xs text-white font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingProject(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Project</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXPERIENCE SECTION */}
            {activeTab === 'experience' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                      <span>Manage Work Experience</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure company timelines, roles, descriptions, key achievement bullets, and tech stack tags.
                    </p>
                  </div>
                  <button
                    onClick={openNewExp}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Experience</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="bg-[#15151b] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-start gap-3 sm:gap-4 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-xs sm:text-sm text-orange-400 shrink-0">
                          {exp.order < 10 ? `0${exp.order}` : exp.order}
                        </div>

                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <h3 className="text-sm sm:text-base font-bold text-white">
                              {exp.company}
                            </h3>
                            <span className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-orange-400 font-semibold">
                              {exp.role}
                            </span>
                            <span className="text-[11px] sm:text-xs text-slate-400">
                              {exp.period} — {exp.periodEnd}
                            </span>
                            {exp.location && (
                              <span className="text-[11px] sm:text-xs text-slate-500">
                                ({exp.location})
                              </span>
                            )}
                          </div>

                          {exp.desc && (
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                              {exp.desc}
                            </p>
                          )}

                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-1">
                              {exp.bullets.map((b, bi) => (
                                <li key={bi} className="leading-relaxed">
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}

                          {exp.tech && exp.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {exp.tech.map((t, ti) => (
                                <span
                                  key={ti}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-400"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                        <button
                          onClick={() => openEditExp(exp)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Edit Experience"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExp(exp.id, exp.company)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Delete Experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit / Create Experience Modal Form */}
                {isEditingExp && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#181820] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate pr-2">
                          {expForm.company ? `Edit: ${expForm.company}` : 'New Work Experience'}
                        </h3>
                        <button
                          onClick={() => setIsEditingExp(false)}
                          className="text-slate-400 hover:text-white text-xl p-1"
                        >
                          &times;
                        </button>
                      </div>

                      <form onSubmit={handleSaveExp} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Company Name *
                            </label>
                            <input
                              type="text"
                              value={expForm.company}
                              onChange={(e) =>
                                setExpForm({ ...expForm, company: e.target.value })
                              }
                              required
                              placeholder="e.g. Finequs SaaS"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Role Title *
                            </label>
                            <input
                              type="text"
                              value={expForm.role}
                              onChange={(e) =>
                                setExpForm({ ...expForm, role: e.target.value })
                              }
                              required
                              placeholder="e.g. Senior Frontend Developer"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Order Number
                            </label>
                            <input
                              type="number"
                              value={expForm.order}
                              onChange={(e) =>
                                setExpForm({ ...expForm, order: Number(e.target.value) })
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Timeline Start
                            </label>
                            <input
                              type="text"
                              value={expForm.period}
                              onChange={(e) =>
                                setExpForm({ ...expForm, period: e.target.value })
                              }
                              placeholder="2023"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Timeline End
                            </label>
                            <input
                              type="text"
                              value={expForm.periodEnd}
                              onChange={(e) =>
                                setExpForm({ ...expForm, periodEnd: e.target.value })
                              }
                              placeholder="Present"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={expForm.location}
                              onChange={(e) =>
                                setExpForm({ ...expForm, location: e.target.value })
                              }
                              placeholder="Jaipur, India"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Role Overview Description
                          </label>
                          <input
                            type="text"
                            value={expForm.desc}
                            onChange={(e) =>
                              setExpForm({ ...expForm, desc: e.target.value })
                            }
                            placeholder="Brief summary of overall role and domain"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        {/* Main Points / Bullets */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Main Points & Key Achievements
                          </label>
                          <div className="space-y-2 mb-2">
                            {expForm.bullets.map((b, bi) => (
                              <div
                                key={bi}
                                className="flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-white/5 text-xs text-slate-300"
                              >
                                <span className="flex-1">{b}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpForm({
                                      ...expForm,
                                      bullets: expForm.bullets.filter((_, i) => i !== bi),
                                    })
                                  }
                                  className="text-slate-500 hover:text-red-400 p-1"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={expForm.newBullet}
                              onChange={(e) =>
                                setExpForm({ ...expForm, newBullet: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (expForm.newBullet.trim()) {
                                    setExpForm({
                                      ...expForm,
                                      bullets: [...expForm.bullets, expForm.newBullet.trim()],
                                      newBullet: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="Add bullet point & press Enter"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (expForm.newBullet.trim()) {
                                  setExpForm({
                                    ...expForm,
                                    bullets: [...expForm.bullets, expForm.newBullet.trim()],
                                    newBullet: '',
                                  })
                                }
                              }}
                              className="px-3 py-2 bg-white/10 rounded-xl text-xs text-white font-medium"
                            >
                              Add Bullet
                            </button>
                          </div>
                        </div>

                        {/* Tech stack */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Technologies Used
                          </label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {expForm.tech.map((t, ti) => (
                              <span
                                key={ti}
                                className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-orange-300"
                              >
                                {t}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpForm({
                                      ...expForm,
                                      tech: expForm.tech.filter((_, i) => i !== ti),
                                    })
                                  }
                                  className="hover:text-red-400"
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={expForm.newTech}
                              onChange={(e) =>
                                setExpForm({ ...expForm, newTech: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (expForm.newTech.trim()) {
                                    setExpForm({
                                      ...expForm,
                                      tech: [...expForm.tech, expForm.newTech.trim()],
                                      newTech: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="Add tech tag & press Enter"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (expForm.newTech.trim()) {
                                  setExpForm({
                                    ...expForm,
                                    tech: [...expForm.tech, expForm.newTech.trim()],
                                    newTech: '',
                                  })
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 rounded-xl text-xs text-white font-medium"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingExp(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Experience</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CERTIFICATIONS SECTION */}
            {activeTab === 'certifications' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                      <span>Manage Certifications</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add, update, or remove credentials shown in the infinite marquee columns with lightbox modal previews.
                    </p>
                  </div>
                  <button
                    onClick={openNewCert}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Certification</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {certifications.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="bg-[#15151b] border border-white/5 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-orange-500/40 transition-all"
                    >
                      <div className="relative aspect-[4/3] w-full bg-black/60 overflow-hidden">
                        {c.image ? (
                          <img
                            src={c.image}
                            alt={c.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : null}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-semibold text-orange-400 border border-white/10">
                          {c.year || '2024'}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-white text-sm line-clamp-2 mb-1">
                            {c.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {c.issuer}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                          <span className="text-[10px] text-slate-500">
                            {c.date || c.year}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => openEditCert(c)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Edit Certification"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCert(c.id, c.title)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Delete Certification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit / Create Certification Modal Form */}
                {isEditingCert && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#181820] border border-white/10 rounded-2xl w-full max-w-lg max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate pr-2">
                          {certForm.title ? `Edit Certificate: ${certForm.title}` : 'Add Certification'}
                        </h3>
                        <button
                          onClick={() => setIsEditingCert(false)}
                          className="text-slate-400 hover:text-white text-xl p-1"
                        >
                          &times;
                        </button>
                      </div>

                      <form onSubmit={handleSaveCert} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Certificate Name / Title *
                          </label>
                          <input
                            type="text"
                            value={certForm.title}
                            onChange={(e) =>
                              setCertForm({ ...certForm, title: e.target.value })
                            }
                            required
                            placeholder="e.g. Generative AI with Large Language Models"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Issuing Organization
                            </label>
                            <input
                              type="text"
                              value={certForm.issuer}
                              onChange={(e) =>
                                setCertForm({ ...certForm, issuer: e.target.value })
                              }
                              placeholder="e.g. DeepLearning.AI / Coursera"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Year
                            </label>
                            <input
                              type="text"
                              value={certForm.year}
                              onChange={(e) =>
                                setCertForm({ ...certForm, year: e.target.value })
                              }
                              placeholder="2024"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Issue Date (for sort ordering)
                          </label>
                          <input
                            type="date"
                            value={certForm.date}
                            onChange={(e) =>
                              setCertForm({ ...certForm, date: e.target.value })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Certificate Image
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={certForm.image}
                              onChange={(e) =>
                                setCertForm({ ...certForm, image: e.target.value })
                              }
                              placeholder="/assets/certs/... or https://..."
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <label className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10" title="Upload image file">
                              <Upload className="w-4 h-4 text-orange-400" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageFileChange(e, (dataUrl) =>
                                    setCertForm((prev) => ({ ...prev, image: dataUrl }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {certForm.image && (
                          <div className="aspect-[4/3] w-36 mx-auto rounded-xl bg-black/50 overflow-hidden border border-white/10 p-1">
                            <img
                              src={certForm.image}
                              alt="Cert Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingCert(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Certification</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: SERVICES MANAGEMENT */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#15151b] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>Manage Core Services &amp; Capabilities ({services?.length || 0})</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure custom services such as Websites, Web Apps, Android Apps, AI Agents, and APIs.
                    </p>
                  </div>
                  <button
                    onClick={openNewService}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-colors w-full sm:w-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Service</span>
                  </button>
                </div>

                {/* Services Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(services || []).map((srv, idx) => (
                    <div
                      key={srv.id || idx}
                      className="bg-[#15151b] border border-white/5 hover:border-white/15 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col justify-between transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20">
                              {srv.category || 'Engineering'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              #{String(srv.order || idx + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditService(srv)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Edit Service"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(srv.id, srv.title)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                              title="Delete Service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                          {srv.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                          {srv.shortDesc}
                        </p>

                        {Array.isArray(srv.features) && srv.features.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {srv.features.slice(0, 3).map((feat, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                                <CheckCircle2 className="w-3 h-3 text-orange-400 shrink-0" />
                                <span className="truncate">{feat}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1 mt-2">
                        {(srv.tech || []).slice(0, 4).map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400 font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service Edit / Create Modal */}
                {isEditingService && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#15151b] border border-white/10 rounded-2xl w-full max-w-xl max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate pr-2">
                          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>
                            {serviceForm.id && services.some(s => s.id === serviceForm.id)
                              ? 'Edit Service'
                              : 'Add New Service'}
                          </span>
                        </h3>
                        <button
                          onClick={() => setIsEditingService(false)}
                          className="text-slate-400 hover:text-white text-base p-1 font-semibold"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveService} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Service Title *
                          </label>
                          <input
                            type="text"
                            value={serviceForm.title}
                            onChange={(e) =>
                              setServiceForm({ ...serviceForm, title: e.target.value })
                            }
                            placeholder="e.g. Website Development or AI Agents"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Icon Symbol
                            </label>
                            <select
                              value={serviceForm.icon}
                              onChange={(e) =>
                                setServiceForm({ ...serviceForm, icon: e.target.value })
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            >
                              <option value="Globe">Globe (Web)</option>
                              <option value="Layers">Layers (SaaS)</option>
                              <option value="Smartphone">Smartphone (Mobile)</option>
                              <option value="Bot">Bot (AI Agent)</option>
                              <option value="Palette">Palette (UI/UX)</option>
                              <option value="Cpu">Cpu (Cloud / API)</option>
                              <option value="Code">Code (Engineering)</option>
                              <option value="Sparkles">Sparkles (Innovation)</option>
                              <option value="Zap">Zap (Performance)</option>
                              <option value="Briefcase">Briefcase (Consulting)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Category Badge
                            </label>
                            <input
                              type="text"
                              value={serviceForm.category}
                              onChange={(e) =>
                                setServiceForm({ ...serviceForm, category: e.target.value })
                              }
                              placeholder="e.g. Web Engineering"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={serviceForm.order}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  order: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Short Description *
                          </label>
                          <textarea
                            rows={3}
                            value={serviceForm.shortDesc}
                            onChange={(e) =>
                              setServiceForm({ ...serviceForm, shortDesc: e.target.value })
                            }
                            placeholder="Concise overview of what this service delivers..."
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60 leading-relaxed"
                          />
                        </div>

                        {/* Features List Input */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Key Deliverables / Features
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={serviceForm.newFeature}
                              onChange={(e) =>
                                setServiceForm({ ...serviceForm, newFeature: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (serviceForm.newFeature.trim()) {
                                    setServiceForm({
                                      ...serviceForm,
                                      features: [...(serviceForm.features || []), serviceForm.newFeature.trim()],
                                      newFeature: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="e.g. 100/100 Core Web Vitals (Press Enter)"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (serviceForm.newFeature.trim()) {
                                  setServiceForm({
                                    ...serviceForm,
                                    features: [...(serviceForm.features || []), serviceForm.newFeature.trim()],
                                    newFeature: '',
                                  })
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white"
                            >
                              Add
                            </button>
                          </div>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {(serviceForm.features || []).map((f, fIdx) => (
                              <div
                                key={fIdx}
                                className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded-lg text-xs text-slate-300"
                              >
                                <span className="truncate">{f}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setServiceForm({
                                      ...serviceForm,
                                      features: serviceForm.features.filter((_, i) => i !== fIdx),
                                    })
                                  }
                                  className="text-slate-500 hover:text-red-400 text-xs ml-2"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tech Stack Input */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Technologies Used
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={serviceForm.newTech}
                              onChange={(e) =>
                                setServiceForm({ ...serviceForm, newTech: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (serviceForm.newTech.trim()) {
                                    setServiceForm({
                                      ...serviceForm,
                                      tech: [...(serviceForm.tech || []), serviceForm.newTech.trim()],
                                      newTech: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="e.g. Next.js, React, Tailwind (Press Enter)"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (serviceForm.newTech.trim()) {
                                  setServiceForm({
                                    ...serviceForm,
                                    tech: [...(serviceForm.tech || []), serviceForm.newTech.trim()],
                                    newTech: '',
                                  })
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(serviceForm.tech || []).map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300"
                              >
                                <span>{t}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setServiceForm({
                                      ...serviceForm,
                                      tech: serviceForm.tech.filter((_, i) => i !== tIdx),
                                    })
                                  }
                                  className="text-slate-500 hover:text-red-400"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingService(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Service</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: TEMPLATES MANAGEMENT */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#15151b] border border-white/5 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>Manage Template Projects ({templates?.length || 0})</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add deployed full-stack templates across Fashion, Finance, Automotive, E-Commerce, etc.
                    </p>
                  </div>
                  <button
                    onClick={openNewTemplate}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-colors w-full sm:w-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Template</span>
                  </button>
                </div>

                {/* Templates Grid List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(templates || []).map((t, idx) => (
                    <div
                      key={t.id || idx}
                      className="bg-[#15151b] border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all group"
                    >
                      <div>
                        {/* Hero Screenshot Preview */}
                        <div className="relative w-full h-40 bg-black/60 overflow-hidden border-b border-white/5">
                          {t.image ? (
                            <img
                              src={t.image}
                              alt={t.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-mono">
                              No Image
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                            {t.category || 'Web'}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-lg border border-white/10">
                            <button
                              onClick={() => openEditTemplate(t)}
                              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="Edit Template"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(t.id, t.title)}
                              className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                              title="Delete Template"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-semibold text-slate-300 truncate max-w-[180px]">
                              {t.siteName || 'Brand Site'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">
                              #{String(t.order || idx + 1).padStart(2, '0')}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                            {t.title}
                          </h3>

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {(t.tech || []).slice(0, 3).map((item, iIdx) => (
                            <span
                              key={iIdx}
                              className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400 font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        {t.link && (
                          <a
                            href={t.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/30 rounded-xl text-xs font-semibold text-slate-300 hover:text-orange-300 transition-colors min-h-[40px]"
                          >
                            <span>Visit Live Deployment</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Template Edit / Create Modal */}
                {isEditingTemplate && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#15151b] border border-white/10 rounded-2xl w-full max-w-xl max-h-[92dvh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 truncate pr-2">
                          <LayoutGrid className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>
                            {templateForm.id && templates.some(t => t.id === templateForm.id)
                              ? 'Edit Template'
                              : 'Add New Template Project'}
                          </span>
                        </h3>
                        <button
                          onClick={() => setIsEditingTemplate(false)}
                          className="text-slate-400 hover:text-white text-base p-1 font-semibold"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSaveTemplate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Template Title *
                            </label>
                            <input
                              type="text"
                              value={templateForm.title}
                              onChange={(e) =>
                                setTemplateForm({ ...templateForm, title: e.target.value })
                              }
                              placeholder="e.g. Aura Couture"
                              required
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Site / Brand Name *
                            </label>
                            <input
                              type="text"
                              value={templateForm.siteName}
                              onChange={(e) =>
                                setTemplateForm({ ...templateForm, siteName: e.target.value })
                              }
                              placeholder="e.g. Aura Fashion & Luxury"
                              required
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Category (e.g. Fashion, Finance, Automotive) *
                            </label>
                            <input
                              type="text"
                              value={templateForm.category}
                              onChange={(e) =>
                                setTemplateForm({ ...templateForm, category: e.target.value })
                              }
                              placeholder="Fashion / Finance / Automotive"
                              required
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Display Order
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={templateForm.order}
                              onChange={(e) =>
                                setTemplateForm({
                                  ...templateForm,
                                  order: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Live Visit Link *
                          </label>
                          <input
                            type="url"
                            value={templateForm.link}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, link: e.target.value })
                            }
                            placeholder="https://your-template-preview.vercel.app"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                          />
                        </div>

                        {/* Hero Section Image */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Hero Section Image URL or File Upload *
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={templateForm.image}
                              onChange={(e) =>
                                setTemplateForm({ ...templateForm, image: e.target.value })
                              }
                              placeholder="/assets/projects/... or https://..."
                              required
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <label
                              className="cursor-pointer p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10"
                              title="Upload hero screenshot file"
                            >
                              <Upload className="w-4 h-4 text-orange-400" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleImageFileChange(e, (dataUrl) =>
                                    setTemplateForm((prev) => ({ ...prev, image: dataUrl }))
                                  )
                                }
                              />
                            </label>
                          </div>
                        </div>

                        {/* Image Preview */}
                        {templateForm.image && (
                          <div className="aspect-video w-48 mx-auto rounded-xl bg-black/50 overflow-hidden border border-white/10">
                            <img
                              src={templateForm.image}
                              alt="Template Hero Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Description
                          </label>
                          <textarea
                            rows={3}
                            value={templateForm.desc}
                            onChange={(e) =>
                              setTemplateForm({ ...templateForm, desc: e.target.value })
                            }
                            placeholder="Describe the template design, architecture, key features..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500/60 leading-relaxed"
                          />
                        </div>

                        {/* Tech Stack Tags */}
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Technologies Used
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={templateForm.newTech}
                              onChange={(e) =>
                                setTemplateForm({ ...templateForm, newTech: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (templateForm.newTech.trim()) {
                                    setTemplateForm({
                                      ...templateForm,
                                      tech: [...(templateForm.tech || []), templateForm.newTech.trim()],
                                      newTech: '',
                                    })
                                  }
                                }
                              }}
                              placeholder="e.g. Next.js, Stripe, Motion (Press Enter)"
                              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/60"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (templateForm.newTech.trim()) {
                                  setTemplateForm({
                                    ...templateForm,
                                    tech: [...(templateForm.tech || []), templateForm.newTech.trim()],
                                    newTech: '',
                                  })
                                }
                              }}
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white"
                            >
                              Add
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(templateForm.tech || []).map((t, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-slate-300"
                              >
                                <span>{t}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTemplateForm({
                                      ...templateForm,
                                      tech: templateForm.tech.filter((_, i) => i !== tIdx),
                                    })
                                  }
                                  className="text-slate-500 hover:text-red-400"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => setIsEditingTemplate(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={loadingAction}
                            className="flex items-center gap-2 px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl shadow-md shadow-orange-500/20"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Template</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
