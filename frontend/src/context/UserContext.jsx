import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Set the base URL for Axios globally
axios.defaults.baseURL = "http://localhost:7000"; // Replace with your backend URL

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize as null
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Register a new user
  async function registerUser(formdata, navigate, fetchPosts) {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", formdata);
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
      fetchPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  }

  // Log in an existing user
  async function loginUser(email, password, navigate, fetchPosts) {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/");
      fetchPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  }

  // Fetch the current user's details
  async function fetchUser() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/me");
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.error(error?.response?.data?.message || "Failed to fetch user");
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  // Log out the current user
  async function logoutUser(navigate) {
    try {
      const { data } = await axios.get("/api/auth/logout");
      if (data.message) {
        toast.success(data.message);
        setUser(null);
        setIsAuth(false);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to logout");
    }
  }

  // Follow a user
  async function followUser(id, fetchUser) {
    try {
      const { data } = await axios.post(`/api/user/follow/${id}`);
      toast.success(data.message);
      fetchUser();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to follow user");
    }
  }

  // Update profile picture
  async function updateProfilePic(id, formdata, setFile) {
    try {
      const { data } = await axios.put(`/api/user/${id}`, formdata);
      toast.success(data.message);
      fetchUser();
      if (setFile) setFile(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile picture");
    }
  }

  // Update profile name
  async function updateProfileName(id, name, setShowInput) {
    try {
      const { data } = await axios.put(`/api/user/${id}`, { name });
      toast.success(data.message);
      fetchUser();
      if (setShowInput) setShowInput(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile name");
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        loginUser,
        isAuth,
        setIsAuth,
        user,
        setUser,
        loading,
        logoutUser,
        registerUser,
        followUser,
        updateProfilePic,
        updateProfileName,
      }}
    >
      {children}
      <Toaster />
    </UserContext.Provider>
  );
};

export const UserData = () => useContext(UserContext);
