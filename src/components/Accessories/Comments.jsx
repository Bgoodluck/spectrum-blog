import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FaThumbsUp, FaEdit, FaTrash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import summaryApi from '../../common';
import { Button, Textarea } from 'flowbite-react';


function Comments({ comment, onLike, onDelete, onEdit }) {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const { currentUser } = useSelector((state) => state.user);

    const defaultUserImage = "https://cdn.pixabay.com/animation/2022/12/05/10/47/10-47-58-930_512.gif";
  const defaultUserName = "Anonymous User";

    useEffect(() => {
        const getUser = async () => {
            if (!comment.userId) {
                setUser(null);
                return;
              }
            try {
                const url = summaryApi.singleUser.url.replace(':userId', comment.userId);
                const response = await fetch(url, {
                    method: summaryApi.singleUser.method,
                });
                const data = await response.json();
                if (response.ok) {
                    setUser(data.user);
                }else {
                    setUser(null);
                  }
            } catch (error) {
                console.error(error);
                setUser(null);
            }
        };
        getUser();
    }, [comment]);

    const handleEdit = () => {
        if (isEditing) {
            onEdit(comment._id, editedContent);
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

   

    const isCurrentUserComment = currentUser?.rest?._id === comment.userId;

    return (
        <div className='flex p-4 border-b dark:border-slate-600 text-sm'>
            <div className='flex-shrink-0 mr-3'>
                <img
                    src={user?.profilePicture || defaultUserImage}
                    alt={user?.userName || defaultUserName}
                    className='w-10 h-10 rounded-full bg-slate-200'
                />
            </div>
            <div className='flex-1'>
                <div className='flex items-center mb-1'>
                    <span className='font-bold mr-1 text-sm truncate'>
                    {user?.userName ? `@${user.userName}` : defaultUserName}
                    </span>
                    <span className='text-slate-500 text-xs'>
                        {moment(comment.createdAt).fromNow()}
                    </span>
                </div>
                {isEditing ? (
                    <>
                        <Textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className='w-full p-2 border bg-slate-500 text-white dark:bg-slate-500 rounded-md mb-2'
                            rows="3"
                        />
                        <div className='flex justify-end gap-2 text-xs'>
                            <Button
                                type='button'
                                size='sm'
                                gradientDuoTone='purpleToBlue'
                                onClick={() => {
                                    onEdit(comment._id, editedContent);
                                    setIsEditing(false);
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                type='button'
                                size='sm'
                                gradientDuoTone='purpleToBlue'
                                outline
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    <p className='text-sm text-slate-500 pb-2'>
                        {comment.content}
                    </p>
                )}
                <div className='flex items-center gap-4 pt-2 text-xs border-t dark:border-slate-700 max-w-fit'>
                    <button
                        type='button'
                        className='flex items-center gap-1'
                        onClick={() => onLike(comment._id)}
                    >
                        <FaThumbsUp
                            className={`text-sm ${currentUser && comment.likes?.includes(currentUser.rest._id)
                                    ? 'text-blue-500'
                                    : 'text-slate-400 hover:text-blue-500'
                                }`}
                        />
                        <span className='text-sm text-slate-500'>
                            {comment.numberOfLikes > 0 && comment.numberOfLikes + " " + (comment.numberOfLikes === 1 ? "like" : "likes")}
                        </span>
                    </button>

                    {(isCurrentUserComment || currentUser.rest.isAdmin) && (
                        <>
                            <button
                                onClick={handleEdit}
                                className='text-slate-400 hover:text-blue-500'
                            >
                                <FaEdit className='text-sm' />
                            </button>
                            <button
                                onClick={() => onDelete(comment._id)}
                                className='text-slate-400 hover:text-red-500'
                            >
                                <FaTrash className='text-sm' />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Comments;