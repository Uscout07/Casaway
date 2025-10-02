'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import PostModal from '../components/postModal';
import ConfirmDialog from '../components/confirmDialog'; // Assuming this path is correct
import UserListingsSection from '../components/UserListingsSection';
import EditListingForm from './editListingForm'; // Import the new form component
import EditPostForm from './editPostform';
import Link from 'next/link'; // Import Link for 'Add New Post' button

type UserData = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  listings?: any[]; // Adjust type as needed
  posts?: any[]; // Adjust type as needed
  followers?: string[];
  following?: string[];
};

type Listing = {
  _id: string;
  title: string;
  thumbnail: string;
  city: string;
  country: string;
  status: 'draft' | 'published';
};

type Post = {
  city: string;
  country: string;
  caption: string;
  imageUrl: string | Blob | undefined;
  _id: string;
  title: string;
  content: string;
  // Add other post properties as needed
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [localDrafts, setLocalDrafts] = useState<{ signup?: any; listing?: any; post?: any; story?: any }>({});
  const [user, setUser] = useState<UserData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'listing' | 'post' | 'account'; id?: string } | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null); // New state for editing
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state

  // Profile edit states
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    phone: '',
    city: '',
    country: '',
    profilePic: ''
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Email code password reset states
  const [codeData, setCodeData] = useState({
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordMethod, setPasswordMethod] = useState<'current' | 'email'>('current');
  const [codeSent, setCodeSent] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const [errors, setErrors] = useState<{ name?: string; username?: string; phone?: string; city?: string; country?: string; profilePic?: string; general?: string }>({});
  const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [codeErrors, setCodeErrors] = useState<{ verificationCode?: string; newPassword?: string; confirmPassword?: string; general?: string }>({});
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCodeNewPassword, setShowCodeNewPassword] = useState(false);
  const [showCodeConfirmPassword, setShowCodeConfirmPassword] = useState(false);

  // Activity states
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [userComments, setUserComments] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  
  // Pagination states
  const [likesPage, setLikesPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const itemsPerPage = 5;

  // Post modal states
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []); // Fetch user data once on component mount

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const signup = localStorage.getItem('draft_signup');
      const listing = localStorage.getItem('draft_listing');
      const post = localStorage.getItem('draft_post');
      const story = localStorage.getItem('draft_story');
      setLocalDrafts({
        signup: signup ? JSON.parse(signup) : undefined,
        listing: listing ? JSON.parse(listing) : undefined,
        post: post ? JSON.parse(post) : undefined,
        story: story ? JSON.parse(story) : undefined,
      });
    } catch {}
  }, [activeTab]);

  const clearLocalDraft = (key: 'signup'|'listing'|'post'|'story') => {
    if (typeof window === 'undefined') return;
    const map: Record<string, string> = {
      signup: 'draft_signup',
      listing: 'draft_listing',
      post: 'draft_post',
      story: 'draft_story',
    };
    localStorage.removeItem(map[key]);
    setLocalDrafts(prev => ({ ...prev, [key]: undefined }));
  };

  useEffect(() => {
    if (user?._id && activeTab === 'listings' && !editingListingId) { // Only fetch if userId available, on listings tab, and NOT editing
      fetchListings();
    }
    if (user?._id && activeTab === 'posts') {
      fetchPosts();
    }
    if (user?._id && activeTab === 'activity') {
      fetchActivityData();
    }
  }, [activeTab, user?._id, editingListingId]); // Re-fetch when activeTab or userId changes, or editing state changes

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.warn('No token found, user not logged in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('User data fetched successfully:', userData);
        console.log('User ID from /me endpoint:', userData._id);

        setUser(userData);
        setProfileData({
          name: userData.name || '',
          username: (userData as any).username || '',
          phone: userData.phone || '',
          city: (userData as any).city || '',
          country: (userData as any).country || '',
          profilePic: userData.profilePic || ''
        });

      } else {
        console.error('Failed to fetch user data:', response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error fetching user data details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    if (!user?._id) return; // Ensure user ID exists before fetching
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setListings(data);
      } else {
        console.error('Failed to fetch listings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId?: string) => {
    if (!listingId) return;
    setShowDeleteConfirm(null); // Close confirmation dialog
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/listing/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Listing deleted successfully!');
        fetchListings(); // Refresh the list of listings
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to delete listing.');
        console.error('Failed to delete listing:', errorData);
      }
    } catch (error) {
      alert('Error deleting listing.');
      console.error('Error deleting listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    if (!user?._id) return; // Ensure user ID exists before fetching
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/user/${user._id}`, { // Assuming this endpoint for user posts
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        console.error('Failed to fetch posts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    if (!user?._id) return;
    setActivityLoading(true);
    setActivityError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Fetch liked posts
      const likedPostsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/likes/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch user comments
      const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });


      if (likedPostsResponse.ok) {
        const likedData = await likedPostsResponse.json();
        // Filter to only show likes on user's own posts/listings
        const filteredLikes = likedData.filter((like: any) => {
          if (like.post && like.post.user) {
            if (like.post.user._id === user._id || like.post.user._id.toString() === user._id.toString()) {
              return true;
            }
          }
          if (like.listing && like.listing.user) {
            if (like.listing.user._id === user._id || like.listing.user._id.toString() === user._id.toString()) {
              return true;
            }
          }
          return false;
        });
        setLikedPosts(filteredLikes.slice(0, itemsPerPage)); // Show first 5 items
        setTotalLikes(filteredLikes.length);
      } else {
        console.error('Failed to fetch liked posts:', likedPostsResponse.statusText);
      }

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        // Filter to only show comments on user's own posts/listings
        const filteredComments = commentsData.filter((comment: any) => {
          if (comment.post && comment.post.user) {
            if (comment.post.user._id === user._id || comment.post.user._id.toString() === user._id.toString()) {
              return true;
            }
          }
          if (comment.listing && comment.listing.user) {
            if (comment.listing.user._id === user._id || comment.listing.user._id.toString() === user._id.toString()) {
              return true;
            }
          }
          return false;
        });
        setUserComments(filteredComments.slice(0, itemsPerPage)); // Show first 5 items
        setTotalComments(filteredComments.length);
      } else {
        console.error('Failed to fetch comments:', commentsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      setActivityError('Failed to load activity data');
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch more likes for pagination
  const fetchMoreLikes = async (page: number) => {
    if (!user?._id) return;
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const likedPostsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/likes/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (likedPostsResponse.ok) {
        const likedData = await likedPostsResponse.json();
        // Filter to only show likes on user's own posts/listings
        const filteredLikes = likedData.filter((like: any) => {
          if (like.post && like.post.user && like.post.user._id === user._id) return true;
          if (like.listing && like.listing.user && like.listing.user._id === user._id) return true;
          return false;
        });
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setLikedPosts(filteredLikes.slice(startIndex, endIndex));
        setLikesPage(page);
      }
    } catch (error) {
      console.error('Error fetching more likes:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch more comments for pagination
  const fetchMoreComments = async (page: number) => {
    if (!user?._id) return;
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        // Filter to only show comments on user's own posts/listings
        const filteredComments = commentsData.filter((comment: any) => {
          if (comment.post && comment.post.user && comment.post.user._id === user._id) return true;
          if (comment.listing && comment.listing.user && comment.listing.user._id === user._id) return true;
          return false;
        });
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setUserComments(filteredComments.slice(startIndex, endIndex));
        setCommentsPage(page);
      }
    } catch (error) {
      console.error('Error fetching more comments:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  // Handle post click to open modal
  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const deletePost = async (postId?: string) => {
    if (!postId) return;
    setShowDeleteConfirm(null); // Close confirmation dialog
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}`, { // Assuming this endpoint for deleting posts
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Post deleted successfully!');
        fetchPosts(); // Refresh the list of posts
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to delete post.');
        console.error('Failed to delete post:', errorData);
      }
    } catch (error) {
      alert('Error deleting post.');
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setShowDeleteConfirm(null); // Close confirmation dialog
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/delete`, { // Assuming this endpoint for deleting user account
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Account deleted successfully!');
        localStorage.removeItem('token'); // Clear token
        sessionStorage.removeItem('token'); // Clear session token
        window.location.href = '/auth'; // Redirect to login page
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to delete account.');
        console.error('Failed to delete account:', errorData);
      }
    } catch (error) {
      alert('Error deleting account.');
      console.error('Error deleting account:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlikePost = async (likeId: string) => {
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/likes/${likeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Post unliked successfully!');
        fetchActivityData(); // Refresh activity data
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to unlike post.');
        console.error('Failed to unlike post:', errorData);
      }
    } catch (error) {
      alert('Error unliking post.');
      console.error('Error unliking post:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Comment deleted successfully!');
        fetchActivityData(); // Refresh activity data
      } else {
        const errorData = await response.json();
        alert(errorData.msg || 'Failed to delete comment.');
        console.error('Failed to delete comment:', errorData);
      }
    } catch (error) {
      alert('Error deleting comment.');
      console.error('Error deleting comment:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeData({ ...codeData, [e.target.name]: e.target.value });
  };

  const sendVerificationCode = async () => {
    setCodeLoading(true);
    setCodeErrors({});

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setCodeErrors({ general: 'Authentication token not found. Please log in again.' });
        setCodeLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/request-password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCodeSent(true);
        alert('Verification code sent to your email!');
      } else {
        setCodeErrors({ general: data.msg || 'Failed to send verification code.' });
      }
    } catch (error) {
      setCodeErrors({ general: 'Network error or unexpected issue.' });
      console.error('Error sending verification code:', error);
    } finally {
      setCodeLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordErrors({});

    // Validation
    if (!passwordData.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' });
      setLoading(false);
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordErrors({ newPassword: 'New password is required' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordErrors({ newPassword: 'New password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setPasswordErrors({ general: 'Authentication token not found. Please log in again.' });
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        if (response.status === 429) {
          setPasswordErrors({ general: errorData.msg || 'Rate limit exceeded. You can change your password 3 times every 24 hours.' });
        } else {
        setPasswordErrors({ general: errorData.msg || 'Failed to change password.' });
        }
      }
    } catch (error) {
      setPasswordErrors({ general: 'Network error or unexpected issue.' });
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCodeErrors({});

    // Validation
    if (!codeData.verificationCode) {
      setCodeErrors({ verificationCode: 'Verification code is required' });
      setLoading(false);
      return;
    }

    if (!codeData.newPassword) {
      setCodeErrors({ newPassword: 'New password is required' });
      setLoading(false);
      return;
    }

    if (codeData.newPassword.length < 6) {
      setCodeErrors({ newPassword: 'New password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    if (codeData.newPassword !== codeData.confirmPassword) {
      setCodeErrors({ confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setCodeErrors({ general: 'Authentication token not found. Please log in again.' });
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verificationCode: codeData.verificationCode,
          newPassword: codeData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Password changed successfully!');
        setCodeData({
          verificationCode: '',
          newPassword: '',
          confirmPassword: ''
        });
        setCodeSent(false);
        setPasswordMethod('current');
      } else {
        if (response.status === 429) {
          setCodeErrors({ general: data.msg || 'Rate limit exceeded. You can change your password 3 times every 24 hours.' });
      } else {
        setCodeErrors({ general: data.msg || 'Failed to change password.' });
        }
      }
    } catch (error) {
      setCodeErrors({ general: 'Network error or unexpected issue.' });
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const onProfileFileSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setProfilePicFile(file);
    setProfileData(prev => ({ ...prev, profilePic: '' }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        // Handle not logged in case, e.g., redirect to login or show an error
        setErrors({ general: 'Authentication token not found. Please log in again.' });
        setLoading(false);
        return;
      }

      // --- FIX APPLIED HERE ---
      // Changed the URL from '/api/users/me' to '/api/users/edit'
      // Changed the method from 'PUT' to 'PATCH'
      const form = new FormData();
      form.append('name', profileData.name);
      form.append('username', profileData.username);
      form.append('phone', profileData.phone);
      form.append('city', profileData.city);
      form.append('country', profileData.country);
      if (profilePicFile) {
        form.append('profilePic', profilePicFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/edit`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });
      // --- END FIX ---

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert('Profile updated successfully!');
        // Optionally, you might want to refresh fetchUserData here if needed
        // fetchUserData();
      } else {
        const errorData = await response.json();
        setErrors(errorData.errors || { general: errorData.msg || 'Failed to update profile.' });
        console.error('Profile update failed:', errorData);
      }
    } catch (error) {
      setErrors({ general: 'Network error or unexpected issue.' });
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };
  // Callback from UserListingsSection to initiate edit
  const handleEditListing = (id: string) => {
    setEditingListingId(id);
    setActiveTab('listings');
  };

  // Callbacks for EditListingForm
  const handleEditFormCancel = () => {
    setEditingListingId(null); // Close the edit form
  };

  const handleEditFormSuccess = () => {
    setEditingListingId(null); // Close the edit form
    fetchListings(); // Refresh the list of listings after successful edit
  };

  // Handle tab change with mobile menu closing
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setEditingListingId(null);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  const tabItems = [
    { id: 'profile', icon: 'mdi:account-outline', label: 'Profile' },
    { id: 'listings', icon: 'mdi:home-city-outline', label: 'My Listings' },
    { id: 'posts', icon: 'mdi:post-outline', label: 'My Posts' },
    { id: 'drafts', icon: 'mdi:file-document-edit-outline', label: 'Drafts' },
    { id: 'activity', icon: 'mdi:heart-outline', label: 'Activity' },
    { id: 'security', icon: 'mdi:security', label: 'Security' }
  ];

  return (
    <div className="min-h-screen bg-ambient font-inter pt-[10vh]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-forest mb-6 sm:mb-8 lg:mb-10">
          Account Settings
        </h1>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Mobile Header with Menu Toggle */}
          <div className="lg:hidden bg-forest-medium p-4 flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">
              {tabItems.find(item => item.id === activeTab)?.label}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-md hover:bg-forest-light hover:text-forest transition-colors"
            >
              <Icon icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"} className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Desktop Sidebar Navigation */}
            <div className="hidden lg:flex lg:w-1/4 bg-forest-medium p-6 flex-col space-y-4">
              {tabItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                    ${activeTab === item.id ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <Icon icon={item.icon} className="w-6 h-6" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
              <div className="lg:hidden bg-forest-medium border-t border-forest-light">
                <div className="px-4 py-2 space-y-1">
                  {tabItems.map((item) => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                        ${activeTab === item.id ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <Icon icon={item.icon} className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 lg:w-3/4 p-4 sm:p-6 lg:p-8 relative">
              {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                  <p className="text-forest text-lg">Loading...</p>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-2">Profile Settings</h2>
                    <p className="text-forest/70">Manage your personal information and preferences</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-ambient/20 overflow-hidden">
                    <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 lg:p-10">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

                        {/* Avatar Section */}
                        <div className="lg:col-span-2">
                          <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-forest/10 bg-gray-100 flex items-center justify-center">
                                {profilePicFile ? (
                                  <img
                                    src={URL.createObjectURL(profilePicFile)}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                ) : profileData.profilePic ? (
                                  <img
                                    src={profileData.profilePic}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  />
                                ) : (
                                  <Icon icon="mdi:account-circle" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                                )}
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-forest p-2 rounded-full shadow-lg">
                                <Icon icon="mdi:camera" className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            {/* Upload Area */}
                            <div
                              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                              onDragLeave={() => setIsDragging(false)}
                              onDrop={(e) => { e.preventDefault(); setIsDragging(false); onProfileFileSelected(e.dataTransfer.files); }}
                              className={`w-full max-w-sm rounded-2xl p-6 text-center transition-all duration-300 border-2 border-dashed ${isDragging
                                  ? 'bg-forest/5 border-forest shadow-lg scale-105'
                                  : 'bg-white border-ambient/40 hover:border-forest/30 hover:bg-forest/[0.02]'
                                }`}
                            >
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center">
                                  <Icon icon="mdi:cloud-upload" className="w-6 h-6 text-forest" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-forest mb-1">Drop your image here</div>
                                  <div className="text-xs text-forest/60 mb-3">PNG, JPG up to 5MB</div>
                                </div>
                                <label className="inline-block group cursor-pointer">
                                  <span className="px-4 py-2 rounded-xl bg-forest text-white text-sm font-medium hover:bg-pine transition-all duration-300 shadow-md hover:shadow-lg group-hover:-translate-y-0.5">
                                    Browse Files
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => onProfileFileSelected(e.target.files)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            {(profilePicFile || profileData.profilePic) && (
                              <button
                                type="button"
                                onClick={() => { setProfilePicFile(null); setProfileData(prev => ({ ...prev, profilePic: '' })); }}
                                className="flex items-center gap-2 text-sm text-coral hover:text-coral/80 transition-colors font-medium"
                              >
                                <Icon icon="mdi:delete-outline" className="w-4 h-4" />
                                Remove photo
                              </button>
                            )}
                            {errors.profilePic && (
                              <div className="bg-coral/10 border border-coral/20 rounded-lg p-3 w-full">
                                <p className="text-coral text-sm font-medium">{errors.profilePic}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="lg:col-span-3 space-y-6">
                          <div className="grid grid-cols-1 gap-6">

                            {/* Name */}
                            <div className="space-y-2">
                              <label htmlFor="name" className="block text-sm font-semibold text-forest">
                                Full Name
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={profileData.name}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                                className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                              />
                              {errors.name && (
                                <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                  <p className="text-coral text-sm font-medium">{errors.name}</p>
                                </div>
                              )}
                            </div>

                            {/* Username */}
                            <div className="space-y-2">
                              <label htmlFor="username" className="block text-sm font-semibold text-forest">
                                Username
                              </label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-forest/60 font-medium">@</span>
                                <input
                                  type="text"
                                  id="username"
                                  name="username"
                                  value={profileData.username}
                                  onChange={handleProfileChange}
                                  placeholder="username"
                                  className="w-full border-2 border-ambient/30 rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                                />
                              </div>
                              {errors.username && (
                                <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                  <p className="text-coral text-sm font-medium">{errors.username}</p>
                                </div>
                              )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                              <label htmlFor="phone" className="block text-sm font-semibold text-forest">
                                Phone Number
                              </label>
                              <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleProfileChange}
                                placeholder="+1 (555) 123-4567"
                                className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                              />
                              {errors.phone && (
                                <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                  <p className="text-coral text-sm font-medium">{errors.phone}</p>
                                </div>
                              )}
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-semibold text-forest">
                                  City
                                </label>
                                <input
                                  type="text"
                                  id="city"
                                  name="city"
                                  value={profileData.city}
                                  onChange={handleProfileChange}
                                  placeholder="New York"
                                  className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                                />
                                {errors.city && (
                                  <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                    <p className="text-coral text-sm font-medium">{errors.city}</p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label htmlFor="country" className="block text-sm font-semibold text-forest">
                                  Country
                                </label>
                                <input
                                  type="text"
                                  id="country"
                                  name="country"
                                  value={profileData.country}
                                  onChange={handleProfileChange}
                                  placeholder="United States"
                                  className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                                />
                                {errors.country && (
                                  <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                    <p className="text-coral text-sm font-medium">{errors.country}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* General Error */}
                      {errors.general && (
                        <div className="mt-8 bg-coral/10 border-l-4 border-coral rounded-r-lg p-4">
                          <div className="flex items-center">
                            <Icon icon="mdi:alert-circle" className="w-5 h-5 text-coral mr-3" />
                            <p className="text-coral font-medium">{errors.general}</p>
                          </div>
                        </div>
                      )}

                      {/* Submit Button */}
                      <div className="mt-10 flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="relative px-8 py-3 bg-forest text-white font-semibold rounded-xl shadow-lg hover:bg-pine transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <div className="flex items-center gap-2">
                            {loading && (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            )}
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                          </div>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Drafts Tab */}
              {activeTab === 'drafts' && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-forest">Drafts</h2>
                    <p className="text-forest/70">Resume or delete your locally saved drafts</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Signup Draft</span>
                        {localDrafts.signup && (<button className="text-sm text-red-600" onClick={() => clearLocalDraft('signup')}>Delete</button>)}
                      </div>
                      {localDrafts.signup ? (
                        <div className="text-sm text-gray-700">
                          <div><strong>Name:</strong> {localDrafts.signup.name || '-'}</div>
                          <div><strong>Username:</strong> {localDrafts.signup.username || '-'}</div>
                          <div><strong>Email:</strong> {localDrafts.signup.email || '-'}</div>
                          <div className="mt-2">
                            <a href="/auth?mode=register" className="text-forest underline">Resume</a>
                          </div>
                        </div>
                      ) : <div className="text-sm text-gray-500">No signup draft saved.</div>}
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Listing Draft</span>
                        {localDrafts.listing && (<button className="text-sm text-red-600" onClick={() => clearLocalDraft('listing')}>Delete</button>)}
                      </div>
                      {localDrafts.listing ? (
                        <div className="text-sm text-gray-700">
                          <div><strong>Title:</strong> {localDrafts.listing.title || '-'}</div>
                          <div><strong>City:</strong> {localDrafts.listing.city || '-'}</div>
                          <div><strong>Country:</strong> {localDrafts.listing.country || '-'}</div>
                          <div className="mt-2">
                            <a href="/upload?mode=listing" className="text-forest underline">Resume</a>
                          </div>
                        </div>
                      ) : <div className="text-sm text-gray-500">No listing draft saved.</div>}
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Post Draft</span>
                        {localDrafts.post && (<button className="text-sm text-red-600" onClick={() => clearLocalDraft('post')}>Delete</button>)}
                      </div>
                      {localDrafts.post ? (
                        <div className="text-sm text-gray-700">
                          <div><strong>City:</strong> {localDrafts.post.city || '-'}</div>
                          <div><strong>Country:</strong> {localDrafts.post.country || '-'}</div>
                          <div className="mt-2">
                            <a href="/upload?mode=post" className="text-forest underline">Resume</a>
                          </div>
                        </div>
                      ) : <div className="text-sm text-gray-500">No post draft saved.</div>}
                    </div>

                    <div className="p-4 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Story Draft</span>
                        {localDrafts.story && (<button className="text-sm text-red-600" onClick={() => clearLocalDraft('story')}>Delete</button>)}
                      </div>
                      {localDrafts.story ? (
                        <div className="text-sm text-gray-700">
                          <div><strong>Caption:</strong> {localDrafts.story.caption || '-'}</div>
                          <div className="mt-2">
                            <a href="/upload?mode=story" className="text-forest underline">Resume</a>
                          </div>
                        </div>
                      ) : <div className="text-sm text-gray-500">No story draft saved.</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* My Listings Tab */}
              {activeTab === 'listings' && (
                editingListingId ? (
                  <EditListingForm
                    listingId={editingListingId}
                    onCancel={handleEditFormCancel}
                    onSuccess={handleEditFormSuccess}
                  />
                ) : (
                  <UserListingsSection
                    listings={listings}
                    loading={loading}
                    onDeleteListing={deleteListing}
                    onShowDeleteConfirm={setShowDeleteConfirm}
                    onEditListing={handleEditListing}
                  />
                )
              )}

              {/* My Posts Tab */}
              {activeTab === 'posts' && (
                editingPostId ? (
                  <EditPostForm
                    postId={editingPostId}
                    onCancel={() => setEditingPostId(null)}
                    onSuccess={() => {
                      setEditingPostId(null);
                      fetchPosts();
                    }}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h2 className="text-2xl sm:text-3xl font-semibold text-forest">My Posts</h2>
                      <Link href="/UploadListingPage?mode=post">
                        <button className="w-full sm:w-auto bg-forest-medium hover:forest text-white py-2 px-4 rounded-lg flex items-center justify-center sm:justify-start">
                          <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                          Create New Post
                        </button>
                      </Link>
                    </div>

                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <Icon icon="mdi:post-outline" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                          You haven't created any posts yet.
                        </p>
                        <Link href="/UploadListingPage?mode=post">
                          <button className="mt-4 text-forest-medium hover:text-forest font-medium">
                            Create your first post
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {posts.map(post => (
                          <div key={post._id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <img
                              src={
                                typeof post.imageUrl === 'string'
                                  ? post.imageUrl
                                  : post.imageUrl
                                    ? URL.createObjectURL(post.imageUrl)
                                    : ''
                              }
                              alt="Post"
                              className="w-full h-48 sm:h-56 object-cover"
                            />

                            <div className="p-4">
                              <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm sm:text-base">
                                {post.caption}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                                {post.city}, {post.country}
                              </p>
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => setEditingPostId(post._id)}
                                  className="text-forest-medium hover:text-forest transition-colors p-1"
                                >
                                  <Icon icon="mdi:pencil" className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm({ type: 'post', id: post._id })}
                                  className="text-coral/90 hover:text-red-800 transition-colors p-1"
                                >
                                  <Icon icon="mdi:delete" className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl sm:text-4xl font-bold text-forest mb-2">Security Settings</h2>
                    <p className="text-forest/70">Manage your account security and password</p>
                  </div>

                  {/* Password Change Method Selection */}
                  <div className="bg-white rounded-2xl shadow-lg border border-ambient/20 overflow-hidden">
                    <div className="p-6 sm:p-8 lg:p-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center">
                          <Icon icon="mdi:lock-outline" className="w-5 h-5 text-forest" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-forest">Change Password</h3>
                          <p className="text-forest/60 text-sm">Choose how you want to change your password</p>
                        </div>
                      </div>

                      {/* Method Selection */}
                      <div className="flex max-md:flex-col gap-4 mb-6">
                        <button
                          type="button"
                          onClick={() => setPasswordMethod('current')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            passwordMethod === 'current'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-forest/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon icon="mdi:key" className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-semibold">Current Password</div>
                              <div className="text-sm opacity-75">Enter your current password</div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPasswordMethod('email')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            passwordMethod === 'email'
                              ? 'border-forest bg-forest/5 text-forest'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-forest/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon icon="mdi:email" className="w-5 h-5" />
                            <div className="text-left">
                              <div className="font-semibold">Email Code</div>
                              <div className="text-sm opacity-75">Get code via email</div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Current Password Method */}
                      {passwordMethod === 'current' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          {/* Current Password */}
                          <div className="space-y-2">
                            <label htmlFor="currentPassword" className="block text-sm font-semibold text-forest">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                id="currentPassword"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your current password"
                                className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest transition-colors"
                              >
                                <Icon 
                                  icon={showCurrentPassword ? "mdi:eye-off" : "mdi:eye"} 
                                  className="w-5 h-5" 
                                />
                              </button>
                            </div>
                            {passwordErrors.currentPassword && (
                              <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                <p className="text-coral text-sm font-medium">{passwordErrors.currentPassword}</p>
                              </div>
                            )}
                          </div>

                          {/* New Password */}
                          <div className="space-y-2">
                            <label htmlFor="newPassword" className="block text-sm font-semibold text-forest">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter your new password"
                                className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest transition-colors"
                              >
                                <Icon 
                                  icon={showNewPassword ? "mdi:eye-off" : "mdi:eye"} 
                                  className="w-5 h-5" 
                                />
                              </button>
                            </div>
                            {passwordErrors.newPassword && (
                              <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                <p className="text-coral text-sm font-medium">{passwordErrors.newPassword}</p>
                              </div>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-forest">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm your new password"
                                className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest transition-colors"
                              >
                                <Icon 
                                  icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"} 
                                  className="w-5 h-5" 
                                />
                              </button>
                            </div>
                            {passwordErrors.confirmPassword && (
                              <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                <p className="text-coral text-sm font-medium">{passwordErrors.confirmPassword}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* General Password Error */}
                        {passwordErrors.general && (
                          <div className="bg-coral/10 border-l-4 border-coral rounded-r-lg p-4">
                            <div className="flex items-center">
                              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-coral mr-3" />
                              <p className="text-coral font-medium">{passwordErrors.general}</p>
                            </div>
                          </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="relative px-8 py-3 bg-forest text-white font-semibold rounded-xl shadow-lg hover:bg-pine transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <div className="flex items-center gap-2">
                              {loading && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              )}
                              {loading ? 'Changing Password...' : 'Change Password'}
                            </div>
                          </button>
                        </div>
                      </form>
                      )}

                      {/* Email Code Method */}
                      {passwordMethod === 'email' && (
                        <div className="space-y-6">
                          {!codeSent ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-forest/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:email-outline" className="w-8 h-8 text-forest" />
                              </div>
                              <h4 className="text-lg font-semibold text-forest mb-2">Send Verification Code</h4>
                              <p className="text-gray-600 mb-6">
                                We'll send a 6-digit verification code to your email address. The code will be valid for 15 minutes.
                              </p>
                              <button
                                onClick={sendVerificationCode}
                                disabled={codeLoading}
                                className="px-6 py-3 bg-forest text-white font-semibold rounded-xl hover:bg-pine transition-colors disabled:opacity-50"
                              >
                                {codeLoading ? 'Sending...' : 'Send Code to Email'}
                              </button>
                              {codeErrors.general && (
                                <div className="mt-4 bg-coral/10 border border-coral/20 rounded-lg p-3">
                                  <p className="text-coral text-sm font-medium">{codeErrors.general}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <form onSubmit={handleCodeSubmit} className="space-y-6">
                              <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600" />
                                </div>
                                <h4 className="text-lg font-semibold text-forest mb-2">Code Sent!</h4>
                                <p className="text-gray-600">
                                  Check your email for the 6-digit verification code.
                                </p>
                              </div>

                              <div className="grid grid-cols-1 gap-6">
                                {/* Verification Code */}
                                <div className="space-y-2">
                                  <label htmlFor="verificationCode" className="block text-sm font-semibold text-forest">
                                    Verification Code
                                  </label>
                                  <input
                                    type="text"
                                    id="verificationCode"
                                    name="verificationCode"
                                    value={codeData.verificationCode}
                                    onChange={handleCodeChange}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40 text-center text-2xl tracking-widest"
                                  />
                                  {codeErrors.verificationCode && (
                                    <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                      <p className="text-coral text-sm font-medium">{codeErrors.verificationCode}</p>
                                    </div>
                                  )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                  <label htmlFor="newPasswordCode" className="block text-sm font-semibold text-forest">
                                    New Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={showCodeNewPassword ? "text" : "password"}
                                      id="newPasswordCode"
                                      name="newPassword"
                                      value={codeData.newPassword}
                                      onChange={handleCodeChange}
                                      placeholder="Enter your new password"
                                      className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCodeNewPassword(!showCodeNewPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest transition-colors"
                                    >
                                      <Icon 
                                        icon={showCodeNewPassword ? "mdi:eye-off" : "mdi:eye"} 
                                        className="w-5 h-5" 
                                      />
                                    </button>
                                  </div>
                                  {codeErrors.newPassword && (
                                    <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                      <p className="text-coral text-sm font-medium">{codeErrors.newPassword}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                  <label htmlFor="confirmPasswordCode" className="block text-sm font-semibold text-forest">
                                    Confirm New Password
                                  </label>
                                  <div className="relative">
                                    <input
                                      type={showCodeConfirmPassword ? "text" : "password"}
                                      id="confirmPasswordCode"
                                      name="confirmPassword"
                                      value={codeData.confirmPassword}
                                      onChange={handleCodeChange}
                                      placeholder="Confirm your new password"
                                      className="w-full border-2 border-ambient/30 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-forest focus:ring-4 focus:ring-forest/10 transition-all duration-300 text-forest placeholder-forest/40"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowCodeConfirmPassword(!showCodeConfirmPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/60 hover:text-forest transition-colors"
                                    >
                                      <Icon 
                                        icon={showCodeConfirmPassword ? "mdi:eye-off" : "mdi:eye"} 
                                        className="w-5 h-5" 
                                      />
                                    </button>
                                  </div>
                                  {codeErrors.confirmPassword && (
                                    <div className="bg-coral/10 border border-coral/20 rounded-lg p-2">
                                      <p className="text-coral text-sm font-medium">{codeErrors.confirmPassword}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* General Code Error */}
                              {codeErrors.general && (
                                <div className="bg-coral/10 border-l-4 border-coral rounded-r-lg p-4">
                                  <div className="flex items-center">
                                    <Icon icon="mdi:alert-circle" className="w-5 h-5 text-coral mr-3" />
                                    <p className="text-coral font-medium">{codeErrors.general}</p>
                                  </div>
                                </div>
                              )}

                              {/* Submit Button */}
                              <div className="flex justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCodeSent(false);
                                    setCodeData({ verificationCode: '', newPassword: '', confirmPassword: '' });
                                    setCodeErrors({});
                                  }}
                                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={loading}
                                  className="relative px-8 py-3 bg-forest text-white font-semibold rounded-xl shadow-lg hover:bg-pine transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                  <div className="flex items-center gap-2">
                                    {loading && (
                                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    )}
                                    {loading ? 'Changing Password...' : 'Change Password'}
                                  </div>
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 sm:p-6 rounded-md">
                    <div className="flex items-start sm:items-center">
                      <Icon icon="mdi:warning" className="w-6 h-6 text-coral/90 mr-3 flex-shrink-0 mt-1 sm:mt-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h3>
                        <p className="text-sm text-coral mb-4">
                          Deleting your account is irreversible. All your data, listings, and posts will be permanently removed.
                        </p>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'account' })}
                          className="w-full sm:w-auto bg-coral/90 hover:bg-coral text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-forest mb-4 sm:mb-6">Activity</h2>
                  
                  {activityLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-8 h-8 border-4 border-forest/30 border-t-forest rounded-full animate-spin"></div>
                      <span className="ml-3 text-forest">Loading activity...</span>
                    </div>
                  ) : activityError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-3" />
                        <p className="text-red-600">{activityError}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Liked Posts Section */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Icon icon="mdi:heart" className="w-6 h-6 text-red-500 mr-3" />
                          <h3 className="text-xl font-semibold text-forest">Likes on My Content</h3>
                          <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {likedPosts.length}
                          </span>
                        </div>
                        
                        {likedPosts.length === 0 ? (
                          <div className="text-center py-8">
                            <Icon icon="mdi:heart-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No one has liked your posts or listings yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {likedPosts.map((like) => (
                              <div key={like._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <img
                                        src={
                                          like.post?.imageUrl || 
                                          (like.listing?.images && like.listing.images[0]) || 
                                          '/placeholder-image.jpg'
                                        }
                                        alt={like.post ? "Post" : "Listing"}
                                        className="w-16 h-16 object-cover rounded-lg mr-4"
                                      />
                                      <div>
                                        <h4 className="font-medium text-forest">
                                          {like.post?.caption || like.listing?.title || 'Item'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Liked on {new Date(like.createdAt).toLocaleDateString()}
                                        </p>
                                        {(like.post?.user || like.listing?.user) && (
                                          <p className="text-sm text-gray-500">
                                            by {(like.post?.user || like.listing?.user)?.name || (like.post?.user || like.listing?.user)?.username}
                                          </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {like.post ? 'Post' : like.listing ? 'Listing' : 'Comment'}
                                          </span>
                                          {like.post && (
                                            <button
                                              onClick={() => handlePostClick(like.post)}
                                              className="text-xs text-forest hover:text-forest/80 underline"
                                            >
                                              View Post
                                            </button>
                                          )}
                                          {like.listing && (
                                            <button
                                              onClick={() => window.open(`/listing/${like.listing._id}`, '_blank')}
                                              className="text-xs text-forest hover:text-forest/80 underline"
                                            >
                                              View Listing
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => unlikePost(like._id)}
                                    disabled={activityLoading}
                                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Unlike item"
                                  >
                                    <Icon icon="mdi:heart" className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Pagination for Liked Posts */}
                        {totalLikes > itemsPerPage && (
                          <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Showing {((likesPage - 1) * itemsPerPage) + 1} to {Math.min(likesPage * itemsPerPage, totalLikes)} of {totalLikes} likes
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => fetchMoreLikes(likesPage - 1)}
                                disabled={likesPage === 1 || activityLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <span className="px-3 py-1 text-sm bg-forest text-white rounded-md">
                                {likesPage}
                              </span>
                              <button
                                onClick={() => fetchMoreLikes(likesPage + 1)}
                                disabled={likesPage * itemsPerPage >= totalLikes || activityLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comments Section */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <Icon icon="mdi:comment" className="w-6 h-6 text-blue-500 mr-3" />
                          <h3 className="text-xl font-semibold text-forest">Comments on My Content</h3>
                          <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                            {userComments.length}
                          </span>
                        </div>
                        
                        {userComments.length === 0 ? (
                          <div className="text-center py-8">
                            <Icon icon="mdi:comment-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">You haven't commented on your own posts or listings yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {userComments.map((comment) => (
                              <div key={comment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-gray-800 mb-2">{comment.text}</p>
                                    <div className="text-sm text-gray-600">
                                      <p>Posted on {new Date(comment.createdAt).toLocaleDateString()}</p>
                                      {comment.post && (
                                        <div className="flex items-center gap-2">
                                          <p>on post: {comment.post.caption || 'Post'}</p>
                                          <button
                                            onClick={() => handlePostClick(comment.post)}
                                            className="text-xs text-forest hover:text-forest/80 underline"
                                          >
                                            View Post
                                          </button>
                                        </div>
                                      )}
                                      {comment.listing && (
                                        <div className="flex items-center gap-2">
                                          <p>on listing: {comment.listing.title || 'Listing'}</p>
                                          <button
                                            onClick={() => window.open(`/listing/${comment.listing._id}`, '_blank')}
                                            className="text-xs text-forest hover:text-forest/80 underline"
                                          >
                                            View Listing
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => deleteComment(comment._id)}
                                    disabled={activityLoading}
                                    className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete comment"
                                  >
                                    <Icon icon="mdi:delete" className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Pagination for Comments */}
                        {totalComments > itemsPerPage && (
                          <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Showing {((commentsPage - 1) * itemsPerPage) + 1} to {Math.min(commentsPage * itemsPerPage, totalComments)} of {totalComments} comments
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => fetchMoreComments(commentsPage - 1)}
                                disabled={commentsPage === 1 || activityLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Previous
                              </button>
                              <span className="px-3 py-1 text-sm bg-forest text-white rounded-md">
                                {commentsPage}
                              </span>
                              <button
                                onClick={() => fetchMoreComments(commentsPage + 1)}
                                disabled={commentsPage * itemsPerPage >= totalComments || activityLoading}
                                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              )}

              {/* User Info Section */}
              <div className="mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-forest mb-4">Your Information</h3>
                {user && (
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="flex-shrink-0">
                      {user.profilePic ? (
                        <img src={user.profilePic} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-teal-500" />
                      ) : (
                        <Icon icon="mdi:account-circle" className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-lg font-medium text-gray-800">{user.name}</p>
                      <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
                      {user.phone && <p className="text-gray-600 text-sm sm:text-base">Phone: {user.phone}</p>}
                      <div className="grid grid-cols-2 sm:flex sm:space-x-6 gap-2 sm:gap-0 text-sm text-gray-500 mt-3">
                        <p><strong>Listings:</strong> {listings.length}</p>
                        <p><strong>Posts:</strong> {posts.length}</p>
                        <p><strong>Followers:</strong> {user.followers?.length || 0}</p>
                        <p><strong>Following:</strong> {user.following?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showDeleteConfirm?.type === 'listing'}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => deleteListing(showDeleteConfirm?.id)}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm?.type === 'post'}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => deletePost(showDeleteConfirm?.id)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        type="danger"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm?.type === 'account'}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={deleteAccount}
        title="Delete Account"
        message="Are you absolutely sure? This will permanently delete your account and all associated data including posts, listings, and messages. This action cannot be undone."
        type="danger"
      />

      {/* Post Modal */}
      {selectedPost && modalOpen && (
        <PostModal
          post={selectedPost}
          modalOpen={modalOpen}
          onClose={() => {
            setSelectedPost(null);
            setModalOpen(false);
          }}
          token={typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}
        />
      )}
    </div>
  );
};

export default SettingsPage;