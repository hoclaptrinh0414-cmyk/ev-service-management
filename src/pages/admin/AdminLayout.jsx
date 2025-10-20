import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import AdminBreadcrumb from "../../components/Breadcrumb";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin", icon: "bi-speedometer2" },
  { label: "Customer Management", path: "/admin/customers", icon: "bi-people" },
  {
    label: "Vehicle Management",
    path: "/admin/vehicles",
    icon: "bi-car-front",
  },
  {
    label: "Service Schedule",
    path: "/admin/schedule",
    icon: "bi-calendar-check",
  },
  {
    label: "Maintenance Progress",
    path: "/admin/maintenance",
    icon: "bi-tools",
  },
  { label: "Parts Inventory", 
    path: "/admin/parts", 
    icon: "bi-box-seam" },
  { label: "Staff Management", path: "/admin/staff", icon: "bi-person-badge" },
  {
    label: "Financial Report",
    path: "/admin/finance",
    icon: "bi-graph-up-arrow",
  },
  { label: "Settings", path: "/admin/settings", icon: "bi-gear" },
];

const SEARCH_SUGGESTIONS_ID = "admin-search-suggestions";

const AdminLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const notificationRef = useRef(null);
  const messageRef = useRef(null);

  const notifications = useMemo(
    () => [
      {
        id: 1,
        title: "LÃ¡Â»â€¹ch hÃ¡ÂºÂ¹n mÃ¡Â»â€ºi",
        description: "NguyÃ¡Â»â€¦n An vÃ¡Â»Â«a Ã„â€˜Ã¡ÂºÂ·t lÃ¡Â»â€¹ch bÃ¡ÂºÂ£o dÃ†Â°Ã¡Â»Â¡ng Tesla Model 3.",
        time: "3 phÃƒÂºt trÃ†Â°Ã¡Â»â€ºc",
        icon: "bi-calendar-event",
      },
      {
        id: 2,
        title: "Xe hoÃƒÂ n tÃ¡ÂºÂ¥t",
        description: "Volkswagen ID.4 Ã„â€˜ÃƒÂ£ hoÃƒÂ n thÃƒÂ nh quy trÃƒÂ¬nh kiÃ¡Â»Æ’m tra.",
        time: "1 giÃ¡Â»Â trÃ†Â°Ã¡Â»â€ºc",
        icon: "bi-check-circle",
      },
      {
        id: 3,
        title: "Kho linh kiÃ¡Â»â€¡n thÃ¡ÂºÂ¥p",
        description: "MÃƒÂ´-Ã„â€˜un pin Panasonic trong kho cÃƒÂ²n dÃ†Â°Ã¡Â»â€ºi 5 Ã„â€˜Ã†Â¡n vÃ¡Â»â€¹.",
        time: "2 giÃ¡Â»Â trÃ†Â°Ã¡Â»â€ºc",
        icon: "bi-exclamation-triangle",
      },
    ],
    []
  );

  const messages = useMemo(
    () => [
      {
        id: 1,
        sender: "LÃƒÂª Minh",
        excerpt: "NhÃ¡Â»Â anh xÃƒÂ¡c nhÃ¡ÂºÂ­n lÃ¡Â»â€¹ch bÃ¡ÂºÂ£o dÃ†Â°Ã¡Â»Â¡ng lÃ¡ÂºÂ¡i giÃƒÂºp em nhÃƒÂ©?",
        time: "5 phÃƒÂºt trÃ†Â°Ã¡Â»â€ºc",
        icon: "bi-chat-left-text",
      },
      {
        id: 2,
        sender: "TrÃ¡ÂºÂ¡m HÃƒÂ  NÃ¡Â»â„¢i",
        excerpt: "Ã„ÂÃƒÂ£ cÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t bÃ¡ÂºÂ£ng giÃƒÂ¡ phÃ¡Â»Â¥ tÃƒÂ¹ng tuÃ¡ÂºÂ§n nÃƒÂ y.",
        time: "30 phÃƒÂºt trÃ†Â°Ã¡Â»â€ºc",
        icon: "bi-building",
      },
    ],
    []
  );

  const notificationCount = notifications.length;
  const messageCount = messages.length;

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  // Auto-collapse sidebar on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }

      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setIsMessageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setActiveSuggestion(0);
    setIsNotificationOpen(false);
    setIsMessageOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setActiveSuggestion(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsNotificationOpen(false);
        setIsMessageOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path) => {
    if (!path) return "";
    const currentPath = location.pathname;
    // Dashboard should be active only on exact '/admin'
    if (path === "/admin") {
      return currentPath === "/admin" ? "active" : "";
    }
    // Other items active on exact match or nested routes
    return currentPath === path || currentPath.startsWith(`${path}/`) ? "active" : "";
  };

  const suggestions = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return [];
    return NAV_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(term) ||
        item.path.toLowerCase().includes(term)
    ).slice(0, 7);
  }, [searchQuery]);

  const currentPageTitle = useMemo(() => {
    const matchedNav = NAV_ITEMS.find((item) => {
      if (item.path === "/admin") {
        return location.pathname === item.path;
      }
      return (
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`)
      );
    });

    if (matchedNav) {
      return matchedNav.label;
    }

    const segments = location.pathname.split("/").filter(Boolean).slice(-1);

    if (!segments.length) return "Dashboard";

    const formatted = segments[0]
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return formatted;
  }, [location.pathname]);

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: "Admin", path: "/admin" }];

    if (currentPageTitle && currentPageTitle !== "Dashboard") {
      items.push({ label: currentPageTitle, path: location.pathname });
    }

    return items;
  }, [currentPageTitle, location.pathname]);

  const handleSuggestionSelect = (item) => {
    if (!item) return;
    navigate(item.path);
    setSearchQuery("");
    setIsSearchOpen(false);
    setActiveSuggestion(0);
    if (window.innerWidth < 992) {
      setSidebarCollapsed(true);
    }
  };

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchQuery(value);
    setIsSearchOpen(Boolean(value.trim()));
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (!suggestions.length) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target =
        suggestions[Math.min(activeSuggestion, suggestions.length - 1)];
      handleSuggestionSelect(target);
    } else if (event.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  const highlightLabel = (label) => {
    const term = searchQuery.trim();
    if (!term) return label;

    const lowerLabel = label.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const matchIndex = lowerLabel.indexOf(lowerTerm);

    if (matchIndex === -1) return label;

    return (
      <>
        {label.slice(0, matchIndex)}
        <mark>{label.slice(matchIndex, matchIndex + term.length)}</mark>
        {label.slice(matchIndex + term.length)}
      </>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <h2>EV Service Admin</h2>
        </div>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className={isActive(item.path)}>
                <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay for small screens */}
      <div
        className={`sidebar-overlay ${sidebarCollapsed ? "" : "active"}`}
        onClick={() => setSidebarCollapsed(true)}
        aria-hidden="true"
      />

      {/* Header */}
      <div className={`header ${sidebarCollapsed ? "full-width" : ""}`}>
        <div className="left-controls">
          <button
            className="toggle-sidebar"
            onClick={toggleSidebar}
              aria-label="Tim kiem nhanh"
          >
            Ã¢ËœÂ°
          </button>
          <Link
            to="/admin"
            className="app-brand"
              aria-label="Tim kiem nhanh"
          >
            <img src="/logo192.png" alt="CRM Management logo" />
          </Link>
          <div className="search-bar" ref={searchContainerRef}>
            <Input
              placeholder="Tim kiem khach hang, bao cao, hoac cai dat..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
              aria-label="Tim kiem nhanh"
              aria-expanded={isSearchOpen}
              aria-haspopup="listbox"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={SEARCH_SUGGESTIONS_ID}
            />
            {isSearchOpen && suggestions.length > 0 && (
              <ul
                id={SEARCH_SUGGESTIONS_ID}
                className="search-suggestions"
                role="listbox"
              >
                {suggestions.map((item, index) => (
                  <li
                    key={item.path}
                    role="option"
                    className={`search-suggestion ${
                      index === activeSuggestion ? "active" : ""
                    }`}
                    aria-selected={index === activeSuggestion}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionSelect(item);
                    }}
                  >
                    <i className={`bi ${item.icon}`} aria-hidden="true"></i>
                    <div className="search-suggestion__content">
                      <span className="search-suggestion__label">
                        {highlightLabel(item.label)}
                      </span>
                      <span className="search-suggestion__path">
                        {item.path}
                      </span>
                    </div>
                    <span className="search-suggestion__hint">Enter Ã¢â€ Âµ</span>
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
          <div
            className="header-quick-actions"
            role="toolbar"
              aria-label="Tim kiem nhanh"
          >
            <div
              className={`header-quick-action ${
                isNotificationOpen ? "is-open" : ""
              }`}
              ref={notificationRef}
            >
              <button
                type="button"
                className={`header-quick-action-btn ${
                  isNotificationOpen ? "active" : ""
                }`}
              aria-label="Tim kiem nhanh"
                  notificationCount > 0
                    ? `CÃƒÂ³ ${notificationCount} thÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi`
                    : "Xem thÃƒÂ´ng bÃƒÂ¡o"
                }
                title={
                  notificationCount > 0
                    ? `${notificationCount} thÃƒÂ´ng bÃƒÂ¡o chÃ†Â°a Ã„â€˜Ã¡Â»Âc`
                    : "KhÃƒÂ´ng cÃƒÂ³ thÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi"
                }
                aria-haspopup="dialog"
                aria-expanded={isNotificationOpen}
                aria-controls="header-notifications-panel"
                onClick={() => {
                  setIsNotificationOpen((prev) => {
                    const next = !prev;
                    if (!prev) setIsMessageOpen(false);
                    return next;
                  });
                }}
              >
                <i className="bi bi-bell" aria-hidden="true"></i>
                {notificationCount > 0 && (
                  <span
                    className="header-quick-action-badge"
                    aria-hidden="true"
                  >
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div
                  className="header-popover"
                  id="header-notifications-panel"
                  role="dialog"
              aria-label="Tim kiem nhanh"
                >
                  <div className="header-popover__header">
                    <span>ThÃƒÂ´ng bÃƒÂ¡o</span>
                    {notificationCount > 0 && (
                      <span className="header-popover__badge">
                        {notificationCount} mÃ¡Â»â€ºi
                      </span>
                    )}
                  </div>
                  {notificationCount > 0 ? (
                    <ul className="header-popover__list">
                      {notifications.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i
                            className={`bi ${item.icon}`}
                            aria-hidden="true"
                          ></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">
                              {item.title}
                            </span>
                            <span className="header-popover__item-desc">
                              {item.description}
                            </span>
                            <time className="header-popover__item-meta">
                              {item.time}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">
                      KhÃƒÂ´ng cÃƒÂ³ thÃƒÂ´ng bÃƒÂ¡o mÃ¡Â»â€ºi
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              className={`header-quick-action ${
                isMessageOpen ? "is-open" : ""
              }`}
              ref={messageRef}
            >
              <button
                type="button"
                className={`header-quick-action-btn ${
                  isMessageOpen ? "active" : ""
                }`}
              aria-label="Tim kiem nhanh"
                  messageCount > 0
                    ? `CÃƒÂ³ ${messageCount} tin nhÃ¡ÂºÂ¯n mÃ¡Â»â€ºi`
                    : "Xem tin nhÃ¡ÂºÂ¯n"
                }
                title={
                  messageCount > 0
                    ? `${messageCount} tin nhÃ¡ÂºÂ¯n chÃ†Â°a Ã„â€˜Ã¡Â»Âc`
                    : "KhÃƒÂ´ng cÃƒÂ³ tin nhÃ¡ÂºÂ¯n mÃ¡Â»â€ºi"
                }
                aria-haspopup="dialog"
                aria-expanded={isMessageOpen}
                aria-controls="header-messages-panel"
                onClick={() => {
                  setIsMessageOpen((prev) => {
                    const next = !prev;
                    if (!prev) setIsNotificationOpen(false);
                    return next;
                  });
                }}
              >
                <i className="bi bi-chat-dots" aria-hidden="true"></i>
                {messageCount > 0 && (
                  <span
                    className="header-quick-action-badge"
                    aria-hidden="true"
                  >
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
              </button>
              {isMessageOpen && (
                <div
                  className="header-popover"
                  id="header-messages-panel"
                  role="dialog"
              aria-label="Tim kiem nhanh"
                >
                  <div className="header-popover__header">
                    <span>Tin nhÃ¡ÂºÂ¯n</span>
                    {messageCount > 0 && (
                      <span className="header-popover__badge">
                        {messageCount} chÃ†Â°a Ã„â€˜Ã¡Â»Âc
                      </span>
                    )}
                  </div>
                  {messageCount > 0 ? (
                    <ul className="header-popover__list">
                      {messages.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i
                            className={`bi ${item.icon}`}
                            aria-hidden="true"
                          ></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">
                              {item.sender}
                            </span>
                            <span className="header-popover__item-desc">
                              {item.excerpt}
                            </span>
                            <time className="header-popover__item-meta">
                              {item.time}
                            </time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">
                      KhÃƒÂ´ng cÃƒÂ³ tin nhÃ¡ÂºÂ¯n mÃ¡Â»â€ºi
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            type="button"
              aria-label="Tim kiem nhanh"
              theme === "dark"
                ? "ChuyÃ¡Â»Æ’n sang giao diÃ¡Â»â€¡n sÃƒÂ¡ng"
                : "ChuyÃ¡Â»Æ’n sang giao diÃ¡Â»â€¡n tÃ¡Â»â€˜i"
            }
          >
            <i
              className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"}`}
              aria-hidden="true"
            ></i>
            <span>{theme === "dark" ? "SÃƒÂ¡ng" : "TÃ¡Â»â€˜i"}</span>
          </button>
          <button
            type="button"
            className="user-account"
              aria-label="Tim kiem nhanh"
          >
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

      {/* Main Content */}
      <div
        className={`content-wrapper ${sidebarCollapsed ? "full-width" : ""}`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;





