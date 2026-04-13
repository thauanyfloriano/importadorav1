import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Package, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle,
  Hexagon,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'imports', label: 'Imports', icon: Truck, path: '/imports' },
  { id: 'items', label: 'Items', icon: Package, path: '/items' },
  { id: 'budget-prefill', label: 'Orçamentos', icon: FileSpreadsheet, path: '/budget-prefill' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-base text-brand-text">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-brand-base border-r border-[#1e293b]">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 mt-4">
          <div className="bg-brand-accent/20 p-2 rounded-lg mr-3">
            <Hexagon className="w-6 h-6 text-brand-accent fill-brand-accent/50" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">Logistics Monolith</h1>
            <p className="text-[10px] text-brand-text-muted font-medium uppercase tracking-wider">Global Command</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-brand-panel text-white border-l-2 border-brand-accent" 
                  : "text-brand-text-muted hover:bg-brand-panel-hover hover:text-white"
              )}
            >
              <item.icon className="mr-3 w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#1e293b] m-3 rounded-lg bg-brand-panel flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden">
             {/* Mock Avatar */}
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Logistics&backgroundColor=transparent" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Operador Senior</p>
            <p className="text-[10px] text-brand-text-muted truncate">Terminal 04-A</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0e121e]">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 bg-[#0e121e]">
          {/* Search */}
          <div className="flex-1 flex items-center max-w-xl">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-brand-text-muted" />
              </div>
              <input
                type="text"
                placeholder="Search shipments, containers, or SKUs..."
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-[#161c2c] text-brand-text placeholder-brand-text-muted focus:outline-none focus:bg-[#1e293b] focus:border-brand-accent sm:text-sm transition-colors"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="ml-4 flex items-center space-x-4">
            <button className="text-brand-text-muted hover:text-white relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-brand-error ring-2 ring-[#0e121e]" />
              <Bell className="h-5 w-5" />
            </button>
            <button className="text-brand-text-muted hover:text-white">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="pl-4 border-l border-[#1e293b] flex items-center space-x-3">
               <span className="text-xs font-medium text-brand-text-muted uppercase tracking-wider">Command Center</span>
               <div className="w-6 h-6 rounded-full bg-[#1e293b] flex items-center justify-center">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=transparent" alt="Admin" className="w-full h-full object-cover rounded-full" />
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
