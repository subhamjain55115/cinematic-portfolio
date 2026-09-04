'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDocFromServer } from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebase'
import {
  DEFAULT_PORTFOLIO,
  subscribePortfolioData,
  saveAboutData,
  saveProject,
  deleteProject,
  saveExperience,
  deleteExperience,
  saveCertification,
  deleteCertification,
  saveService,
  deleteService,
  saveTemplate,
  deleteTemplate,
  syncDefaultTemplates,
  seedAllDefaultData,
} from '@/lib/portfolioService'

const ADMIN_EMAIL = 'shubham.rapariya2@gmail.com'

const PortfolioContext = createContext({
  about: DEFAULT_PORTFOLIO.about,
  projects: DEFAULT_PORTFOLIO.projects,
  experience: DEFAULT_PORTFOLIO.experience,
  certifications: DEFAULT_PORTFOLIO.certifications,
  services: DEFAULT_PORTFOLIO.services,
  templates: DEFAULT_PORTFOLIO.templates,
  isLive: false,
  loaded: false,
  user: null,
  isAdmin: false,
  authLoading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  logout: async () => {},
  saveAbout: async () => {},
  saveProj: async () => {},
  removeProj: async () => {},
  saveExp: async () => {},
  removeExp: async () => {},
  saveCert: async () => {},
  removeCert: async () => {},
  saveServ: async () => {},
  removeServ: async () => {},
  saveTempl: async () => {},
  removeTempl: async () => {},
  syncTemplates: async () => {},
  resetToDefaults: async () => {},
})

export function PortfolioProvider({ children }) {
  const [data, setData] = useState({
    about: DEFAULT_PORTFOLIO.about,
    projects: DEFAULT_PORTFOLIO.projects,
    experience: DEFAULT_PORTFOLIO.experience,
    certifications: DEFAULT_PORTFOLIO.certifications,
    services: DEFAULT_PORTFOLIO.services,
    templates: DEFAULT_PORTFOLIO.templates,
    isLive: false,
    loaded: false,
  })
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Test connection on boot as required by Firebase skill
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'))
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firestore client offline test warning')
        }
      }
    }
    testConnection()
  }, [])

  // Listen to portfolio data real-time
  useEffect(() => {
    const unsub = subscribePortfolioData((latest) => {
      setData(latest)
    })
    return () => unsub?.()
  }, [])

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubAuth()
  }, [])

  const isAdmin = Boolean(
    user && user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()
  )

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider)
      if (res.user?.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        await signOut(auth)
        throw new Error(`Unauthorized: ${res.user.email} does not have admin access. Only ${ADMIN_EMAIL} is authorized.`)
      }
      return res.user
    } catch (err) {
      console.error('Google sign-in error:', err)
      throw err
    }
  }

  const loginWithEmail = async (email, password) => {
    try {
      if (email.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        throw new Error(`Unauthorized: Only ${ADMIN_EMAIL} is authorized.`)
      }
      const res = await signInWithEmailAndPassword(auth, email, password)
      if (res.user?.email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase().trim()) {
        await signOut(auth)
        throw new Error(`Unauthorized: Only ${ADMIN_EMAIL} is authorized.`)
      }
      return res.user
    } catch (err) {
      console.error('Email sign-in error:', err)
      throw err
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <PortfolioContext.Provider
      value={{
        about: data.about,
        projects: data.projects,
        experience: data.experience,
        certifications: data.certifications,
        services: data.services,
        templates: data.templates,
        isLive: data.isLive,
        loaded: data.loaded,
        user,
        isAdmin,
        authLoading,
        loginWithGoogle,
        loginWithEmail,
        logout,
        saveAbout: saveAboutData,
        saveProj: saveProject,
        removeProj: deleteProject,
        saveExp: saveExperience,
        removeExp: deleteExperience,
        saveCert: saveCertification,
        removeCert: deleteCertification,
        saveServ: saveService,
        removeServ: deleteService,
        saveTempl: saveTemplate,
        removeTempl: deleteTemplate,
        syncTemplates: syncDefaultTemplates,
        resetToDefaults: seedAllDefaultData,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  return useContext(PortfolioContext)
}
