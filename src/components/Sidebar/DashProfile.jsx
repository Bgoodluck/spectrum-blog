import {
  Button,
  TextInput,
  Textarea,
  Card,
  Badge,
  Modal,
} from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { supabase } from "../../helpers/supabase-config";
import {
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signInSuccess,
  signOutFailure,
  signOutStart,
  signOutSuccess,
  updateStart,
} from "../../redux/user/userSlice";
import { CircularProgressbar } from "react-circular-progressbar";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Crown } from "lucide-react";
import {
  Calendar,
  Mail,
  MapPin,
  Link,
  Users,
  BookmarkIcon,
  Lock,
} from "lucide-react";
import "react-circular-progressbar/dist/styles.css";
import summaryApi from "../../common";
import { Toast } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { persistor, purgeStore, store } from "../../redux/store";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
// import { createClient } from '@supabase/supabase-js';




// Initialize Supabase client properly



function DashProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteError, setDeleteError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    newPassword: "",
    location: "",
    bio: "",
    socialProfiles: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const imagePickerRef = useRef();
  const userData = currentUser?.rest || {};

  console.log("bisi22", currentUser);
  console.log("bisi44", userData);



  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('jobs-board-public')
          .list('profiles');
        
        if (error) {
          console.error('Supabase connection error:', error);
        } else {
          console.log('Supabase connection successful:', data);
        }
      } catch (err) {
        console.error('Supabase test failed:', err);
      }
    };
  
    testConnection();
  }, []);



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(summaryApi.listUserProfile.url, {
          method: summaryApi.listUserProfile.method,
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            userName:
              data.profile.userName?.userName || userData.userName || "",
            email: data.profile.email || userData.email || "",
            location: data.profile.location || "",
            bio: data.profile.bio || "",
            socialProfiles: data.profile.socialProfiles?.length
              ? data.profile.socialProfiles
              : [""],
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Failed to load profile data");
      }
    };

    fetchProfile();
  }, [currentUser]);

  const validatePasswords = () => {
    // Only validate if user is trying to change password
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters long");
        return false;
      }
      if (!formData.password) {
        setError("Current password is required to set a new password");
        return false;
      }
    }
    return true;
  };

  // In handleFormSubmit function of DashProfile.js, modify the success handler:

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    if (!validatePasswords()) {
      setLoading(false);
      return;
    }

    try {
      dispatch(updateStart());
      const updateData = {
        userName: formData.userName,
        email: formData.email,
        location: formData.location,
        bio: formData.bio,
        socialProfiles: formData.socialProfiles.filter((url) => url.trim()),
      };

      if (formData.password && formData.newPassword) {
        updateData.password = formData.password;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(summaryApi.updateUserProfile.url, {
        method: summaryApi.updateUserProfile.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        // Update Redux state with the new profile data
        dispatch(
          signInSuccess({
            ...currentUser,
            rest: {
              ...currentUser.rest,
              ...data.profile.userName, // User model data
              profile: data.profile, // Profile model data
            },
          })
        );

        setSuccessMessage("Profile updated successfully!");
        setFormData((prev) => ({
          ...prev,
          password: "",
          newPassword: "",
        }));
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialProfileChange = (index, value) => {
    const updatedProfiles = [...formData.socialProfiles];
    updatedProfiles[index] = value;

    if (index === updatedProfiles.length - 1 && value.trim()) {
      updatedProfiles.push("");
    }

    setFormData((prev) => ({
      ...prev,
      socialProfiles: updatedProfiles,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageUploadError("Image size should be less than 2MB");
        return;
      }
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
      setImageUploadError(null);
    }
  };

  const uploadImage = async () => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setImageUploadError(null);

      // First, ensure we have authentication
      const session = await supabase.auth.getSession();
      if (!session) {
        // If no session, sign in anonymously
        const { data: { session: anonSession }, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw new Error('Authentication failed');
      }

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload with proper error handling
      const { error: uploadError, data } = await supabase.storage
        .from("jobs-board-public")
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type // Add explicit content type
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(uploadError.message || 'Upload failed');
      }

      // Get public URL only if upload succeeded
      const { data: { publicUrl } } = supabase.storage
        .from("jobs-board-public")
        .getPublicUrl(filePath);

      // Update profile with new image URL
      const response = await fetch(summaryApi.updateUserProfile.url, {
        method: summaryApi.updateUserProfile.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          profilePicture: publicUrl,
        }),
      });

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to update profile');
      }

      // Update Redux state
      dispatch(
        signInSuccess({
          ...currentUser,
          rest: {
            ...currentUser.rest,
            profilePicture: publicUrl,
            profile: {
              ...currentUser.rest.profile,
              profilePicture: publicUrl,
            },
          },
        })
      );

      setSuccessMessage("Profile picture updated successfully!");
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageUploadError(error.message || "Error uploading image. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };


  // Add error boundary
  useEffect(() => {
    const handleError = (error) => {
      console.error('Caught error:', error);
      setError('An unexpected error occurred. Please try again.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleDeleteAccount = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());

      const userId = currentUser?.rest?._id;

      if (!userId) {
        throw new Error("User ID not found");
      }

      const deleteUrl = summaryApi.deleteUserAccount.url.replace(
        ":userId",
        userId
      );

      const response = await fetch(deleteUrl, {
        method: summaryApi.deleteUserAccount.method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        await purgeStore(); // This will clear persisted data and reset the store
        localStorage.clear();

        // Firebase cleanup
        const auth = getAuth(app);
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
          await firebaseUser.delete();
        }
        await auth.signOut();

        // Redux actions
        dispatch(deleteUserSuccess());
        dispatch(signOutSuccess());

        navigate("/sign-in");
      } else {
        throw new Error(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      dispatch(deleteUserFailure(error.message));
      setDeleteError(error.message);

      setTimeout(() => {
        setDeleteError(null);
      }, 3000);
    }
  };
  // Add this just before your final return statement
  useEffect(() => {
    if (deleteError) {
      const timer = setTimeout(() => {
        setDeleteError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteError]);

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

  console.log("Melanie22", currentUser);
  console.log("melanie44", userData);

  return (
    <div className="max-w-4xl mx-auto p-4 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">
        Dashboard Profile
      </h1>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Profile Info */}
        <Card className="overflow-hidden">
          <div className="space-y-4">
            <div className="relative">
              <div
                className="relative w-32 h-32 mx-auto cursor-pointer shadow-md overflow-hidden rounded-full"
                onClick={() => imagePickerRef.current.click()}
              >
                <img
                  src={
                    imageFileUrl ||
                    userData.profilePicture ||
                    "/default-avatar.png"
                  }
                  alt="user"
                  className="rounded-full w-full h-full object-cover border-8 border-[lightgray]"
                />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <CircularProgressbar
                      value={uploadProgress}
                      text={`${uploadProgress}%`}
                      strokeWidth={5}
                      styles={{
                        root: { width: "80%", height: "80%" },
                        path: { stroke: "#3e98c7" },
                        text: { fill: "#ffffff", fontSize: "16px" },
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Add VIP badge if user is VIP */}
              {userData.isVip && (
                <div className="vip-badge">
                  <div className="flex items-center gap-1">
                    <Crown className="h-4 w-4 text-white" />
                    <span className="text-xs font-bold text-white">VIP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Add VIP status text below the profile picture */}
            {userData.isVip && (
              <div className="text-center">
                <Badge color="purple" className="font-semibold" icon={Crown}>
                  VIP Member
                </Badge>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={imagePickerRef}
              hidden
            />

            {imageFile && !uploading && (
              <Button
                gradientDuoTone="purpleToBlue"
                size="sm"
                onClick={uploadImage}
                className="w-full max-w-xs mx-auto"
              >
                Upload Image
              </Button>
            )}

            {imageUploadError && (
              <p className="text-red-500 text-sm text-center">
                {imageUploadError}
              </p>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge color="info" icon={Users}>
                {userData.followers?.length || 0} Followers
              </Badge>
              <Badge color="info" icon={Users}>
                {userData.following?.length || 0} Following
              </Badge>
              <Badge color="success" icon={BookmarkIcon}>
                {userData.postBookmarked?.length || 0} Bookmarks
              </Badge>
            </div>

            {userData.activePackage && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Active Package</h3>
                <p className="text-sm">{userData.activePackage.name}</p>
                <p className="text-sm">
                  Posts: {userData.advertsPostedInPeriod} /{" "}
                  {userData.activePackage.maxAdverts}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Right Column - Edit Form */}
        <Card>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <TextInput
              type="text"
              id="userName"
              placeholder="Username"
              value={formData.userName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, userName: e.target.value }))
              }
              icon={Users}
              autoComplete="username"
            />

            <TextInput
              type="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              icon={Mail}
            />

            <TextInput
              type="text"
              id="location"
              placeholder="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              icon={MapPin}
              autoComplete="address-level2"
            />

            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Social Profiles</label>
              {formData.socialProfiles.map((url, index) => (
                <TextInput
                  key={index}
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) =>
                    handleSocialProfileChange(index, e.target.value)
                  }
                  icon={Link}
                />
              ))}
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Change Password (Optional)</h3>
              <div className="space-y-3">
                <TextInput
                  type="password"
                  id="password"
                  placeholder="Current Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  icon={Lock}
                  autoComplete="current-password"
                />
                <TextInput
                  type="password"
                  id="newPassword"
                  placeholder="New Password (min 8 characters)"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  icon={Lock}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                gradientDuoTone="purpleToBlue"
                outline
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
          {currentUser?.rest?.isAdmin && (
            <Button
              type="button"
              gradientDuoTone="purpleToPink"
              className="w-full mt-4 block"
              onClick={() => navigate("/create-post")}
            >
              Create a post
            </Button>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex justify-between text-red-500">
          <button
            className="hover:underline"
            onClick={() => setShowModal(true)}
          >
            Delete Account
          </button>
          <button className="hover:underline" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </Card>
      {deleteError && (
        <div className="fixed bottom-5 right-5">
          <Toast>
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
              <HiOutlineExclamationCircle className="h-5 w-5" />
            </div>
            <div className="ml-3 text-sm font-normal">{deleteError}</div>
            <Toast.Toggle onDismiss={() => setDeleteError(null)} />
          </Toast>
        </div>
      )}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="w-14 h-14 text-slate-400 dark:text-slate-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-slate-500 dark:text-slate-400">
              Are you sure you want to delete your account?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                gradientDuoTone="purpleToBlue"
                onClick={handleDeleteAccount}
              >
                Yes delete accont.
              </Button>
              <Button onClick={() => setShowModal(false)}>No Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DashProfile;
