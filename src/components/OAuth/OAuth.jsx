import { Button } from "flowbite-react";
import React from "react";
import { AiFillGoogleCircle } from "react-icons/ai";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../../firebase";
import summaryApi from "../../common";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";

function OAuth({ type = "sign in" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    try {
      const result = await signInWithPopup(auth, provider);
      const res = await fetch(summaryApi.authGoogle.url, {
        method: summaryApi.authGoogle.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // tokenId:result.user.getIdToken(),
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <Button
      type="button"
      gradientDuoTone="pinkToOrange"
      outline
      onClick={handleGoogleClick}
    >
      <AiFillGoogleCircle className="w-6 h-6 mr-2" />
      {type === "sign up" ? "Sign up with Google" : "Sign in with Google"}
    </Button>
  );
}

export default OAuth;

