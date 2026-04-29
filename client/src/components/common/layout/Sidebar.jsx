import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ title, menu, isOpen, onClose }) {
  const location = useLocation();

    const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});

  const isItemActive = (path) => {
    const [pathname, query] = path.split("?");

    if (query) {
      return location.pathname === pathname && location.search === `?${query}`;
    }

    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (!item.children) return isItemActive(item.path);

    return (
      location.pathname === item.path ||
      item.children.some((child) => isItemActive(child.path))
    );
  };

    const toggleMenu = (item) => {
    setOpenMenus((prev) => {
      const nextOpen = !prev[item.path];

      if (nextOpen && item.children?.[0]?.path) {
        navigate(item.children[0].path);
      }

      return {
        ...prev,
        [item.path]: nextOpen,
      };
    });
  };


  const sidebarContent = (
   <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">Sales workflow panel</p>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-4">
  <div className="flex flex-col gap-1 pb-6">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = isParentActive(item);
          const hasChildren = Boolean(item.children?.length);

          if (hasChildren) {
            return (
              <div key={item.path} className="border-b border-gray-100 pb-1">
                <button
  type="button"
  onClick={() => toggleMenu(item)}
  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold ${
    active
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-50"
  }`}
>
  <span className="flex items-center gap-3">
    {Icon ? <Icon size={18} /> : null}
    {item.label}
  </span>
  <ChevronDown
    size={16}
    className={openMenus[item.path] ? "rotate-180" : ""}
  />
</button>

{openMenus[item.path] && (
  <div className="mt-1 max-h-[260px] overflow-y-auto border-l border-gray-200 pl-3">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={`block px-4 py-2 text-sm ${
                          isItemActive(child.path)
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {Icon ? <Icon size={18} /> : null}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        </div>
      </nav>
    </div>
  );

  return (
    <>
   <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-gray-200 bg-white lg:block">
        {sidebarContent}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="absolute left-0 top-0 h-screen w-[84%] max-w-[320px] bg-white shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}