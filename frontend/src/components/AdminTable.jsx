import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function AdminTable() {

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/getAdmins`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Admins:", response.data);

      setAdmins(response.data.admins || []);

    } catch (error) {
      console.error(
        "Failed to fetch admins:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this admin?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${API_URL}/deleteAdmin`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            id
          }
        }
      );

      console.log("Delete admin:", response.data);

      setAdmins(prev =>
        prev.filter(admin => admin._id !== id)
      );

    } catch (error) {
      console.error(
        "Delete admin failed:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.msg ||
        "Failed to delete admin"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-sm p-6">

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Admins
        </h2>

        <p className="text-sm text-gray-500">
          Manage administrators.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">

        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Name
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Email
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Role
                </th>

                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {admins.length === 0 ? (

                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-10 text-gray-500"
                  >
                    No admins found
                  </td>
                </tr>

              ) : (

                admins.map(admin => (

                  <tr key={admin._id}>

                    <td className="px-4 py-3 text-sm text-gray-900">
                      {admin.name}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {admin.email}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span className="capitalize">
                        {admin.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">

                      {admin.role === "superadmin" ? (

                        <span className="text-sm text-gray-400">
                          Protected
                        </span>

                      ) : (

                        <button
                          onClick={() => handleDelete(admin._id)}
                          className="px-3
                          py-1.5
                          text-sm
                          rounded-lg
                          bg-red-500
                          text-white
                          hover:bg-red-600"
                        >
                          Delete
                        </button>

                      )}

                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
}

export default AdminTable;