import { useState, useEffect } from "react";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

const MainSidebar = () => {
  const [isMobile, setIsMobile] = useState(false);

  // التحقق من حجم الشاشة للتكيف مع الأجهزة المختلفة
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* القائمة الجانبية */}
      <SideBar />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 md:p-6 h-[100vh] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainSidebar;

