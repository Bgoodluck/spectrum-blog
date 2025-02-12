import { useSelector } from 'react-redux';

export const useProfile = () => {
  const { currentUser } = useSelector((state) => state.user);
  const userData = currentUser?.rest || {};
  
  // Get the most recent profile picture by checking both locations
  const getProfilePicture = () => {
    // First check if there's a profile picture in the main user data
    if (userData.profilePicture) {
      return userData.profilePicture;
    }
    // Then check if there's one in the nested profile
    if (userData.profile?.profilePicture) {
      return userData.profile.profilePicture;
    }
    // Finally return the default
    return 'https://cdn.pixabay.com/animation/2022/12/05/10/47/10-47-58-930_512.gif';
  };

  return {
    profilePicture: getProfilePicture(),
    userName: userData.userName,
    email: userData.email,
    profile: userData.profile || {}
  };
};