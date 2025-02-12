import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, Table, Breadcrumb } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link, useSearchParams } from "react-router-dom";
import summaryApi from "../../common";

const DashComments = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  
  const [comments, setComments] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState("");
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      if (!currentUser?.rest?.isAdmin) return;
      setError("");
      setLoading(true);
  
      try {
        let url = summaryApi.adminGetComments.url;
        if (postId) {
          url += `?postId=${postId}`;
        }

        const response = await fetch(url, {
          method: summaryApi.adminGetComments.method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        const data = await response.json();
  
        if (response.ok && data.success) {
          const commentsArray = data.data.comments || [];
          setComments(commentsArray);
          setShowMore(commentsArray.length >= 9);
  
          if (commentsArray.length > 0) {
            commentsArray.forEach((comment) => {
              if (comment.userId) fetchUserDetails(comment.userId);
              if (comment.postId) fetchPostDetails(comment.postId);
            });
          }
        } else {
          setError(data.message || "Failed to fetch comments");
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [currentUser?.rest?.isAdmin, postId, currentUser.token]);

  const handleShowMore = async () => {
    const startIndex = comments.length;
    try {
      let url = `${summaryApi.adminGetComments.url}?startIndex=${startIndex}`;
      if (postId) {
        url += `&postId=${postId}`;
      }

      const response = await fetch(url, {
        method: summaryApi.adminGetComments.method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        const newComments = data.data.comments || [];
        setComments((prev) => [...prev, ...newComments]);
        setShowMore(newComments.length >= 9);

        newComments.forEach((comment) => {
          if (comment.userId) fetchUserDetails(comment.userId);
          if (comment.postId) fetchPostDetails(comment.postId);
        });
      }
    } catch (error) {
      console.error("Error fetching more comments:", error);
    }
  };

  const fetchUserDetails = async (userId) => {
    if (!userId || users[userId]) return;

    try {
      const url = summaryApi.singleUser.url.replace(":userId", userId);
      const response = await fetch(url, {
        method: summaryApi.singleUser.method,
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUsers((prev) => ({
          ...prev,
          [userId]: data.user,
        }));
      }
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    }
  };

  const fetchPostDetails = async (postId) => {
    if (!postId || posts[postId]) return;

    try {
      const response = await fetch(`${summaryApi.getAllPosts.url}?postId=${postId}`, {
        method: summaryApi.getAllPosts.method,
      });
      const data = await response.json();

      if (data.success && Array.isArray(data.posts) && data.posts[0]) {
        setPosts((prev) => ({
          ...prev,
          [postId]: data.posts[0],
        }));
        
        if (postId === searchParams.get('postId')) {
          setCurrentPost(data.posts[0]);
        }
      }
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      const url = summaryApi.commentDelete.url.replace(":commentId", commentIdToDelete);
      const response = await fetch(url, {
        method: summaryApi.commentDelete.method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setComments((prev) =>
          prev.filter((comment) => comment._id !== commentIdToDelete)
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment. Please try again.");
    }
  };

  if (!currentUser?.rest?.isAdmin) {
    return <p className="text-center text-red-500">Access denied</p>;
  }

  if (loading && comments.length === 0) {
    return <p className="text-center">Loading comments...</p>;
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link to="/dashboard?tab=posts" className="text-gray-600">
            Dashboard
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          Comments {postId && currentPost && `- ${currentPost.title}`}
        </Breadcrumb.Item>
      </Breadcrumb>

      {error && (
        <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
          {error}
        </div>
      )}

      {comments.length > 0 ? (
        <>
          {/* Mobile View */}
          <div className="block md:hidden">
            {comments.map((comment) => (
              <div 
                key={comment._id}
                className="mb-4 p-3 bg-white rounded-lg shadow dark:bg-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={users[comment.userId]?.profilePicture || "/api/placeholder/32/32"}
                    alt={users[comment.userId]?.userName || "User"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {users[comment.userId]?.userName || "Loading..."}
                    </span>
                    <span className="text-sm text-slate-500 block">
                      {new Date(comment.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                  {comment.content}
                </p>
                {!postId && posts[comment.postId] && (
                  <Link
                    to={`/post/${posts[comment.postId].slug}`}
                    className="text-sm text-blue-500 hover:underline block mb-2"
                  >
                    on: {posts[comment.postId].title}
                  </Link>
                )}
                <div className="flex justify-between items-center text-sm">
                  <span>Likes: {comment.numberOfLikes || 0}</span>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => {
                      setShowModal(true);
                      setCommentIdToDelete(comment._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Comment</Table.HeadCell>
                {!postId && <Table.HeadCell>Post</Table.HeadCell>}
                <Table.HeadCell>Likes</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {comments.map((comment) => (
                  <Table.Row
                    key={comment._id}
                    className="bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Table.Cell className="whitespace-nowrap">
                      {new Date(comment.updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <img
                          src={users[comment.userId]?.profilePicture || "/api/placeholder/32/32"}
                          alt={users[comment.userId]?.userName || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">
                          {users[comment.userId]?.userName || "Loading..."}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="max-w-md">
                      <p className="truncate">{comment.content}</p>
                    </Table.Cell>
                    {!postId && (
                      <Table.Cell>
                        {posts[comment.postId] ? (
                          <Link
                            to={`/post/${posts[comment.postId].slug}`}
                            className="hover:text-blue-600"
                          >
                            {posts[comment.postId].title}
                          </Link>
                        ) : (
                          "Loading..."
                        )}
                      </Table.Cell>
                    )}
                    <Table.Cell>{comment.numberOfLikes || 0}</Table.Cell>
                    <Table.Cell>
                      <span
                        onClick={() => {
                          setShowModal(true);
                          setCommentIdToDelete(comment._id);
                        }}
                        className="font-medium text-red-500 hover:underline cursor-pointer"
                      >
                        Delete
                      </span>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Show More Button */}
          {showMore && (
            <div className="flex justify-center my-4">
              <Button
                gradientDuoTone="purpleToBlue"
                onClick={handleShowMore}
                size="sm"
              >
                Show More
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">No comments found</p>
      )}

      {/* Delete Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="w-14 h-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteComment}>
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default DashComments;