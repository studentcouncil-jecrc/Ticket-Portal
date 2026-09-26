import React, { useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function CreateStudent({ onClose, onStudentCreated }) {

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    branch: '',
    Year: ''
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
        `${API_URL}/createStudent`,
        {
          name: formData.name.trim(),
          studentId: formData.studentId.trim(),
          email: formData.email.trim(),
          branch: formData.branch,
          Year: Number(formData.Year)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Student created:", response.data);

      setSuccess("Student created successfully.");

      setFormData({
        name: '',
        studentId: '',
        email: '',
        branch: '',
        Year: ''
      });

      if (onStudentCreated) {
        onStudentCreated(response.data.student);
      }

    } catch (error) {
      console.error(
        "Create student error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.msg ||
        "Failed to create student"
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
              Add Student
            </h2>

            <p className="text-sm text-gray-500">
              Enter student details below.
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Student name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Roll No
            </label>

            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Roll number"
            />
          </div>

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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Branch
            </label>

            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select branch</option>
              <option value="CSE">CSE</option>
              <option value="CSAI">CSAI</option>
              <option value="AIDS">AIDS</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EE">EE</option>
              <option value="ME">ME</option>
              <option value="CE">CE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Year
            </label>

            <select
              name="Year"
              value={formData.Year}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

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
              {loading ? "Creating..." : "Create Student"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateStudent;