'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { LogOut } from 'lucide-react';
import Image from 'next/image';

interface UserData {
  email: string;
  isVerified: boolean;
  avatar?: { public_id: string; url: string };
}

export default function Profile() {
  const { userRole, userName, userAvatar, isLoading, logout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Profile: useEffect triggered, userRole:', userRole, 'isLoading:', isLoading);
    if (userRole && !isLoading) {
      const endpoint = userRole === 'admin' ? '/api/v1/admin/me' : '/api/v1/user/me';
      const token = Cookies.get('access_token');
      console.log('Profile: Fetching', endpoint, 'with token:', token ? 'present' : 'missing');
      fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error ${res.status}`);
          }
          return res.json();
        })
        .then((data: { success: boolean; user?: UserData; message?: string }) => {
          console.log('Profile API response:', JSON.stringify(data, null, 2));
          if (data.success && data.user) {
            setUserData({
              email: data.user.email,
              isVerified: data.user.isVerified,
              avatar: data.user.avatar,
            });
            setError(null);
          } else {
            console.error('Profile: Failed to fetch user data:', data.message);
            setUserData(null);
            setError(data.message || 'Failed to load profile data');
          }
        })
        .catch((error: Error) => {
          console.error('Profile: Error fetching user data:', error.message);
          setUserData(null);
          setError('Error loading profile data');
        });
    }
  }, [userRole, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg text-gray-700">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 transform transition-all hover:scale-105">
        <div className="flex flex-col items-center">
          {userAvatar ? (
            <Image
              src={userAvatar.url}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold mb-4">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Profile</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg w-full text-center">
              {error}
            </div>
          )}

          {!userData && !error && (
            <div className="flex items-center justify-center mb-4">
              <svg
                className="animate-spin h-8 w-8 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            </div>
          )}

          {userData && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-800 font-semibold">
                  {userName || 'Unknown User'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-800 font-semibold">{userData.email}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Role:</span>
                <span className="text-gray-800 font-semibold capitalize">{userRole}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Verified:</span>
                <span
                  className={`font-semibold ${
                    userData.isVerified ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {userData.isVerified ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="mt-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}