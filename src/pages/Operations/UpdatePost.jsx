import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button, TextInput, Select, Card, Tooltip } from 'flowbite-react';
import { ImagePlus, VideoIcon, Eye, Send, X, PlusCircle } from 'lucide-react';
import summaryApi from '../../common';
import { useSelector } from 'react-redux';
import { deleteFile, uploadMedia } from '../../utils/supabaseStorage';
import { useNavigate, useParams } from 'react-router-dom';


const categories = [
  { value: 'technology', label: 'Technology' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'politics', label: 'Politics' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'sports', label: 'Sports' },
  { value: 'food', label: 'Food & Cooking' },
  { value: 'travel', label: 'Travel' },
  { value: 'education', label: 'Education' }
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; 

function UpdatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const { currentUser } = useSelector((state)=> state.user)

  const navigate = useNavigate()
  const { postId } = useParams();
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const editorRef = useRef(null);

  const [formData, setFormData ] = useState({
    title,
    content,
    category,
    media,
    mediaType,
    mediaPreview,
    isPreviewMode,    
   
  })



  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`${summaryApi.getAllPosts.url}?postId=${postId}`, {
          method: summaryApi.getAllPosts.method
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          const post = data.posts[0];
          // Populate all form fields
          setTitle(post.title);
          setContent(post.content);
          setCategory(post.category);
          if (post.mediaUrl) {
            setMediaPreview(post.mediaUrl);
            setMediaType(post.mediaType);
            // Set media with the existing URL
            setMedia({
              url: post.mediaUrl,
              type: post.mediaType
            });
          }
        }
      } catch (error) {
        setError('Error fetching post: ' + error.message);
      }
    };
  
    if (postId) {
      fetchPost();
    }
  }, [postId]);



  const handleMediaSelect = useCallback((type) => {
    if (type === 'image') {
      imageInputRef.current?.click();
    } else if (type === 'video') {
      videoInputRef.current?.click();
    }
  }, []);

  const validateFile = useCallback((file, type) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size should be less than 50MB');
    }

    if (type === 'image' && !file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }
    if (type === 'video' && !file.type.startsWith('video/')) {
      throw new Error('Please select a video file');
    }
  }, []);

  const handleFileChange = useCallback((e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file, type);
      
      setError('');
      setMedia(file);
      setMediaType(type);
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  }, [validateFile]);


  const handleMediaUpload = async (file, type) => {
    try {
      setLoading(true);
      setError('');
      
      // Show upload progress (optional)
      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      const { url, path, type: mediaType } = await uploadMedia(file, 'jobs-board-public');
      
      setMedia({
        url,
        path,
        type: mediaType
      });
      setMediaPreview(url);
      setMediaType(type);
      setError('');
      
    } catch (err) {
      setError('Error uploading media: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!currentUser) {
        setError('You must be logged in to update a post');
        return;
    }

    try {
        setLoading(true);
        setError('');

        // Handle media upload if there's a new file
        let mediaData = { url: media?.url || '', type: mediaType };
        if (media instanceof File) {
            try {
                const uploadedMedia = await uploadMedia(media, 'jobs-board-public');
                mediaData = { url: uploadedMedia.url, type: mediaType };
            } catch (uploadError) {
                throw new Error(`Media upload failed: ${uploadError.message}`);
            }
        }

        // Prepare update data
        const updateData = {
            title,
            content,
            category,
            mediaType: mediaData.type,
            mediaUrl: mediaData.url,
        };

        // Replace both postId and userId in the URL
        const updateUrl = summaryApi.updatePost.url
            .replace(':postId', postId)
            .replace(':userId', currentUser.rest._id);

        const response = await fetch(updateUrl, {
            method: summaryApi.updatePost.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        // Redirect to the updated post
        navigate(`/post/${data?.post?.slug}`);

    } catch (error) {
        setError(error.message || 'Error updating post');
    } finally {
        setLoading(false);
    }
};
        // navigate(`/post/${data?.post?.slug}`);
      

  const VideoPreview = ({ src }) => (
    <div className="relative">
      <video 
        className="max-w-full h-auto rounded"
        controls
        preload="metadata"
      >
        <source src={src} />
        Your browser does not support the video tag.
      </video>
    </div>
  );


  const MediaPreview = () => {
    if (!mediaPreview) return null;
    
    return (
      <div className="relative inline-block mb-4">
        {mediaType === 'image' ? (
          <img
            src={mediaPreview}
            alt="Preview"
            className="max-h-60 rounded"
          />
        ) : (
          <VideoPreview src={mediaPreview} />
        )}
        <button
          type="button"
          onClick={clearMedia}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  };



  const clearMedia = useCallback(() => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMedia(null);
    setMediaPreview('');
    setMediaType('');
    setError('');
  }, [mediaPreview]);


  const editorConfig = {
      height: 400,
      menubar: false,
      plugins: [
        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
        'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
      ],
      toolbar: 'undo redo | blocks | ' +
        'bold italic forecolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'removeformat | help',
      content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
      
      // File picker for inline media
      file_picker_types: 'image media',
      file_picker_callback: (callback, value, meta) => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        
        if (meta.filetype === 'image') {
          input.setAttribute('accept', 'image/*');
        } else if (meta.filetype === 'media') {
          input.setAttribute('accept', 'video/*');
        }
  
        input.onchange = async function() {
          const file = this.files[0];
          
          try {
            const uploadedMedia = await uploadMedia(file, 'jobs-board-public');
            
            callback(uploadedMedia.url, { 
              alt: file.name,
              title: file.name
            });
          } catch (error) {
            console.error('Media upload failed', error);
          }
        };
  
        input.click();
      },
      
      // Image upload handler
      images_upload_handler: async (blobInfo, progress) => {
        try {
          const file = blobInfo.blob();
          const uploadedMedia = await uploadMedia(file, 'jobs-board-public');
          return uploadedMedia.url;
        } catch (error) {
          throw new Error('Image upload failed: ' + error.message);
        }
      },
      
      // Media handling configuration
      media_live_embeds: true,
      media_alt_source: true,
      media_poster: true,
      
      // Touch and performance settings
      touch_scrolling: true,
      event_options: {
        touchstart: { passive: true },
        touchmove: { passive: true }
      },
      cache_suffix: '?v=' + Date.now(),
      element_format: 'html',
      entity_encoding: 'raw',
      convert_urls: false,
      remove_script_host: true
    };
  
    // Function to insert media directly into the editor
    const insertInlineMedia = (type) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', type === 'image' ? 'image/*' : 'video/*');
  
      input.onchange = async function() {
        const file = this.files[0];
        
        try {
          const uploadedMedia = await uploadMedia(file, 'jobs-board-public');
          
          // Insert media at the current cursor position
          const editor = editorRef.current;
          if (editor) {
            const mediaTag = type === 'image' 
              ? `<img src="${uploadedMedia.url}" alt="${file.name}" />`
              : `<video controls src="${uploadedMedia.url}"></video>`;
            
            editor.insertContent(mediaTag);
          }
        } catch (error) {
          console.error('Inline media upload failed', error);
        }
      };
  
      input.click();
    };


  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Update Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <TextInput
                  type="text"
                  placeholder="Post Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mb-4"
                />

<div className="mb-4">
  <Editor
    apiKey="wcy1en51no7jbupu87xflw5k7fq6cnbg3cw2pzy4xf2bp0c5"
    onInit={(evt, editor) => editorRef.current = editor}
    value={content}
    onEditorChange={(newContent) => setContent(newContent)}
    init={{
      ...editorConfig,
      // Add custom styles to make inline images and videos smaller
      content_style: `
        ${editorConfig.content_style}
        img, video {
          max-width: 200px !important;
          max-height: 150px !important;
          object-fit: contain;
          display: inline-block;
          margin: 5px;
        }
      `
    }}
  />
  
  {/* Inline media insertion button */}
  <div className="flex items-center mt-2 space-x-2">
    <Tooltip content="Insert Image in Text">
      <Button 
        size="sm" 
        color="light" 
        onClick={() => insertInlineMedia('image')}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Image
      </Button>
    </Tooltip>
    <Tooltip content="Insert Video in Text">
      <Button 
        size="sm" 
        color="light" 
        onClick={() => insertInlineMedia('video')}
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Video
      </Button>
    </Tooltip>
  </div>
</div>

                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="mb-4"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Select>

                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    onClick={() => handleMediaSelect('image')}
                    size="sm"
                  >
                    <ImagePlus className="mr-2 h-5 w-5" />
                    Add Image
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleMediaSelect('video')}
                    size="sm"
                  >
                    <VideoIcon className="mr-2 h-5 w-5" />
                    Add Video
                  </Button>
                </div>

                {error && (
                  <div className="text-red-500 text-sm mb-4">
                    {error}
                  </div>
                )}

                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, 'image')}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleFileChange(e, 'video')}
                  accept="video/*"
                  className="hidden"
                />

                {mediaPreview && (
                  <div className="relative inline-block mb-4">
                    {mediaType === 'image' ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-h-60 rounded"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-h-60 rounded"
                      />
                    )}
                    <button
                      type="button"
                      onClick={clearMedia}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button
                    type="button"
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    outline
                    size="sm"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    {isPreviewMode ? 'Edit' : 'Preview'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    gradientDuoTone="purpleToBlue"
                    size="sm"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    {loading ? 'Updating...' : 'Update Post'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {isPreviewMode ? (
              <div className="prose max-w-none">
                <h1>{title || 'Post Title'}</h1>
                {mediaPreview && (
                  <div className="mb-4">
                    {mediaType === 'image' ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="rounded"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="rounded"
                      />
                    )}
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: content }} />
                {category && (
                  <div className="mt-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {categories.find(cat => cat.value === category)?.label}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Click the Preview button to see how your post will look
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;