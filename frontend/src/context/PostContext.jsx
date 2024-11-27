import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

// Set the base URL for Axios globally
axios.defaults.baseURL = "http://localhost:8000"; // Replace with your API URL

const PostContext = createContext();

export const PostContextProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all posts and reels
  async function fetchPosts() {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/post/all");
      setPosts(data.posts || []);
      setReels(data.reels || []);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }

  const [addLoading, setAddLoading] = useState(false);

  // Add a new post
  async function addPost(formdata, setFile, setFilePrev, setCaption, type) {
    setAddLoading(true);
    try {
      const { data } = await axios.post(`/api/post/new?type=${type}`, formdata);
      toast.success(data.message);
      await fetchPosts();
      setFile("");
      setFilePrev("");
      setCaption("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add post");
    } finally {
      setAddLoading(false);
    }
  }

  // Like a post
  async function likePost(id) {
    try {
      const { data } = await axios.post(`/api/post/like/${id}`);
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to like post");
    }
  }

  // Add a comment to a post
  async function addComment(id, comment, setComment, setShow) {
    try {
      const { data } = await axios.post(`/api/post/comment/${id}`, { comment });
      toast.success(data.message);
      fetchPosts();
      setComment("");
      if (setShow) setShow(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add comment");
    }
  }

  // Delete a post
  async function deletePost(id) {
    setLoading(true);
    try {
      const { data } = await axios.delete(`/api/post/${id}`);
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  }

  // Delete a comment
  async function deleteComment(id, commentId) {
    try {
      const { data } = await axios.delete(`/api/post/comment/${id}?commentId=${commentId}`);
      toast.success(data.message);
      fetchPosts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <PostContext.Provider
      value={{
        reels,
        posts,
        addPost,
        likePost,
        addComment,
        loading,
        addLoading,
        fetchPosts,
        deletePost,
        deleteComment,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const PostData = () => useContext(PostContext);
