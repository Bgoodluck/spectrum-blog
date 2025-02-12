import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import summaryApi from '../../common'
import { Users, MessageSquare, FileText, Tag, ArrowRight, TrendingUp, UserPlus, MessageSquarePlus } from 'lucide-react'

function DashboardView() {
    const [users, setUsers] = useState([])
    const [comments, setComments] = useState([])
    const [posts, setPosts] = useState([])
    const [adverts, setAdverts] = useState([])
    const [totalUsers, setTotalUsers] = useState(0)
    const [totalPosts, setTotalPosts] = useState(0)
    const [totalComments, setTotalComments] = useState(0)
    const [totalAdverts, setTotalAdverts] = useState(0)
    const [lastMonthUsers, setLastMonthUsers] = useState(0)
    const [postsInLastMonth, setPostsInLastMonth] = useState(0)
    const [lastMonthComments, setLastMonthComments] = useState(0)
    const [lastMonthAdverts, setLastMonthAdverts] = useState(0)
    const [error, setError] = useState(null)
    
    const { currentUser } = useSelector((state) => state.user)
    const navigate = useNavigate()


    console.log("mind", posts)
    console.log("mind222", comments)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${summaryApi.allUsers.url}?limit=5`, {
                    method: summaryApi.allUsers.method,
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                    setUsers(data.users)
                    setTotalUsers(data.totalUsers)
                    setLastMonthUsers(data.lastMonthUsers)
                } else {
                    setError(data.message || 'Failed to fetch users')
                }
            } catch (error) {
                setError('Error fetching users data')
                console.error('Error fetching users:', error)
            }
        }

        const fetchPosts = async () => {
            try {
                const response = await fetch(`${summaryApi.getAllPosts.url}?limit=5`, {
                    method: summaryApi.getAllPosts.method,
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                    setPosts(data.posts)
                    setTotalPosts(data.totalPosts)
                    setPostsInLastMonth(data.postsInLastMonth)
                } else {
                    setError(data.message || 'Failed to fetch posts')
                }
            } catch (error) {
                setError('Error fetching posts data')
                console.error('Error fetching posts:', error)
            }
        }

        const fetchComments = async () => {
            try {
                const response = await fetch(`${summaryApi.adminGetComments.url}?limit=5`, {
                    method: summaryApi.adminGetComments.method,
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                    setComments(data.data.comments)
                    setTotalComments(data.data.totalComments)
                    setLastMonthComments(data.data.lastMonthComments)
                } else {
                    setError(data.message || 'Failed to fetch comments')
                }
            } catch (error) {
                setError('Error fetching comments data')
                console.error('Error fetching comments:', error)
            }
        }

        const fetchAdverts = async () => {
            try {
                const response = await fetch(`${summaryApi.advertGet.url}?limit=5`, {
                    method: summaryApi.advertGet.method,
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                if (response.ok && data.success) {
                    setAdverts(data.adverts)
                    setTotalAdverts(data.totalAdverts || 0)
                    setLastMonthAdverts(data.lastMonthAdverts || 0)
                } else {
                    setError(data.message || 'Failed to fetch adverts')
                }
            } catch (error) {
                setError('Error fetching adverts data')
                console.error('Error fetching adverts:', error)
            }
        }

        if (currentUser?.rest?.isAdmin && currentUser?.token) {
            fetchUsers()
            fetchPosts()
            fetchComments()
            fetchAdverts()
        }
    }, [currentUser])

    const StatCard = ({ title, total, lastMonth, icon: Icon }) => (
        <div className="p-6 bg-slate-200 dark:bg-slate-800 rounded-lg shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{total}</h3>
                </div>
                <div className="p-3 bg-slate-300 dark:bg-slate-700 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-500" />
                </div>
            </div>
            <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+{lastMonth} this month</span>
            </div>
        </div>
    )

    const RenderContent = ({ item }) => {
        if (item.content) {
            // Post content
            return (
                <>
                
                    <div className="flex items-center gap-2 mb-1">
                        
                        <h4 className="text-slate-900 dark:text-white font-medium">{item.title}</h4>
                        <span className="text-green-500 text-sm">{item.category}</span>
                    </div>
                    <div 
                        className="text-slate-600 dark:text-slate-400 text-sm"
                        dangerouslySetInnerHTML={{ __html: item.content.substring(0, 50) + '...' }} 
                    />
                </>
            )
        } else if (item.ItemName) {
            // Advert content
            return (
                <>
                
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-slate-900 dark:text-white font-medium">{item.ItemName}</h4>
                        {item.userId && (
                            <span className="text-slate-500 dark:text-slate-400 text-sm">
                                by {item.userId.userName}
                            </span>
                        )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {item.ItemDescription?.substring(0, 50)}...
                    </p>
                </>
            )
        } else {
            // User content
            return (
                <>
                    <h4 className="text-slate-900 dark:text-white font-medium">
                        {item.userName}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {item.email}
                    </p>
                </>
            )
        }
    }

    const ContentCard = ({ title, items, icon: Icon, viewAllLink }) => (
        <div className="bg-slate-200 dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <Icon className="h-6 w-6 text-blue-500 mr-2" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
                    </div>
                    <button 
                        onClick={() => navigate(viewAllLink)}
                        className="flex items-center text-sm text-blue-500 hover:text-blue-400"
                    >
                        View all <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {items?.slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center p-4 bg-slate-300 dark:bg-slate-700 rounded-lg">
                            <img 
                                src={item.profilePicture || item.userId?.profilePicture || "/default-avatar.png"} 
                                alt={item.userName || item.userId?.userName || "User"} 
                                className="w-10 h-10 rounded-full object-cover mr-4"
                            />
                            <div className="flex-1">
                                <RenderContent item={item} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    if (!currentUser?.rest?.isAdmin) {
        return (
            <div className="p-4 bg-slate-100 dark:bg-slate-900">
                <div className="text-center py-12">
                    <Users className="h-16 w-16 text-slate-600 dark:text-slate-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                    <p className="text-slate-600 dark:text-slate-400">You need admin privileges to view this dashboard.</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 bg-slate-100 dark:bg-slate-900">
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Users" 
                    total={totalUsers} 
                    lastMonth={lastMonthUsers}
                    icon={Users}
                />
                <StatCard 
                    title="Total Posts" 
                    total={totalPosts} 
                    lastMonth={postsInLastMonth}
                    icon={FileText}
                />
                <StatCard 
                    title="Total Comments" 
                    total={totalComments} 
                    lastMonth={lastMonthComments}
                    icon={MessageSquare}
                />
                <StatCard 
                    title="Total Adverts" 
                    total={totalAdverts} 
                    lastMonth={lastMonthAdverts}
                    icon={Tag}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ContentCard 
                    title="Recent Users"
                    items={users}
                    icon={UserPlus}
                    viewAllLink="/dashboard?tab=users"
                />
                <ContentCard 
                    title="Recent Posts"
                    items={posts}
                    icon={FileText}
                    viewAllLink="/dashboard?tab=posts"
                />
                <ContentCard 
                    title="Recent Comments"
                    items={comments}
                    icon={MessageSquarePlus}
                    viewAllLink="/dashboard?tab=crud"
                />
                <ContentCard 
                    title="Recent Adverts"
                    items={adverts}
                    icon={Tag}
                    viewAllLink="/dashboard?tab=advert-page"
                />
            </div>
        </div>
    )
}

export default DashboardView