'use client'

import React from 'react'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#15151b] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
          !
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          An unexpected error occurred while rendering the application.
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
