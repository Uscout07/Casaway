'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import ConfirmDialog from '../components/confirmDialog'; // Assuming this path is correct
import UserListingsSection from '../components/UserListingsSection';
import EditListingForm from '../components/EditListingForm'; // Import the new form component
import EditPostForm from '../components/editPostform';
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
  const [user, setUser] = useState<UserData | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'listing' | 'post' | 'account'; id?: string } | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null); // New state for editing

  // Profile edit states
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    profilePic: ''
  });

  const [errors, setErrors] = useState<{ name?: string; phone?: string; profilePic?: string; general?: string }>({});

  useEffect(() => {
    fetchUserData();
  }, []); // Fetch user data once on component mount

  useEffect(() => {
    if (user?._id && activeTab === 'listings' && !editingListingId) { // Only fetch if userId available, on listings tab, and NOT editing
      fetchListings();
    }
    if (user?._id && activeTab === 'posts') {
      fetchPosts();
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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const userData = await response.json();
      console.log('User data fetched successfully:', userData);
      console.log('User ID from /me endpoint:', userData._id);

      setUser(userData);
      setProfileData({
        name: userData.name || '',
        phone: userData.phone || '',
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/me`, { // Assuming this endpoint for deleting user account
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Account deleted successfully!');
        localStorage.removeItem('token'); // Clear token
        sessionStorage.removeItem('token'); // Clear session token
        window.location.href = '/login'; // Redirect to login page
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/edit`, {
      method: 'PATCH', // Use PATCH for partial updates to the authenticated user's profile
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData) // profileData should contain the fields you want to update
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
    // No need to change tab here, as the form will replace the listings list.
  };

  // Callbacks for EditListingForm
  const handleEditFormCancel = () => {
    setEditingListingId(null); // Close the edit form
  };

  const handleEditFormSuccess = () => {
    setEditingListingId(null); // Close the edit form
    fetchListings(); // Refresh the list of listings after successful edit
  };


  return (
    <div className="min-h-screen bg-ambient font-inter pt-[10vh]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-forest mb-10">Account Settings</h1>

        <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4 bg-forest-medium p-6 flex flex-col space-y-4">
            <button
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${activeTab === 'profile' ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
              onClick={() => { setActiveTab('profile'); setEditingListingId(null); }} // Close edit form when changing tabs
            >
              <Icon icon="mdi:account-outline" className="w-6 h-6" />
              <span className="font-medium">Profile</span>
            </button>
            <button
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${activeTab === 'listings' ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
              onClick={() => setActiveTab('listings')}
            >
              <Icon icon="mdi:home-city-outline" className="w-6 h-6" />
              <span className="font-medium">My Listings</span>
            </button>
            <button
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${activeTab === 'posts' ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
              onClick={() => { setActiveTab('posts'); setEditingListingId(null); }} // Close edit form when changing tabs
            >
              <Icon icon="mdi:post-outline" className="w-6 h-6" />
              <span className="font-medium">My Posts</span>
            </button>
            <button
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${activeTab === 'security' ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
              onClick={() => { setActiveTab('security'); setEditingListingId(null); }} // Close edit form when changing tabs
            >
              <Icon icon="mdi:security" className="w-6 h-6" />
              <span className="font-medium">Security</span>
            </button>
            <button
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200
                ${activeTab === 'notifications' ? 'bg-forest-light text-forest' : 'text-white hover:bg-forest-light hover:text-forest'}`}
              onClick={() => { setActiveTab('notifications'); setEditingListingId(null); }} // Close edit form when changing tabs
            >
              <Icon icon="mdi:bell-outline" className="w-6 h-6" />
              <span className="font-medium">Notifications</span>
            </button>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4 p-8">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <p className="text-forest text-lg">Loading...</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-forest mb-6">Profile Settings</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.name && <p className="text-coral text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.phone && <p className="text-coral text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                    <input
                      type="text"
                      id="profilePic"
                      name="profilePic"
                      value={profileData.profilePic}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                    {errors.profilePic && <p className="text-coral text-xs mt-1">{errors.profilePic}</p>}
                    {profileData.profilePic && (
                      <img src={profileData.profilePic} alt="Profile Preview" className="mt-4 w-24 h-24 rounded-full object-cover" />
                    )}
                  </div>
                  {errors.general && <p className="text-coral text-sm mt-2">{errors.general}</p>}
                  <button
                    type="submit"
                    className="bg-forest-medium hover:forest text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                    disabled={loading}
                  >
                    Save Changes
                  </button>
                </form>
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
                  onEditListing={handleEditListing} // Pass the new handler
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
                  <h2 className="text-3xl font-semibold text-forest mb-6">My Posts</h2>

                  {posts.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      You haven't created any posts yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {posts.map(post => (
                        <div key={post._id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                          <img
                            src={post.imageUrl}
                            alt="Post"
                            className="w-full h-48 object-cover rounded-md mb-4"
                          />
                          <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">
                            {post.caption}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {post.city}, {post.country}
                          </p>
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingPostId(post._id)}
                              className="text-forest-medium hover:text-forest transition-colors"
                            >
                              <Icon icon="mdi:pencil" className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm({ type: 'post', id: post._id })}
                              className="text-coral/90 hover:text-red-800 transition-colors"
                            >
                              <Icon icon="mdi:delete" className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Link href="/UploadListingPage?mode=post">
                    <button className="mt-6 bg-forest-medium hover:forest text-white py-2 px-4 rounded-lg flex items-center">
                      <Icon icon="mdi:plus" className="w-5 h-5 mr-2" />
                      Create New Post
                    </button>
                  </Link>
                </div>
              )
            )}



            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-forest mb-6">Security Settings</h2>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                  <div className="flex items-center">
                    <Icon icon="mdi:warning" className="w-6 h-6 text-coral/90 mr-3" />
                    <h3 className="text-lg font-bold text-red-800">Danger Zone</h3>
                  </div>
                  <p className="mt-2 text-sm text-coral">
                    Deleting your account is irreversible. All your data, listings, and posts will be permanently removed.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm({ type: 'account' })}
                    className="mt-4 bg-coral/90 hover:bg-coral text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-forest mb-4">Notification Settings</h2>
                <p className="text-gray-600">Manage your notification preferences here.</p>
                {/* Example notification settings */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-700">Email notifications</span>
                  <label htmlFor="email-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="email-toggle" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-medium"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-3 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-700">SMS notifications</span>
                  <label htmlFor="sms-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="sms-toggle" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-medium"></div>
                  </label>
                </div>
              </div>
            )}

            {/* User Info (Visible in all tabs, perhaps conditionally render or move) */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-forest mb-4">Your Information</h3>
              {user && (
                <div className="flex items-center space-x-6">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-teal-500" />
                  ) : (
                    <Icon icon="mdi:account-circle" className="w-20 h-20 text-gray-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-800">{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                    {user.phone && <p className="text-gray-600">Phone: {user.phone}</p>}
                    <div className="flex space-x-4 text-sm text-gray-500 mt-2">
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
    </div>
  );
};

export default SettingsPage;