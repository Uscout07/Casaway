'use client';
import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
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

  // Handle tab change with mobile menu closing
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setEditingListingId(null);
    setIsMobileMenuOpen(false); // Close mobile menu when tab changes
  };

  const tabItems = [
    { id: 'profile', icon: 'mdi:account-outline', label: 'Profile' },
    { id: 'posts', icon: 'mdi:post-outline', label: 'My Posts' },
    { id: 'security', icon: 'mdi:security', label: 'Security' },
    { id: 'notifications', icon: 'mdi:bell-outline', label: 'Notifications' }
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
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                  <p className="text-forest text-lg">Loading...</p>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-forest mb-4 sm:mb-6">Profile Settings</h2>
                  <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="sm:col-span-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        {errors.name && <p className="text-coral text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        {errors.phone && <p className="text-coral text-xs mt-1">{errors.phone}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
                        <input
                          type="text"
                          id="profilePic"
                          name="profilePic"
                          value={profileData.profilePic}
                          onChange={handleProfileChange}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                        {errors.profilePic && <p className="text-coral text-xs mt-1">{errors.profilePic}</p>}
                        {profileData.profilePic && (
                          <div className="mt-4 flex justify-center sm:justify-start">
                            <img src={profileData.profilePic} alt="Profile Preview" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                    {errors.general && <p className="text-coral text-sm mt-2">{errors.general}</p>}
                    <div className="flex justify-center sm:justify-start">
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-forest-medium hover:forest text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors duration-200"
                        disabled={loading}
                      >
                        Save Changes
                      </button>
                    </div>
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
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-forest mb-4 sm:mb-6">Security Settings</h2>
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

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-forest mb-4">Notification Settings</h2>
                  <p className="text-gray-600 mb-6">Manage your notification preferences here.</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <span className="text-gray-700 font-medium">Email notifications</span>
                      <label htmlFor="email-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="email-toggle" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-medium"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <span className="text-gray-700 font-medium">SMS notifications</span>
                      <label htmlFor="sms-toggle" className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="sms-toggle" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-medium"></div>
                      </label>
                    </div>
                  </div>
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
    </div>
  );
};

export default SettingsPage;