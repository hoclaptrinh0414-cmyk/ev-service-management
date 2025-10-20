      {/* Header */}
      <div className={header }>
        <div className="left-controls">
          <button
            className="toggle-sidebar"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            |||
          </button>
          <Link to="/admin" className="app-brand" aria-label="CRM Management home">
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
              id={SEARCH_SUGGESTIONS_ID}
            />
            {isSearchOpen && suggestions.length > 0 && (
              <ul id={SEARCH_SUGGESTIONS_ID} className="search-suggestions" role="listbox">
                {suggestions.map((item, index) => (
                  <li
                    key={item.path}
                    role="option"
                    className={search-suggestion }
                    aria-selected={index === activeSuggestion}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleSuggestionSelect(item);
                    }}
                  >
                    <i className={i } aria-hidden="true"></i>
                    <div className="search-suggestion__content">
                      <span className="search-suggestion__label">{highlightLabel(item.label)}</span>
                      <span className="search-suggestion__path">{item.path}</span>
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
            <div className={header-quick-action } ref={notificationRef}>
              <button
                type="button"
                className={header-quick-action-btn }
                aria-label={ notificationCount > 0 ? Co  thong bao moi : "Xem thong bao" }
                title={ notificationCount > 0 ? ${notificationCount} thong bao chua doc : "Khong co thong bao moi" }
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
                  <span className="header-quick-action-badge" aria-hidden="true">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="header-popover" id="header-notifications-panel" role="dialog">
                  <div className="header-popover__header">
                    <span>Thong bao</span>
                    {notificationCount > 0 && (
                      <span className="header-popover__badge">{notificationCount} moi</span>
                    )}
                  </div>
                  {notificationCount > 0 ? (
                    <ul className="header-popover__list">
                      {notifications.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i className={i } aria-hidden="true"></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">{item.title}</span>
                            <span className="header-popover__item-desc">{item.description}</span>
                            <time className="header-popover__item-meta">{item.time}</time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">Khong co thong bao moi</div>
                  )}
                </div>
              )}
            </div>
            <div className={header-quick-action } ref={messageRef}>
              <button
                type="button"
                className={header-quick-action-btn }
                aria-label={ messageCount > 0 ? Co  tin nhan moi : "Xem tin nhan" }
                title={ messageCount > 0 ? ${messageCount} tin nhan chua doc : "Khong co tin nhan moi" }
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
                  <span className="header-quick-action-badge" aria-hidden="true">
                    {messageCount > 99 ? "99+" : messageCount}
                  </span>
                )}
              </button>
              {isMessageOpen && (
                <div className="header-popover" id="header-messages-panel" role="dialog">
                  <div className="header-popover__header">
                    <span>Tin nhan</span>
                    {messageCount > 0 && (<span className="header-popover__badge">{messageCount} chua doc</span>)}
                  </div>
                  {messageCount > 0 ? (
                    <ul className="header-popover__list">
                      {messages.map((item) => (
                        <li key={item.id} className="header-popover__item">
                          <i className={i } aria-hidden="true"></i>
                          <div className="header-popover__item-body">
                            <span className="header-popover__item-title">{item.sender}</span>
                            <span className="header-popover__item-desc">{item.excerpt}</span>
                            <time className="header-popover__item-meta">{item.time}</time>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="header-popover__empty">Khong co tin nhan moi</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            type="button"
            aria-label={ theme === "dark" ? "Chuyen sang giao dien sang" : "Chuyen sang giao dien toi" }
          >
            <i className={i } aria-hidden="true"></i>
            <span>{theme === "dark" ? "Sang" : "Toi"}</span>
          </button>
          <button type="button" className="user-account" aria-label="Mo menu tai khoan Admin">
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
      </div>{/* Main Content */}
      <div
        className={`content-wrapper ${sidebarCollapsed ? "full-width" : ""}`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;





