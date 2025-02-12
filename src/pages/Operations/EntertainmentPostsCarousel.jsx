import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import summaryApi from '../../common'

const EntertainmentPostsCarousel = ({ posts }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [usernames, setUsernames] = useState({})
    const navigate = useNavigate()

    console.log("goodluck", usernames)

    // Fetch usernames for each unique userId
    const fetchUsernames = async () => {
        const uniqueUserIds = [...new Set(posts.map(post => post.userId))]
        const usernameMap = {}
        
        for (const userId of uniqueUserIds) {
            try {
                // Replace with your exact endpoint
                const response = await fetch(`${summaryApi.singleUser.url.replace(':userId', userId)}`, {
                    method: summaryApi.singleUser.method
                })
    
                // Check response status and content type
                if (!response.ok) {
                    console.error('Response not OK:', await response.text())
                    usernameMap[userId] = 'Error Fetching'
                    continue
                }
    
                const contentType = response.headers.get('content-type')
                if (!contentType || !contentType.includes('application/json')) {
                    console.error('Not a JSON response:', await response.text())
                    usernameMap[userId] = 'Invalid Response'
                    continue
                }
    
                const userData = await response.json()
                console.log("goodluck1234", userData)
                usernameMap[userId] = userData.user.userName || 'No Username'
            } catch (error) {
                console.error(`Error fetching username for ${userId}:`, error)
                usernameMap[userId] = 'Unknown User'
            }
        }
        
        setUsernames(usernameMap)
    }



    useEffect(() => {
        if (posts.length > 0) {
            fetchUsernames()
        }
    }, [posts])

    const nextPost = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === posts.length - 1 ? 0 : prevIndex + 1
        )
    }

    const prevPost = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? posts.length - 1 : prevIndex - 1
        )
    }

    const handleMediaClick = (slug) => {
        navigate(`/post/${slug}`)
    }

    return (
        <div className="relative max-w-7xl mx-auto px-4 py-8 dark:bg-slate-900">
            <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Entertainment Posts</h2>
            
            <div className="relative group">
                <div className="overflow-hidden rounded-xl">
                    <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {posts.map((post) => (
                            <div 
                                key={post._id} 
                                className="min-w-full"
                            >
                                <div className="aspect-video relative">
                                    {post.mediaType === 'video' ? (
                                        <video
                                            src={post.mediaUrl}
                                            className="w-full h-full object-cover rounded-xl"
                                            controls={false}
                                            loop
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={post.mediaUrl}
                                            className="w-full h-full object-cover rounded-xl"
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                        <h3 className="text-white text-xl font-bold">{post.title}</h3>
                                        <p className="text-white text-sm mt-2">
                                            Author: {usernames[post.userId] || 'Loading...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={prevPost}
                >
                    <ChevronLeft className="w-6 h-6 dark:text-white" />
                </button>
                
                <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={nextPost}
                >
                    <ChevronRight className="w-6 h-6 dark:text-white" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {posts.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default EntertainmentPostsCarousel