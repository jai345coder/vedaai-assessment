"use client";

import { useState } from "react";

interface SidebarProps {
  activeNav?: string;
  onNavClick?: (item: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeNav = "Exams",
  onNavClick,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navItems = [
    {
      id: "Home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: "My Classroom",
      label: "My Classroom",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "Assignments",
      label: "Assignments",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: "Exams",
      label: "Exams",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      id: "My Library",
      label: "My Library",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      className={`bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } flex-shrink-0`}
    >
      {/* TOP SECTION */}
      <div className="flex flex-col space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0">
              <span className="tracking-tighter">V</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                VedaAI
              </span>
            )}
          </div>

          {/* Collapse / Expand Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* AI Teacher's Toolkit Pill Button */}
        {!isCollapsed ? (
          <button
            type="button"
            className="w-full bg-[#1E1F24] hover:bg-black text-white py-3 px-4 rounded-full text-xs font-semibold flex items-center justify-center gap-2 border-2 border-[#F25C3B] shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span className="text-orange-400">✦</span>
            <span>AI Teacher&apos;s Toolkit</span>
          </button>
        ) : (
          <button
            type="button"
            title="AI Teacher's Toolkit"
            className="w-10 h-10 mx-auto bg-[#1E1F24] text-orange-400 rounded-full flex items-center justify-center border-2 border-[#F25C3B] shadow-sm hover:bg-black transition cursor-pointer"
          >
            ✦
          </button>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavClick && onNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-gray-100/90 text-gray-900 font-semibold shadow-2xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                } ${isCollapsed ? "justify-center px-2" : ""}`}
              >
                <div className={isActive ? "text-gray-900" : "text-gray-400"}>
                  {item.icon}
                </div>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM SECTION: School Info Card */}
      {!isCollapsed ? (
        <div className="bg-gray-50/90 border border-gray-100 rounded-2xl p-3 flex items-center gap-3 shadow-2xs mt-6">
          {/* School Crest / Emblem Badge */}
          <div className="w-9 h-9 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              Delhi Public School
            </p>
            <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
              Bokaro Steel City
            </p>
          </div>
        </div>
      ) : (
        <div className="w-10 h-10 mx-auto rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-emerald-600 shadow-2xs" title="Delhi Public School - Bokaro Steel City">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      )}
    </aside>
  );
}
