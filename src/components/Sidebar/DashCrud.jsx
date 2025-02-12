import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import summaryApi from "../../common";
import { Button, Modal, Table } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";

function DashCrud() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [postStats, setPostStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(summaryApi.getAllPosts.url, {
          method: summaryApi.getAllPosts.method,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setUserPosts(data.posts);
          setShowMore(data?.posts?.length >= 9);
          
          // Fetch comments for each post
          data.posts.forEach(post => fetchPostComments(post._id));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser.rest.isAdmin) {
      fetchPosts();
    }
  }, [currentUser.rest.isAdmin]);

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      const response = await fetch(
        `${summaryApi.getAllPosts.url}?startIndex=${startIndex}`,
        {
          method: summaryApi.getAllPosts.method,
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        setShowMore(data?.posts?.length >= 9);
        
        // Fetch comments for new posts
        data.posts.forEach(post => fetchPostComments(post._id));
      }
    } catch (error) {
      console.error("Error fetching more posts:", error);
    }
  };

  const fetchPostComments = async (postId) => {
    try {
      const response = await fetch(
        summaryApi.commentGet.url.replace(':postId', postId),
        {
          method: summaryApi.commentGet.method,
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setPostStats(prev => ({
          ...prev,
          [postId]: {
            commentCount: data.data.length || 0
          }
        }));
      }
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
    }
  };

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setShowActionModal(true);
  };

  const handleAction = (action) => {
    setShowActionModal(false);
    if (action === 'post') {
      navigate(`/post/${selectedPost.slug}`);
    } else if (action === 'comments') {
      navigate(`/dashboard?tab=comments&postId=${selectedPost._id}`);
    }
  };

  const handleDeletePost = async () => {
    try {
      const deleteUrl = summaryApi.postDelete.url
        .replace(':postId', postIdToDelete)
        .replace(':userId', currentUser.rest._id);

      const response = await fetch(deleteUrl, {
        method: summaryApi.postDelete.method,
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserPosts((prev) =>
          prev.filter((post) => post._id !== postIdToDelete)
        );
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const MediaPreview = ({ post }) => {
    if (post.mediaType === "video") {
      return (
        <Link to={`/post/${post?.slug}`}>
          <video
            src={post?.mediaUrl}
            className="w-20 h-10 object-cover bg-gray-500"
            preload="metadata"
            muted
          >
            Your browser does not support the video tag.
          </video>
        </Link>
      );
    }

    return (
      <Link to={`/post/${post?.slug}`}>
        <img
          src={post?.mediaUrl || "/api/placeholder/80/40"}
          alt={post.title}
          className="w-20 h-10 object-cover bg-gray-500"
        />
      </Link>
    );
  };

  if (loading && userPosts.length === 0) {
    return <p className="text-center">Loading posts...</p>;
  }

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.rest.isAdmin && userPosts.length > 0 ? (
        <>
          {/* Mobile View */}
          <div className="block md:hidden">
            {userPosts.map((post) => (
              <div 
                key={post._id} 
                className="mb-4 p-3 bg-white rounded-lg shadow dark:bg-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MediaPreview post={post} />
                  <div className="flex-1">
                    <span 
                      className="font-medium text-slate-900 dark:text-white block mb-1 hover:underline cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      {post.title}
                    </span>
                    <span className="text-sm text-slate-500">{post.category}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                  <span>Comments: {postStats[post._id]?.commentCount || 0}</span>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t">
                  <Link 
                    to={`/update-post/${post._id}`}
                    className="text-teal-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <span
                    className="text-red-500 hover:underline cursor-pointer"
                    onClick={() => {
                      setShowDeleteModal(true);
                      setPostIdToDelete(post._id);
                    }}
                  >
                    Delete
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table hoverable className="shadow-md">
              <Table.Head>
                <Table.HeadCell>Date Updated</Table.HeadCell>
                <Table.HeadCell>Media</Table.HeadCell>
                <Table.HeadCell>Post Title</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
                <Table.HeadCell>Comments</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {userPosts.map((post) => (
                  <Table.Row
                    key={post._id}
                    className="bg-white dark:border-slate-700 dark:bg-slate-800"
                  >
                    <Table.Cell>
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <MediaPreview post={post} />
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        className="font-medium text-slate-900 dark:text-white cursor-pointer hover:underline"
                        onClick={() => handlePostClick(post)}
                      >
                        {post.title}
                      </span>
                    </Table.Cell>
                    <Table.Cell>{post.category}</Table.Cell>
                    <Table.Cell>{postStats[post._id]?.commentCount || 0}</Table.Cell>
                    <Table.Cell>
                      <div className="flex gap-3">
                        <Link
                          className="text-teal-500 hover:underline"
                          to={`/update-post/${post._id}`}
                        >
                          Edit
                        </Link>
                        <span
                          className="text-red-500 hover:underline cursor-pointer"
                          onClick={() => {
                            setShowDeleteModal(true);
                            setPostIdToDelete(post._id);
                          }}
                        >
                          Delete
                        </span>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>

          {/* Show More Button */}
          {showMore && (
            <div className="flex justify-center my-4">
              <button
                className="text-teal-500 hover:text-teal-600 font-medium px-4 py-2 rounded-md hover:bg-teal-50 transition-colors"
                onClick={handleShowMore}
              >
                Show More
              </button>
            </div>
          )}
        </>
      ) : (
        <h2 className="text-center text-lg">No posts yet.</h2>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="w-14 h-14 text-slate-400 dark:text-slate-200 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeletePost}>
                Yes, delete it
              </Button>
              <Button color="gray" onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Action Selection Modal */}
      <Modal
        show={showActionModal}
        onClose={() => setShowActionModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <h3 className="mb-5 text-lg text-slate-900 dark:text-slate-200">
              What would you like to view?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                gradientDuoTone="purpleToBlue"
                onClick={() => handleAction('post')}
              >
                View Post
              </Button>
              <Button
                gradientDuoTone="purpleToPink"
                onClick={() => handleAction('comments')}
              >
                View Comments
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DashCrud;