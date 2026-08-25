import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { handleFirestoreError, OperationType } from './firestoreErrors'
import defaultProfile from '@/data/profile.json'

export const DEFAULT_PORTFOLIO = {
  about: {
    bio: defaultProfile.bio,
    image: '/assets/subham-about.png',
    signature: defaultProfile.name.first || 'Subham',
    skills: defaultProfile.skills,
    updatedAt: new Date().toISOString(),
  },
  projects: defaultProfile.projects.map((p, idx) => ({
    id: String(p.id),
    title: p.title,
    subtitle: p.subtitle || '',
    type: p.type || 'Web App',
    link: p.link || '#',
    image: p.image || '/assets/projects/crypto-tracker.png',
    tech: Array.isArray(p.tech) ? p.tech : [],
    desc: p.desc || '',
    order: idx + 1,
  })),
  experience: defaultProfile.experience.map((e, idx) => ({
    id: String(e.id),
    order: idx + 1,
    company: e.company,
    companyShort: e.companyShort || e.company,
    role: e.role,
    period: e.period || '',
    periodEnd: e.periodEnd || 'Present',
    location: e.location || 'India',
    type: e.type || 'Full-time',
    desc: e.desc || '',
    bullets: Array.isArray(e.bullets) ? e.bullets : [],
    tech: Array.isArray(e.tech) ? e.tech : [],
  })),
  certifications: defaultProfile.certifications.map((c, idx) => ({
    id: String(c.id),
    title: c.title,
    issuer: c.issuer || '',
    year: c.year || '2024',
    date: c.date || '2024-01-01',
    image: c.image || '',
    order: idx + 1,
  })),
  services: (defaultProfile.services || []).map((s, idx) => ({
    id: String(s.id),
    title: s.title || '',
    icon: s.icon || 'Globe',
    category: s.category || 'Engineering',
    shortDesc: s.shortDesc || '',
    features: Array.isArray(s.features) ? s.features : [],
    tech: Array.isArray(s.tech) ? s.tech : [],
    order: Number(s.order) || idx + 1,
  })),
  templates: (defaultProfile.templates || []).map((t, idx) => ({
    id: String(t.id),
    title: t.title || '',
    siteName: t.siteName || '',
    category: t.category || 'Web',
    link: t.link || '',
    image: t.image || '',
    desc: t.desc || '',
    tech: Array.isArray(t.tech) ? t.tech : [],
    order: Number(t.order) || idx + 1,
  })),
}

