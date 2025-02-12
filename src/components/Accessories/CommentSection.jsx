import { Alert, Button, Modal, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import summaryApi from "../../common";
import Comments from "./Comments";
import { HiOutlineExclamationCircle } from "react-icons/hi";

function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const navigate = useNavigate();

  const fetchComments = async () => {
    try {
      const url = summaryApi.commentGet.url.replace(":postId", postId);
      const response = await fetch(url, {
        method: summaryApi.commentGet.method,
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setComments(data.data);
      } else {
        console.error("Failed to fetch comments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (comment.length > 200) {
      setCommentError("Comment too long. Maximum 200 characters allowed.");
      return;
    }
    try {
      const response = await fetch(summaryApi.commentCreation.url, {
        method: summaryApi.commentCreation.method,
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content: comment,
          userId: currentUser.rest._id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setComment("");
        setCommentError(null);
        setComments([data, ...comments]);
        // Fetch comments again after successful post
        fetchComments();
      } else {
        setCommentError(data.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      setCommentError(
        error.message || "Failed to post comment. Please try again."
      );
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate("/sign-in");
        return;
      }
      const response = await fetch(
        summaryApi.commentLike.url.replace(":commentId", commentId),
        {
          method: summaryApi.commentLike.method,
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  ...data.data, // Spread the updated comment data
                }
              : comment
          )
        );
      } else {
        console.error("Failed to like comment:", data.message);
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleEdit = async (commentId, newContent) => {
    try {
      const response = await fetch(
        summaryApi.commentEdit.url.replace(":commentId", commentId),
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newContent }),
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        // Update to use the entire edited comment from response
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? { ...comment, ...data.data } // Spread the entire updated comment
              : comment
          )
        );
      } else {
        // Handle error messages from the backend
        console.error("Failed to edit comment:", data.message);
        // Optionally show error to user
        // setCommentError(data.message);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      // Optionally show error to user
      // setCommentError('Failed to edit comment. Please try again.');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      if (!commentId) return; 

      const response = await fetch(
        summaryApi.commentDelete.url.replace(":commentId", commentId),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      if (response.ok) {
        setComments(comments.filter((comment) => comment._id !== commentId));
        setShowModal(false); 
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = async (comment, editedContent) => {
    setComments(
      comments.map((c) =>
        c._id === comment._id
          ? {
              ...comment,
              content: editedContent,
            }
          : c
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-slate-600 text-sm dark:text-white">
          <p>Signed in as:</p>
          <img
            src={currentUser.rest.profilePicture}
            alt={currentUser.rest.userName}
            className="h-5 w-5 object-cover rounded-full"
          />
          <Link
            to={"/dashboard?tab=profile"}
            className="text-xs text-cyan-600 hover:underline"
          >
            @{currentUser.rest.userName}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          Please Sign In to Comment
          <Link to={"/sign-in"} className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </div>
      )}
      {currentUser && (
        <>
          <form
            onSubmit={handleSubmit}
            className="border border-teal-500 rounded-md p-3"
          >
            <Textarea
              placeholder="Add a comment..."
              rows="3"
              maxLength="200"
              onChange={(e) => setComment(e.target.value)}
              value={comment}
            />
            <div className="flex justify-between items-center mt-5">
              <p className="text-slate-600 text-xs dark:text-white">
                {200 - (comment ? comment.length : 0)} characters remaining
              </p>
              <Button outline gradientDuoTone="purpleToBlue" type="submit">
                Submit
              </Button>
            </div>
            {commentError && (
              <Alert color="failure">
                <p className="text-blue-500 text-xs">{commentError}</p>
              </Alert>
            )}
          </form>

          <div className="mt-6">
            <div className="text-sm mb-4 flex items-center gap-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-300 text-xs">
                Comments
              </h3>
              <div className="border border-slate-400 py-1 px-2 rounded-sm">
                <p>{comments.length}</p>
              </div>
            </div>

            {comments.length === 0 ? (
              <p className="text-slate-600 text-sm dark:text-white">
                No comments yet.
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment, index) => (
                  <Comments
                    key={comment._id+index}
                    comment={comment}
                    onLike={handleLike}
                    onEdit={handleEdit}
                    onDelete={(commentId) => {
                      setShowModal(true);
                      setCommentToDelete(commentId);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
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
              Are you sure you want to delete this comment?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                gradientDuoTone="purpleToBlue"
                onClick={() => {
                  if (commentToDelete) {
                    handleDelete(commentToDelete);
                  }
                }}
              >
                Yes delete comment
              </Button>
              <Button onClick={() => setShowModal(false)}>No Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default CommentSection;
