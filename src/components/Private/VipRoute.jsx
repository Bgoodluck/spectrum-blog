import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";



function VipRoute() {


  const { currentUser } = useSelector((state) => state.user);

  return currentUser?.rest?.isAdmin || currentUser?.rest?.isVip ? <Outlet /> : <Navigate to="/sign-in" />;
}

export default VipRoute;
