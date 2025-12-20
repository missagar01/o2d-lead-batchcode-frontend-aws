import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  ChevronDownIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  ArrowRightIcon,
  BoxIcon,
  DollarLineIcon,
  ShootingStarIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import SidebarWidget from "./SidebarWidget";
import logo from "../assert/Logo.jpeg";
import { LogOut } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// O2D items - only shown to admin users, in the order shown in the image
const o2dItems: NavItem[] = [
  {
    icon: <ListIcon />,
    name: "Orders",
    path: "/o2d/orders",
  },
  {
    icon: <ArrowRightIcon />,
    name: "Gate Entry",
    path: "/o2d/gate-entry",
  },
  {
    icon: <BoxIcon />,
    name: "First Weight",
    path: "/o2d/first-weight",
  },
  {
    icon: <BoxCubeIcon />,
    name: "Load Vehicle",
    path: "/o2d/load-vehicle",
  },
  {
    icon: <BoxIcon />,
    name: "Second Weight",
    path: "/o2d/second-weight",
  },
  {
    icon: <DollarLineIcon />,
    name: "Generate Invoice",
    path: "/o2d/generate-invoice",
  },
  {
    icon: <ArrowRightIcon />,
    name: "Gate Out Entry",
    path: "/o2d/gate-out",
  },
  {
    icon: <DollarLineIcon />,
    name: "Payment",
    path: "/o2d/payment",
  },
  // {
  //   icon: <ChatIcon />,
  //   name: "Complaint Details",
  //   path: "/o2d/complaint-details",
  // },
  {
    icon: <ShootingStarIcon />,
    name: "Party Feedback",
    path: "/o2d/party-feedback",
  },
  // {
  //   icon: <LockIcon />,
  //   name: "Permissions",
  //   path: "/o2d/permissions",
  // },
];

// Dashboard item (always shown at top)
const dashboardItem: NavItem = {
  icon: <PieChartIcon />,
  name: "Dashboard",
  path: "/",
};

// BatchCode with submenu
const batchCodeItem: NavItem = {
  icon: <BoxCubeIcon />,
  name: "BatchCode",
  path: "/batchcode/dashboard",
  subItems: [
    { name: "Dashboard", path: "/batchcode/dashboard", pro: false },
    { name: "Hot Coil", path: "/batchcode/hot-coil", pro: false },
    { name: "QC Lab", path: "/batchcode/qc-lab", pro: false },
    { name: "SMS Register", path: "/batchcode/sms-register", pro: false },
    { name: "Recoiler", path: "/batchcode/recoiler", pro: false },
    { name: "Pipe Mill", path: "/batchcode/pipe-mill", pro: false },
    { name: "Laddel", path: "/batchcode/laddel", pro: false },
    { name: "Tundis", path: "/batchcode/tundis", pro: false },
  ],
};

// Lead-to-Order with submenu
const leadToOrderItem: NavItem = {
  icon: <ListIcon />,
  name: "Lead to Order",
  subItems: [
    { name: "Dashboard", path: "/lead-to-order/dashboard", pro: false },
    { name: "Leads", path: "/lead-to-order/leads", pro: false },
    { name: "Follow Up", path: "/lead-to-order/follow-up", pro: false },
    { name: "Call Tracker", path: "/lead-to-order/call-tracker", pro: false },
    { name: "Quotation", path: "/lead-to-order/quotation", pro: false },
  ],
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // Check if user is admin (only explicit admin roles)
  const role = (user?.role || user?.userType || "").toLowerCase();
  const isAdmin = role === "admin" || role === "superadmin";
  
  // Combine items in order: Dashboard, O2D (admin only), BatchCode, Lead to Order
  const navItems: NavItem[] = useMemo(() => {
    if (isAdmin) {
      return [dashboardItem, ...o2dItems, batchCodeItem, leadToOrderItem];
    }

    return [batchCodeItem, leadToOrderItem];
  }, [isAdmin]);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        // Check if main path is active (for items with both path and subItems)
        if (nav.path && isActive(nav.path)) {
          setOpenSubmenu({
            type: "main",
            index,
          });
          submenuMatched = true;
        }
        // Check if any subItem path is active
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({
              type: "main",
              index,
            });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === "main" &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: "main", index };
    });
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <div className="flex items-center">
              {nav.path ? (
                <Link
                  to={nav.path}
                  className={`menu-item group flex-1 ${
                    isActive(nav.path) || 
                    (openSubmenu?.type === "main" && openSubmenu?.index === index)
                      ? "bg-blue-600 text-white"
                      : "text-white hover:bg-blue-600"
                  } ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size text-white ${
                      isActive(nav.path) || 
                      (openSubmenu?.type === "main" && openSubmenu?.index === index)
                        ? "text-white"
                        : "text-white/90"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => handleSubmenuToggle(index)}
                  className={`menu-item group flex-1 ${
                    openSubmenu?.type === "main" && openSubmenu?.index === index
                      ? "bg-blue-600 text-white"
                      : "text-white hover:bg-blue-600"
                  } cursor-pointer ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size text-white ${
                      openSubmenu?.type === "main" && openSubmenu?.index === index
                        ? "text-white"
                        : "text-white/90"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text text-white">{nav.name}</span>
                  )}
                </button>
              )}
              {(isExpanded || isHovered || isMobileOpen) && nav.subItems && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmenuToggle(index);
                  }}
                  className="ml-2 p-1 hover:bg-blue-600 dark:hover:bg-blue-700 rounded transition-colors text-white"
                  aria-label="Toggle submenu"
                >
                  <ChevronDownIcon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === "main" &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-white"
                        : "text-white/70"
                    }`}
                  />
                </button>
              )}
            </div>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "bg-red-700 text-white" : "text-white hover:bg-red-700"
                }`}
              >
                <span
                  className={`menu-item-icon-size text-white ${
                    isActive(nav.path)
                      ? "text-white"
                      : "text-white/90"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text text-white">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === "main" && openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "bg-red-700 text-white"
                          : "text-white/90 hover:bg-red-700 hover:text-white"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const menuSectionPadding =
    isExpanded || isHovered || isMobileOpen ? "p-4" : "px-3 py-3";
  const menuContainerClasses = `rounded-2xl border border-white/20 bg-blue-500/30 transition-colors duration-300 ${menuSectionPadding}`;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-blue-700 dark:bg-blue-800 dark:border-blue-800 text-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-blue-700 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          <img
            src={logo}
            alt="SAGAR TMT & PIPES Logo"
            className="object-contain"
            style={{
              width: isExpanded || isHovered || isMobileOpen ? '150px' : '40px',
              height: isExpanded || isHovered || isMobileOpen ? 'auto' : '40px',
            }}
          />
        </Link>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className={menuContainerClasses}>
            <div className="flex flex-col gap-4">
              <div>
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-white/80 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Menu"
                  ) : (
                    <HorizontaLDots className="size-6" />
                  )}
                </h2>
                {renderMenuItems(navItems)}
              </div>
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
      
      {/* Logout Button */}
      <div className="mt-auto pb-4 pt-4 border-t border-blue-600 dark:border-blue-700">
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
            isExpanded || isHovered || isMobileOpen
              ? "justify-start text-white hover:bg-blue-600 dark:hover:bg-blue-700"
              : "justify-center text-white hover:bg-blue-600 dark:hover:bg-blue-700"
          }`}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <span>Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
};



export default AppSidebar;
