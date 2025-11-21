import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminBreadcrumb from "../../components/Breadcrumb";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "bi-speedometer2" },
  { to: "/admin/customers", label: "Customers", icon: "bi-people" },
  { to: "/admin/work-orders", label: "Work Orders", icon: "bi-clipboard-check" },
  { to: "/admin/parts", label: "Parts", icon: "bi-boxes" },
  { to: "/admin/technicians", label: "Technicians", icon: "bi-people-fill" },
  { to: "/admin/finance", label: "Finance", icon: "bi-graph-up" },
  { to: "/admin/vehicles", label: "Vehicles", icon: "bi-car-front" },
];

const SEARCH_ENTRIES = [
  ...NAV_ITEMS.map((item) => ({
    to: item.to,
    label: item.label,
    description: `Jump to ${item.label} view`,
    icon: item.icon,
  })),
  {
    to: "/admin/schedule?modal=new",
    label: "Create appointment",
    description: "Open the scheduling dialog",
    icon: "bi-calendar-plus",
  },
  {
    to: "/admin/customers?filter=vip",
    label: "VIP customers",
    description: "Review priority accounts",
    icon: "bi-star",
  },
  {
    to: "/admin/maintenance?view=due",
    label: "Due maintenance",
    description: "Check upcoming maintenance jobs",
    icon: "bi-clipboard-check",
  },
  {
    to: "/admin/parts",
    label: "Inventory status",
    description: "Monitor stock levels",
    icon: "bi-archive",
  },
];

const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "New appointment booked",
    description: "VF8 premium service scheduled for tomorrow 09:00",
    time: "2m ago",
    icon: "bi-calendar-check",
  },
  {
    id: "notif-2",
    title: "Low stock alert",
    description: "Battery module BM-204 is below the safety threshold",
    time: "18m ago",
    icon: "bi-exclamation-octagon",
  },
  {
    id: "notif-3",
    title: "Technician update",
    description: "Team Alpha completed inspection #INV-2318",
    time: "45m ago",
    icon: "bi-tools",
  },
];

const MESSAGES = [
  {
    id: "msg-1",
    sender: "Emma Nguyen",
    excerpt: "Can we confirm the delivery for order SO-473?",
    time: "5m ago",
    icon: "bi-person-circle",
  },
  {
    id: "msg-2",
    sender: "Service Desk",
    excerpt: "Reminder: staff briefing at 16:00 in meeting room",
    time: "32m ago",
    icon: "bi-chat-left-text",
  },
  {
    id: "msg-3",
    sender: "Finance",
    excerpt: "Upload monthly revenue snapshot before Friday",
    time: "1h ago",
    icon: "bi-graph-up",
  },
];

const SEARCH_SUGGESTIONS_ID = "admin-search-suggestions";

const LABEL_MAP = {
  vehicles: "Vehicles",
  customers: "Customers",
  schedule: "Schedule",
  maintenance: "Maintenance",
  parts: "Parts",
  staff: "Staff",
  finance: "Finance",
  settings: "Settings",
};

const highlightMatch = (label, query) => {
  if (!query) return label;
  const lowerLabel = label.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerLabel.indexOf(lowerQuery);
  if (index === -1) return label;
  const before = label.slice(0, index);
  const match = label.slice(index, index + query.length);
  const after = label.slice(index + query.length);
  return (
    <>
      {before}
      <mark>{match}</mark>
      {after}
    </>
  );
};

const sanitizeId = (value) => value.replace(/[^a-z0-9]/gi, "-");

