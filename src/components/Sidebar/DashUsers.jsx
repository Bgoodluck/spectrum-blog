import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import summaryApi from '../../common'
import { Button, Modal, Table } from 'flowbite-react'
import { Link } from 'react-router-dom'
import { HiOutlineExclamationCircle } from 'react-icons/hi'

function DashUsers() {
    const { currentUser } = useSelector((state) => state.user)
    const [users, setUsers] = useState([])
    const [showMore, setShowMore] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [userIdToDelete, setUserIdToDelete] = useState('')


 console.log("Hello", users)
    useEffect(() => {
        const fetchusers = async () => {
            try {
                const response = await fetch(`${summaryApi.allUsers.url}`, {
                    method: summaryApi.allUsers.method,
                    headers: {
                       'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`

                    }
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    setUsers(data.users);
                    setShowMore(data?.users?.length >= 9);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        if (currentUser.rest.isAdmin) {
            fetchusers()
        }
    }, [currentUser.rest._id])

    

    const handleShowMore = async()=>{
        const startIndex = users.length
        try {
            const response = await fetch(`${summaryApi.allUsers.url}?startIndex=${startIndex}`, {
                method: summaryApi.allUsers.method,
                headers: {
                   'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setUsers((prev) => [...prev, ...data.users]);
                if (data?.users?.length < 9) {
                    setShowMore(false);
                }                
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }


    const handleDeleteUser = async () => {
        try {
            // Replace the placeholders in the URL with actual values
            const deleteUrl = summaryApi.deleteUserAccount.url
                .replace(':userId', userIdToDelete)
                .replace(':userId', currentUser.rest._id);
    
            console.log('Current user:', currentUser.rest); // Debug log
            console.log('Delete URL:', deleteUrl); // Debug log
    
            const response = await fetch(deleteUrl, {
                method: summaryApi.deleteUserAccount.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}` // Make sure the token format matches what your backend expects
                },
               
            });
    
            const data = await response.json();
            
            if (response.ok && data.success) {
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userIdToDelete));
                setShowModal(false);
            } else {
                console.error('Failed to delete user:', data.message);
                // Add more detailed error feedback
                if (response.status === 403) {
                    console.log('Auth debug:', {
                        isAdmin: currentUser.rest.isAdmin,
                        currentUserId: currentUser.rest._id,
                        targetUserId: userIdToDelete
                    });
                }
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }


    



    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            {currentUser.rest.isAdmin && users.length > 0 ? (
                <>
                    <Table hoverable className='shadow-md'>
                        <Table.Head>
                            <Table.HeadCell>Date Created</Table.HeadCell>
                            <Table.HeadCell>User Image</Table.HeadCell>
                            <Table.HeadCell>Username</Table.HeadCell>
                            <Table.HeadCell>Email</Table.HeadCell>
                            <Table.HeadCell>Role</Table.HeadCell>
                            <Table.HeadCell>Delete</Table.HeadCell>
                            {/* <Table.HeadCell>
                                <span>Edit</span>
                            </Table.HeadCell> */}
                        </Table.Head>
                        <Table.Body className='divide-y'>
                            {users.map((user, index) => (
                                <Table.Row key={index} className='bg-white dark:border-slate-700 dark:bg-slate-800'>
                                    <Table.Cell>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {/* <MediaPreview post={post} /> */}
                                        <img 
                                          src={user?.profilePicture} 
                                          alt={user?.userName} 
                                          className='w-10 h-10 rounded-full object-cover bg-gray-500'
                                        />
                                    </Table.Cell>
                                    <Table.Cell>
                                        {/* <Link
                                            className='font-medium text-slate-900 dark:text-white'
                                            to={`/post/${post?.slug}`}
                                        > */}
                                            {user?.userName}
                                        {/* </Link> */}
                                    </Table.Cell>
                                    <Table.Cell>{user?.email}</Table.Cell>
                                    <Table.Cell>
  <span
    className={`${
      user?.isAdmin ? "font-bold text-blue-800 dark:text-red-700" : "font-normal"
    }`}
  >
    {user?.isAdmin ? "Admin" : "User"}
  </span>
</Table.Cell>

                                    <Table.Cell>
                                        <span 
                                           className='font-medium text-red-500 hover:underline cursor-pointer'
                                           onClick={()=>{
                                             setShowModal(true)
                                             setUserIdToDelete(user._id)
                                           }}
                                        >
                                            Delete
                                        </span>
                                    </Table.Cell>
                                    {/* <Table.Cell>
                                        <Link className='text-teal-500' to={`/update-post/${post?._id}`}>
                                            <span>Edit</span>
                                        </Link>
                                    </Table.Cell> */}
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
                <h2>No user yet.</h2>
            )}
            <Modal 
                    show={showModal} 
                    onClose={()=>setShowModal(false)} 
                    popup 
                    size="md"
                  >
                    <Modal.Header/>  
                    <Modal.Body>
                      <div className="text-center">
                           <HiOutlineExclamationCircle className="w-14 h-14 text-slate-400 dark:text-slate-200 mb-4 mx-auto"/>
                           <h3 className="mb-5 text-lg text-slate-500 dark:text-slate-400">
                             Are you sure you want to delete this user? 
                           </h3> 
                           <div className="flex justify-center gap-4">
                              <Button gradientDuoTone="purpleToBlue" onClick={handleDeleteUser}>
                                Yes delete accont.
                              </Button>
                              <Button onClick={()=>setShowModal(false)}>
                               No Cancel
                              </Button>                   
                
                          </div> 
                      </div>          
                    </Modal.Body>      
                  </Modal>
        </div>
    )
}

export default DashUsers