// Subscribe to all collections in real time
export function subscribePortfolioData(onUpdate, onError) {
  let state = {
    about: DEFAULT_PORTFOLIO.about,
    projects: DEFAULT_PORTFOLIO.projects,
    experience: DEFAULT_PORTFOLIO.experience,
    certifications: DEFAULT_PORTFOLIO.certifications,
    services: DEFAULT_PORTFOLIO.services,
    templates: DEFAULT_PORTFOLIO.templates,
    isLive: false,
    loaded: false,
  }

  // Check about doc
  const unsubAbout = onSnapshot(
    doc(db, 'portfolio', 'about'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        state = {
          ...state,
          about: {
            ...DEFAULT_PORTFOLIO.about,
            ...data,
          },
          isLive: true,
          loaded: true,
        }
      } else {
        state = { ...state, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback about data:', err.message)
      state = { ...state, loaded: true }
      onUpdate?.(state)
    }
  )

  // Projects collection
  const unsubProjects = onSnapshot(
    collection(db, 'projects'),
    (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        state = { ...state, projects: items, isLive: true, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback projects data:', err.message)
      onUpdate?.(state)
    }
  )

  // Experience collection
  const unsubExp = onSnapshot(
    collection(db, 'experience'),
    (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        state = { ...state, experience: items, isLive: true, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback experience data:', err.message)
      onUpdate?.(state)
    }
  )

  // Certifications collection
  const unsubCerts = onSnapshot(
    collection(db, 'certifications'),
    (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => new Date(b.date || '2020-01-01') - new Date(a.date || '2020-01-01'))
        state = { ...state, certifications: items, isLive: true, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback certifications data:', err.message)
      onUpdate?.(state)
    }
  )

  // Services collection
  const unsubServices = onSnapshot(
    collection(db, 'services'),
    (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        state = { ...state, services: items, isLive: true, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback services data:', err.message)
      onUpdate?.(state)
    }
  )

  // Templates collection
  const unsubTemplates = onSnapshot(
    collection(db, 'templates'),
    (snap) => {
      if (!snap.empty) {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        items.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
        state = { ...state, templates: items, isLive: true, loaded: true }
      }
      onUpdate?.(state)
    },
    (err) => {
      console.warn('Using fallback templates data:', err.message)
      onUpdate?.(state)
    }
  )

  return () => {
    unsubAbout()
    unsubProjects()
    unsubExp()
    unsubCerts()
    unsubServices()
    unsubTemplates()
  }
}

// Admin write methods
export async function saveAboutData(aboutData) {
  const path = 'portfolio/about'
  try {
    const payload = {
      bio: aboutData.bio || '',
      image: aboutData.image || '/assets/subham-about.png',
      signature: aboutData.signature || 'Subham',
      skills: Array.isArray(aboutData.skills) ? aboutData.skills : [],
      updatedAt: new Date().toISOString(),
    }
    await setDoc(doc(db, 'portfolio', 'about'), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function saveProject(project) {
  const docId = String(project.id || Date.now())
  const path = `projects/${docId}`
  try {
    const payload = {
      id: docId,
      title: project.title || 'Untitled Project',
      subtitle: project.subtitle || '',
      type: project.type || 'Web App',
      link: project.link || '',
      image: project.image || '/assets/projects/crypto-tracker.png',
      tech: Array.isArray(project.tech) ? project.tech : [],
      desc: project.desc || '',
      order: Number(project.order) || 1,
    }
    await setDoc(doc(db, 'projects', docId), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function deleteProject(projectId) {
  const path = `projects/${projectId}`
  try {
    await deleteDoc(doc(db, 'projects', String(projectId)))
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path)
  }
}

export async function saveExperience(exp) {
  const docId = String(exp.id || Date.now())
  const path = `experience/${docId}`
  try {
    const payload = {
      id: docId,
      order: Number(exp.order) || 1,
      company: exp.company || '',
      companyShort: exp.companyShort || exp.company || '',
      role: exp.role || '',
      period: exp.period || '',
      periodEnd: exp.periodEnd || 'Present',
      location: exp.location || '',
      type: exp.type || 'Full-time',
      desc: exp.desc || '',
      bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
      tech: Array.isArray(exp.tech) ? exp.tech : [],
    }
    await setDoc(doc(db, 'experience', docId), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function deleteExperience(expId) {
  const path = `experience/${expId}`
  try {
    await deleteDoc(doc(db, 'experience', String(expId)))
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path)
  }
}

export async function saveCertification(cert) {
  const docId = String(cert.id || Date.now())
  const path = `certifications/${docId}`
  try {
    const payload = {
      id: docId,
      title: cert.title || 'Untitled Certificate',
      issuer: cert.issuer || '',
      year: cert.year || '2024',
      date: cert.date || '2024-01-01',
      image: cert.image || '',
      order: Number(cert.order) || 1,
    }
    await setDoc(doc(db, 'certifications', docId), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function deleteCertification(certId) {
  const path = `certifications/${certId}`
  try {
    await deleteDoc(doc(db, 'certifications', String(certId)))
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path)
  }
}

export async function saveService(service) {
  const docId = String(service.id || Date.now())
  const path = `services/${docId}`
  try {
    const payload = {
      id: docId,
      title: service.title || 'Untitled Service',
      icon: service.icon || 'Globe',
      category: service.category || 'Engineering',
      shortDesc: service.shortDesc || '',
      features: Array.isArray(service.features) ? service.features : [],
      tech: Array.isArray(service.tech) ? service.tech : [],
      order: Number(service.order) || 1,
    }
    await setDoc(doc(db, 'services', docId), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function deleteService(serviceId) {
  const path = `services/${serviceId}`
  try {
    await deleteDoc(doc(db, 'services', String(serviceId)))
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path)
  }
}

export async function saveTemplate(template) {
  const docId = String(template.id || Date.now())
  const path = `templates/${docId}`
  try {
    const payload = {
      id: docId,
      title: template.title || 'Untitled Template',
      siteName: template.siteName || '',
      category: template.category || 'Web',
      link: template.link || '',
      image: template.image || '/assets/projects/crypto-tracker.png',
      desc: template.desc || '',
      tech: Array.isArray(template.tech) ? template.tech : [],
      order: Number(template.order) || 1,
    }
    await setDoc(doc(db, 'templates', docId), payload)
    return payload
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path)
  }
}

export async function deleteTemplate(templateId) {
  const path = `templates/${templateId}`
  try {
    await deleteDoc(doc(db, 'templates', String(templateId)))
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path)
  }
}

// Seed all initial default data into Firestore
export async function seedAllDefaultData() {
  try {
    // 1. Seed about
    await saveAboutData(DEFAULT_PORTFOLIO.about)

    // 2. Seed projects
    for (const p of DEFAULT_PORTFOLIO.projects) {
      await saveProject(p)
    }

    // 3. Seed experience
    for (const e of DEFAULT_PORTFOLIO.experience) {
      await saveExperience(e)
    }

    // 4. Seed certifications
    for (const c of DEFAULT_PORTFOLIO.certifications) {
      await saveCertification(c)
    }

    // 5. Seed services
    for (const s of DEFAULT_PORTFOLIO.services) {
      await saveService(s)
    }

    // 6. Seed templates
    for (const t of DEFAULT_PORTFOLIO.templates) {
      await saveTemplate(t)
    }

    return true
  } catch (err) {
    console.error('Error seeding default data:', err)
    throw err
  }
}