const useBreadcrumbs = (pathname) => {
  const items = [{ label: "Admin", path: "/admin" }];
  if (pathname.startsWith("/admin/")) {
    const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);
    let acc = "/admin";
    for (const seg of segments) {
      acc += "/" + seg;
      items.push({ label: LABEL_MAP[seg] || seg, path: acc });
    }
  }
  return items;
};

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const messageRef = useRef(null);

  const notifications = NOTIFICATIONS;
  const messages = MESSAGES;
  const notificationCount = notifications.length;
  const messageCount = messages.length;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setIsMessageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return SEARCH_ENTRIES.slice(0, 6);
    }
    return SEARCH_ENTRIES.filter((item) => {
      const haystack = `${item.label} ${item.description ?? ""} ${item.to}`.toLowerCase();
      return haystack.includes(query);
    }).slice(0, 8);
  }, [searchQuery]);

  useEffect(() => {
    setActiveSuggestion(0);
  }, [filteredSuggestions.length]);

  const toggleSidebar = () => setSidebarCollapsed((prev) => !prev);
  const breadcrumbItems = useBreadcrumbs(location.pathname);

  const handleSuggestionSelect = (item) => {
    if (!item) return;
    setSearchQuery("");
    setIsSearchOpen(false);
    navigate(item.to);
  };

  const handleSearchKeyDown = (event) => {
    if (!filteredSuggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((prev) =>
        prev === 0 ? filteredSuggestions.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleSuggestionSelect(filteredSuggestions[activeSuggestion]);
    } else if (event.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const handleSearchFocus = () => setIsSearchOpen(true);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setIsSearchOpen(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => {
      const next = !prev;
      if (next) setIsMessageOpen(false);
      return next;
    });
  };

  const toggleMessages = () => {
    setIsMessageOpen((prev) => {
      const next = !prev;
      if (next) setIsNotificationOpen(false);
      return next;
    });
  };

  const activeSuggestionId =
    isSearchOpen && filteredSuggestions[activeSuggestion]
      ? `suggestion-${sanitizeId(filteredSuggestions[activeSuggestion].to)}`
      : undefined;

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`} aria-label="Sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">EV Service</h2>
        </div>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                end={item.to === "/admin"}
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </aside>

      <div className="header">
        <div className="left-controls">
          <button
            className="toggle-sidebar"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            type="button"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>
          <Link to="/admin" className="app-brand" aria-label="Admin home">
            <img src="/logo192.png" alt="Logo" />
          </Link>
          <div className="search-bar" ref={searchContainerRef}>
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="search"
              placeholder="Search modules, pages, or actions..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              aria-label="Quick search"
              aria-expanded={isSearchOpen}
              aria-controls={SEARCH_SUGGESTIONS_ID}
              aria-autocomplete="list"
              aria-activedescendant={activeSuggestionId}
              aria-haspopup="listbox"
              role="combobox"
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm btn-link"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <i className="bi bi-x-circle" aria-hidden="true"></i>
              </button>
            )}
            {isSearchOpen && filteredSuggestions.length > 0 && (
              <ul
                id={SEARCH_SUGGESTIONS_ID}
                className="search-suggestions"
                role="listbox"
              >
                {filteredSuggestions.map((item, index) => (
                  <li
                    key={item.to}
                    id={`suggestion-${sanitizeId(item.to)}`}
                    role="option"
                    className={`search-suggestion ${index === activeSuggestion ? "active" : ""}`}
                    aria-selected={index === activeSuggestion}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionSelect(item);
                    }}
                    onMouseEnter={() => setActiveSuggestion(index)}
                  >
                    <i className={`bi ${item.icon || "bi-search"}`} aria-hidden="true"></i>
                    <div className="search-suggestion__content">
                      <span className="search-suggestion__label">
                        {highlightMatch(item.label, searchQuery)}
                      </span>
                      <span className="search-suggestion__path">{item.to}</span>
                    </div>
                    <span className="search-suggestion__hint">Enter</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="header-center">
          <AdminBreadcrumb items={breadcrumbItems} />
        </div>
        <div className="user-profile">
          <div className="header-quick-actions" role="toolbar" aria-label="Quick actions">
            <div
              className={`header-quick-action ${isNotificationOpen ? "is-open" : ""}`}
              ref={notificationRef}
            >
              <button
                type="button"
                className={`header-quick-action-btn ${isNotificationOpen ? "active" : ""}`}
                aria-label={
                  notificationCount > 0
                    ? `View ${notificationCount} notifications`
                    : "View notifications"
                }
                title={
                  notificationCount > 0
                    ? `${notificationCount} unread`
                    : "No new notifications"
                }
                aria-haspopup="dialog"
                aria-expanded={isNotificationOpen}
                aria-controls="header-notifications-panel"
                onClick={toggleNotifications}
              >
                <i className="bi bi-bell" aria-hidden="true"></i>
                {notificationCount > 0 && (
                  <span className="header-quick-action-badge" aria-hidden="true">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div
                  className="header-popover"
                  id="header-notifications-panel"
                  role="dialog"
                >
                  <div className="header-popover__header">
                    <span>Notifications</span>
                    {notificationCount > 0 && (
                      <span className="header-popover__badge">
                        {`${notificationCount} new`}
                      </span>
                    )}
                  </div>
                  {notificationCount > 0 ? (
                    <ul className="header-popover__list">
                      {notifications.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">{item.title}</span>
                            <span className="header-popover__item-desc">{item.description}</span>
                            <time className="header-popover__item-meta">{item.time}</time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">All clear for now</div>
                  )}
                </div>
              )}
            </div>
            <div
              className={`header-quick-action ${isMessageOpen ? "is-open" : ""}`}
              ref={messageRef}
            >
              <button
                type="button"
                className={`header-quick-action-btn ${isMessageOpen ? "active" : ""}`}
                aria-label={
                  messageCount > 0
                    ? `View ${messageCount} messages`
                    : "View messages"
                }
                title={
                  messageCount > 0
                    ? `${messageCount} unread`
                    : "No new messages"
                }
                aria-haspopup="dialog"
                aria-expanded={isMessageOpen}
                aria-controls="header-messages-panel"
                onClick={toggleMessages}
              >
                <i className="bi bi-chat-dots" aria-hidden="true"></i>
                {messageCount > 0 && (
                  <span className="header-quick-action-badge" aria-hidden="true">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
              </button>
              {isMessageOpen && (
                <div
                  className="header-popover"
                  id="header-messages-panel"
                  role="dialog"
                >
                  <div className="header-popover__header">
                    <span>Messages</span>
                    {messageCount > 0 && (
                      <span className="header-popover__badge">
                        {`${messageCount} unread`}
                      </span>
                    )}
                  </div>
                  {messageCount > 0 ? (
                    <ul className="header-popover__list">
                      {messages.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">{item.sender}</span>
                            <span className="header-popover__item-desc">{item.excerpt}</span>
                            <time className="header-popover__item-meta">{item.time}</time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">Inbox is up to date</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            type="button"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`} aria-hidden="true"></i>
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
          <button type="button" className="user-account" aria-label="Open user menu">
            <span className="user-account__avatar" aria-hidden="true">
              <img src="https://via.placeholder.com/40" alt="" />
            </span>
            <span className="user-account__details">
              <i className="bi bi-person-circle" aria-hidden="true"></i>
              <span className="user-account__name">Admin</span>
            </span>
            <i className="bi bi-chevron-down" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className={`content-wrapper ${sidebarCollapsed ? "full-width" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
