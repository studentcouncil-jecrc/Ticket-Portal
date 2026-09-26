import React, { useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function CreateAdmin({ onClose, onAdminCreated }) {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/createAdmin`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Admin created:", response.data);

      setSuccess("Admin created successfully.");

      setFormData({
        name: '',
        email: '',
        password: '',
        role: ''
      });

      if (onAdminCreated) {
        onAdminCreated(response.data.admin);
      }

    } catch (error) {
      console.error(
        "Create admin error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.msg ||
        "Failed to create admin"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">

        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create Admin
            </h2>

            <p className="text-sm text-gray-500">
              Create a new administrator account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 text-xl"
          >
            ×
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={50}
              placeholder="Admin name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Role
            </label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select role
              </option>

              <option value="admin">
                Admin
              </option>

              <option value="superadmin">
                Superadmin
              </option>
            </select>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              {success}
            </p>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader />}
              {loading ? "Creating..." : "Create Admin"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateAdmin;