import React, { useState, useEffect } from 'react'
import summaryApi from '../../common'
import EntertainmentPostsGrid from './EntertainmentPostsCarousel'

function EntertainmentPosts() {
    const [posts, setPosts] = useState([])
    const category = 'entertainment'

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${summaryApi.getAllPosts.url}?category=${category}&limit=100`, {
                method: summaryApi.getAllPosts.method
            })
            
            const data = await response.json()
            if (data.success) {
                setPosts(data.posts)
            }
            
        } catch (error) {
            console.error("Error fetching posts:", error)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, []) 

    return <EntertainmentPostsGrid posts={posts} />
}

export default EntertainmentPosts