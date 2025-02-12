import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import summaryApi from "../../common";
import { Spinner, Card, Button } from "flowbite-react";
import HeroAction from "../../components/Accessories/HeroAction";
import CommentSection from "../../components/Accessories/CommentSection";
import PostCard from "../../components/Accessories/PostCard";
import { ArrowRight } from "lucide-react";

const PostPage = () => {
  const { postSlug } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recentPosts, setRecentPosts] = useState(null)

  const currentUser = useSelector((state) => state.user.currentUser);
  

  const fetchAuthor = async (userId) => {
    if (!userId) {  // Add check for empty/null userId
      return null;
    }
    try {
      // Replace the :userId placeholder with the actual userId
      const url = summaryApi.singleUser.url.replace(":userId", userId);

      const response = await fetch(url, {
        method: summaryApi.singleUser.method,
      });

      if (!response.ok) {
        console.log(`Author with ID ${userId} not found`);
        return null;
      }
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching author:", error);
      return null;
    }
  };

  // Media preview component
  const MediaDisplay = ({ mediaType, mediaUrl, title, className = "" }) => {
    if (!mediaUrl) return null;

    if (mediaType === "image") {
      return (
        <img
          src={mediaUrl}
          alt={title}
          className={`w-full h-auto object-cover rounded-lg ${className}`}
        />
      );
    }

    if (mediaType === "video") {
      return (
        <video
          className={`w-full rounded-lg ${className}`}
          controls
          preload="metadata"
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    return null;
  };

  // Related post media preview component
  const RelatedPostMedia = ({ post }) => {
    if (post.mediaType === "video") {
      return (
        <div className="relative w-24 h-24 bg-gray-200 rounded">
          <video
            className="w-full h-full object-cover rounded"
            preload="metadata"
          >
            <source src={post.mediaUrl} type="video/mp4" />
          </video>
          {/* Video indicator overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M8 5v10l7-5-7-5z" />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <img
        src={post.mediaUrl || "/api/placeholder/100/100"}
        alt={post.title}
        className="w-24 h-24 object-cover rounded"
      />
    );
  };

  const fetchRelatedPosts = async (category) => {
    try {
      const response = await fetch(
        `${summaryApi.getAllPosts.url}?category=${category}`,
        {
          method: summaryApi.getAllPosts.method,
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch related posts");
        return [];
      }

      const data = await response.json();
      return data.posts.filter((p) => p.slug !== postSlug).slice(0, 4);
    } catch (error) {
      console.error("Error fetching related posts:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${summaryApi.getAllPosts.url}?slug=${postSlug}`,
          {
            method: summaryApi.getAllPosts.method,
          }
        );

        const data = await response.json();

        if (!response.ok || !data.posts?.length) {
          setError(true);
          return;
        }

        const postData = data.posts[0];
        setPost(postData);
        setTotalPosts(data.totalPosts);
        setLastMonthPosts(data.postsInLastMonth);

        // Fetch author details
        if (postData.userId) {
          const authorData = await fetchAuthor(postData.userId);
          setAuthor(authorData);
        }

        if (postData.category) {
          const relatedPostsData = await fetchRelatedPosts(postData.category);
          setRelatedPosts(relatedPostsData);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (postSlug) {
      fetchPost();
    }
  }, [postSlug]);




  useEffect(()=>{

    try {

      const fetchRecentPosts = async()=>{
        const response = await fetch(
          `${summaryApi.getAllPosts.url}?limit=3&order=desc`,
          {
            method: summaryApi.getAllPosts.method,
          }
        );
        if (!response.ok) {
          console.error("Failed to fetch recent posts");
          return [];
        }
        const data = await response.json();
        setRecentPosts(data.posts);
      }
      fetchRecentPosts()
    } catch (error) {
      console.error("Error fetching recent posts:", error);
        setError(true);
    }

  },[])





  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] dark:bg-gray-900 dark:text-gray-200">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p className="dark:text-gray-400">
          We couldn't load this post. Please try again later.
        </p>
      </div>
    );

  if (!post)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] dark:bg-gray-900 dark:text-gray-200">
        <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
        <p className="dark:text-gray-400">
          The post you're looking for doesn't exist.
        </p>
      </div>
    );

    const defaultAuthorImage = "https://cdn.pixabay.com/animation/2022/12/05/10/47/10-47-58-930_512.gif";
  const defaultAuthorName = "Anonymous User";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 dark:bg-gray-900">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="mb-8">
            <header className="flex justify-between items-start">
              <div className="flex-1">
                <Link to={`/post/${post.slug}`}>
                  <h1 className="text-4xl font-bold dark:text-white hover:text-blue-600 transition duration-300">
                    {post.title}
                  </h1>
                </Link>

                <div className="mt-4 flex flex-wrap items-center gap-4 dark:text-gray-400">
                  <time className="text-sm">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <Link to={`/search?category=${post && post.category}`}>
                    <Button color="purple" size="xs">
                      {post.category}
                    </Button>
                  </Link>
                  <span className="italic font-semibold text-xs">
                    {post && (post.content.length / 1000).toFixed(0)} mins read
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center ml-4">
                <img
                  src={author?.profilePicture || defaultAuthorImage}
                  alt={author?.userName || defaultAuthorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
                <span className="mt-2 text-sm font-medium dark:text-gray-300">
                  <span className="italic font-bold">Author:</span>{" "}
                  <span className="font-bold">
                  {author?.userName || defaultAuthorName}
                  </span>
                </span>
              </div>
            </header>
          </Card>

          {/* Media Section */}
          {post.mediaUrl && post.mediaType && (
            <Card className="mb-8">
              <MediaDisplay
                mediaType={post.mediaType}
                mediaUrl={post.mediaUrl}
                title={post.title}
              />
            </Card>
          )}

          {/* Content Section */}
          <Card className="mb-8">
            <article className="prose lg:prose-xl max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
          </Card>

          {/* Footer Section */}
          <Card>
            <footer className="dark:text-gray-400">
              <div className="flex justify-between items-center text-sm">
                <div className="flex space-x-4">
                  <span>{totalPosts} Total Posts</span>
                </div>
                <div>
                  Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </footer>
          </Card>
        </div>

        {/* Related Posts Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Related Posts
            </h2>
            <div className="space-y-4">
              {relatedPosts.length > 0 ? (
                relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id}
                    to={`/post/${relatedPost.slug}`}
                    className="block"
                  >
                    <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-300">
                      <div className="flex space-x-4">
                        <RelatedPostMedia post={relatedPost} />
                        <div>
                          <h3 className="font-semibold dark:text-white mb-2">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm dark:text-gray-400 line-clamp-2">
                            {relatedPost.content
                              .replace(/<[^>]*>/g, "")
                              .slice(0, 100)}
                            ...
                          </p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))
              ) : (
                <p className="text-center dark:text-gray-400">
                  No related posts found
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
      <div className="max-w-4xl mx-auto w-full">
      <HeroAction/>
      </div>
      <CommentSection postId={post._id}/>
      <div className="flex flex-col justify-center items-center mb-5 w-full">
  <h1 className="text-2xl font-bold mt-8 mb-6 dark:text-white">
    Recent Articles
  </h1>
  <div className="md:hidden text-sm text-gray-500 mb-4 flex items-center gap-2">
  <ArrowRight className="w-4 h-4 animate-bounce" />
  Swipe to see more
</div>
  {/* Container with horizontal scroll on mobile */}
  <div className="w-full px-4">
    <div className="flex overflow-x-auto gap-4 pb-4 md:gap-8 
      snap-x snap-mandatory
      md:grid md:grid-cols-2 lg:grid-cols-3 
      no-scrollbar">
      {recentPosts && recentPosts.map((post) => (
        <div key={post._id} className="w-[85vw] flex-shrink-0 snap-center md:w-full">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  </div>
</div>
    </div>
  );
};

export default PostPage;

{
  /* <div className="flex items-center gap-2">
                                    <ShareButton post={post} />
                                    <LikeButton post={post} />
                                    <CommentButton post={post} /></div> */
}
