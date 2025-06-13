import React from "react";
import SideBar from "./SideBar";
import { Outlet } from "react-router-dom";

const MainSidebar = () => {
  return (
    <>
      <div className="flex">
        <div>
          <SideBar />
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default MainSidebar;
