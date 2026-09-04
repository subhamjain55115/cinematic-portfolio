import { Geist, Geist_Mono, Baloo_2, Dancing_Script } from "next/font/google";
import "./globals.css";
import Cursor from "@/components/ui/Cursor";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { SITE_URL } from '@/lib/siteConfig';
import { PortfolioProvider } from "@/context/PortfolioContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const dancing = Dancing_Script({
  variable: "--font-dancing",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const title = "Subham Jain | Lead Frontend Developer & UI Architect";
const description =
  "Frontend Developer with 5+ years of experience across scalable fintech and enterprise-grade applications, currently architecting a configurable Loan Origination & Loan Management SaaS platform with React, Redux Toolkit, and Agentic AI.";

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
    { media: "(prefers-color-scheme: light)", color: "#080808" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "dark",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | Subham Jain",
  },
  description,
  applicationName: "Subham Jain Cinematic Portfolio",
  keywords: [
    "Subham Jain",
    "Frontend Developer",
    "Lead Frontend Developer",
    "React Developer",
    "Redux Toolkit",
    "Fintech Frontend Engineer",
    "Loan Origination System",
    "Loan Management System",
    "Agentic AI",
    "Lending Platforms",
    "UI Architect",
    "JavaScript",
    "TypeScript",
    "Tailwind CSS",
    "Next.js Portfolio",
    "Jaipur Developer",
    "Three.js Portfolio",
  ],
  authors: [{ name: "Subham Jain", url: SITE_URL }],
  creator: "Subham Jain",
  publisher: "Subham Jain",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "technology",
  classification: "Portfolio",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_IN"],
    url: SITE_URL,
    siteName: "Subham Jain | Cinematic Portfolio",
    title,
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Subham Jain | Lead Frontend Developer & UI Architect",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@shubhamjain55115",
    site: "@shubhamjain55115",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png" },
      { url: "/favicons/apple-touch-icon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/favicons/manifest.webmanifest",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Subham Jain",
        givenName: "Subham",
        familyName: "Jain",
        url: SITE_URL,
        email: "contact@subhamjain.com",
        jobTitle: "Lead Frontend Developer",
        description,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Jaipur",
          addressRegion: "Rajasthan",
          addressCountry: "IN",
        },
        sameAs: [
          "https://github.com/subhamjain55115",
          "https://www.linkedin.com/in/shubhamjain55115/",
        ],
        knowsAbout: [
          "React.js",
          "Redux Toolkit",
          "Next.js",
          "JavaScript (ES6+)",
          "Fintech Architecture",
          "Loan Origination Systems (LOS)",
          "Loan Management Systems (LMS)",
          "Agentic AI",
          "Three.js",
          "Tailwind CSS",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Subham Jain | Cinematic Portfolio",
        description,
        publisher: {
          "@id": `${SITE_URL}/#person`,
        },
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: title,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        mainEntity: {
          "@id": `${SITE_URL}/#person`,
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased bg-[#080808] text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <PortfolioProvider>
          <ThemeProvider>
            <Cursor />
            <WhatsAppButton />
            <ThemeSwitcher variant="floating" />
            {children}
          </ThemeProvider>
        </PortfolioProvider>
      </body>
    </html>
  );
}
