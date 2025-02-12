import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import summaryApi from "../../common";
import { Button, Modal, Table } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";

function DashPosts() {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Remove userId filter for admin users to see all posts
        const response = await fetch(`${summaryApi.getAllPosts.url}`, {
          method: summaryApi.getAllPosts.method,
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setUserPosts(data.posts);
          setShowMore(data?.posts?.length >= 9);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    if (currentUser.rest.isAdmin) {
      fetchPosts();
    }
  }, [currentUser.rest.isAdmin]);

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
          src={post?.mediaUrl}
          alt={post.title}
          className="w-20 h-10 object-cover bg-gray-500"
        />
      </Link>
    );
  };

  const handleShowMore = async () => {
    const startIndex = userPosts.length;
    try {
      // Remove userId filter here as well
      const response = await fetch(
        `${summaryApi.getAllPosts.url}?startIndex=${startIndex}`,
        {
          method: summaryApi.getAllPosts.method,
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        if (data?.posts?.length < 9) {
          setShowMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleDeletePost = async () => {
    try {
      // Replace the placeholders in the URL with actual values
      const deleteUrl = summaryApi.postDelete.url
        .replace(":postId", postIdToDelete)
        .replace(":userId", currentUser.rest._id);

      console.log("Current user:", currentUser.rest); // Debug log
      console.log("Delete URL:", deleteUrl); // Debug log

      const response = await fetch(deleteUrl, {
        method: summaryApi.postDelete.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`, // Make sure the token format matches what your backend expects
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postIdToDelete)
        );
        setShowModal(false);
      } else {
        console.error("Failed to delete post:", data.message);
        // Add more detailed error feedback
        if (response.status === 403) {
          console.log("Auth debug:", {
            isAdmin: currentUser.rest.isAdmin,
            userId: currentUser.rest._id,
            postId: postIdToDelete,
          });
        }
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500">
      {currentUser.rest.isAdmin && userPosts.length > 0 ? (
        <>
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Date Updated</Table.HeadCell>
              <Table.HeadCell>Media</Table.HeadCell>
              <Table.HeadCell>Post Title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>
                <span>Edit</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {userPosts.map((post, index) => (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-slate-700 dark:bg-slate-800"
                >
                  <Table.Cell>
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <MediaPreview post={post} />
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-slate-900 dark:text-white"
                      to={`/post/${post?.slug}`}
                    >
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span
                      className="font-medium text-red-500 hover:underline cursor-pointer"
                      onClick={() => {
                        setShowModal(true);
                        setPostIdToDelete(post._id);
                      }}
                    >
                      Delete
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link
                      className="text-teal-500"
                      to={`/update-post/${post?._id}`}
                    >
                      <span>Edit</span>
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
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
        <h2>No posts yet.</h2>
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
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button gradientDuoTone="purpleToBlue" onClick={handleDeletePost}>
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

export default DashPosts;
