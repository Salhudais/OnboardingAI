import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from "./ui/button"
import { BarChart, Calendar, Phone, Settings, User, ChevronLeft, ChevronRight, Megaphone, Users } from "lucide-react"
import Logo from "./Logo";

export default function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white p-6 shadow-md transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex items-center mb-8" style={{marginLeft:10}}>
          {!sidebarCollapsed && <Logo/>}
        </div>
        <nav>
          <Link to="/dashboard" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <BarChart className="h-4 w-4 mr-2"/> {!sidebarCollapsed && 'Dashboard'}
          </Link>
          <Link to="/contacts" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <User className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Contacts'}
          </Link>
          <Link to="/schedule" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Calendar className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Schedule'}
          </Link>
          <Link to="/campaigns" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Phone className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Campaigns'}
          </Link>
          <Link to="/employees" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Users className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Employees'}
          </Link>
          <Link to="/settings" className={`no-underline flex items-center w-full mb-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 no-underline ${sidebarCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2'}`}>
            <Settings className="h-4 w-4 mr-2" /> {!sidebarCollapsed && 'Settings'}
          </Link>
        </nav>
        <Button
          variant="ghost"
          className="absolute bottom-4 left-4"
          onClick={toggleSidebar}
        >
          {sidebarCollapsed ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
