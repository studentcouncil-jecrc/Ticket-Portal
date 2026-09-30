import React, { useState } from "react";
import axios from "axios";
import Loader from "./Loader";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function CreateAppAdmin({ onClose, onAppAdminCreated }) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      alert("Name, email and password are required");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/createAppAdmin`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(
        response.data?.msg ||
        "App admin created successfully"
      );

      onAppAdminCreated();

    } catch (error) {

      console.error(
        "Create app admin failed:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.msg ||
        "Failed to create app admin"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Create App Admin
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Create an account for the scanner app
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-900 text-2xl"
          >
            ×
          </button>

        </div>


        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              disabled={loading}
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>


          {/* EMAIL */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={loading}
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>


          {/* PASSWORD */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              disabled={loading}
              className="w-full px-4 py-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>


          {/* BUTTONS */}

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >

              {loading && <Loader />}

              {loading
                ? "Creating..."
                : "Create App Admin"
              }

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateAppAdmin;