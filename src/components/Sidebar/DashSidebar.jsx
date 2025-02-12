import React, { useEffect, useState } from "react";
import { Sidebar } from "flowbite-react";
import {
  HiArrowSmRight,
  HiDocumentText,
  HiOutlineUserGroup,
  HiUser,
  HiAnnotation,
  HiOutlineDocumentText,
  HiChartPie
} from "react-icons/hi";
import { FaBullhorn, FaRegNewspaper } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import summaryApi from "../../common";
import { persistor, store } from "../../redux/store";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";

function DashSidebar() {
  const location = useLocation();
  const [tab, setTab] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());

      const response = await fetch(summaryApi.loggingOff.url, {
        method: summaryApi.loggingOff.method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.success) {
        const auth = getAuth(app);
        await auth.signOut();

        dispatch(signOutSuccess());
        localStorage.clear();
        await persistor.purge();

        store.dispatch({ type: "RESET_STORE" });

        navigate("/sign-in");
      } else {
        throw new Error(data.message || "Failed to sign out");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      dispatch(signOutFailure(error.message));
    }
  };

  return (
    <Sidebar className="w-full md:w-56">
      <Sidebar.Items>
        <Sidebar.ItemGroup className="flex flex-col gap-1">
            {
               currentUser.rest && currentUser.rest.isAdmin && (
                <Link to="/dashboard?tab=admin-panel">
                  <Sidebar.Item
                    active={tab === "admin-panel" || !tab}
                    icon={HiChartPie}
                    labelColor="dark"
                    as="div"
                  >
                    Admin Panel
                  </Sidebar.Item>
                </Link>
               )
            }
          <Link to="/dashboard?tab=profile">
            <Sidebar.Item
              active={tab === "profile"}
              icon={HiUser}
              label={currentUser.rest.isAdmin ? "Admin" : "User"}
              labelColor="dark"
              as="div"
            >
              Profile
            </Sidebar.Item>
          </Link>
          <Link to="/dashboard?tab=advert-page">
            <Sidebar.Item
              active={tab === "adverts"}
              icon={FaRegNewspaper}
              labelColor="dark"
              as="div"
            >
              Adverts
            </Sidebar.Item>
          </Link>
          {(currentUser?.rest?.isAdmin || currentUser?.rest?.isVip) && (
            <Link to="/dashboard?tab=update-advert">
              <Sidebar.Item
                active={tab === "update-advert"}
                icon={FaBullhorn}
                as="div"
              >
                Update Advert
              </Sidebar.Item>
            </Link>
          )}
          { currentUser?.rest?.isVip && (
            <Link to="/dashboard?tab=skit-creators">
              <Sidebar.Item
                active={tab === "skit-creators"}
                icon={FaBullhorn}
                as="div"
              >
                Create Skits
              </Sidebar.Item>
            </Link>
          )}
          {currentUser.rest && currentUser.rest.isAdmin && (
            <Link to="/dashboard?tab=star-advert">
              <Sidebar.Item
                active={tab === "star-advert"}
                icon={FaBullhorn}
                as="div"
              >
                Star Adverts
              </Sidebar.Item>
            </Link>
          )}
          {currentUser?.rest?.isAdmin && (
            <Link to="/dashboard?tab=posts">
              <Sidebar.Item
                active={tab === "posts"}
                icon={HiOutlineDocumentText}
                as="div"
              >
                Posts
              </Sidebar.Item>
            </Link>
          )}
          {currentUser?.rest?.isAdmin && (
            <Link to="/dashboard?tab=crud">
              <Sidebar.Item
                active={tab === "crud"}
                icon={HiAnnotation}
                as="div"
              >
                Comments
              </Sidebar.Item>
            </Link>
          )}
          {currentUser?.rest?.isAdmin && (
            <Link to="/dashboard?tab=skit-admin">
              <Sidebar.Item
                active={tab === "skit-admin"}
                icon={HiOutlineUserGroup}
                as="div"
              >
                Skit Upload
              </Sidebar.Item>
            </Link>
          )}
          {currentUser?.rest?.isAdmin && (
            <Link to="/dashboard?tab=users">
              <Sidebar.Item
                active={tab === "users"}
                icon={HiOutlineUserGroup}
                as="div"
              >
                Users
              </Sidebar.Item>
            </Link>
          )}

          <Sidebar.Item
            icon={HiArrowSmRight}
            className="cursor-pointer"
            onClick={handleSignOut}
          >
            Sign Out
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}

export default DashSidebar;
