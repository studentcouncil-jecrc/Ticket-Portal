import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";

const API_URL = import.meta.env.VITE_BACKEND_URL;

function AppAdminTable({ refreshKey = 0 }) {

  const [appAdmins, setAppAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppAdmins = async () => {

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/getAppAdmins`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setAppAdmins(response.data?.data || []);

    } catch (error) {

      console.error(
        "Failed to fetch app admins:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.msg ||
        "Failed to fetch app admins"
      );

    } finally {
      setLoading(false);
    }
  };


  // INITIAL FETCH + REFRESH AFTER CREATION

  useEffect(() => {
    fetchAppAdmins();
  }, [refreshKey]);


  // DELETE APP ADMIN

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this app admin?"
    );

    if (!confirmDelete) return;

    try {

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/deleteAppAdmin`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          data: {
            id
          }
        }
      );

      setAppAdmins(prev =>
        prev.filter(appAdmin => appAdmin._id !== id)
      );

    } catch (error) {

      console.error(
        "Delete app admin failed:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.msg ||
        "Failed to delete app admin"
      );

    }
  };


  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader />
      </div>
    );
  }


  return (
    <section className="bg-white rounded-xl shadow-sm p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-semibold">
            App Admins
          </h2>

          <p className="text-sm text-gray-500">
            Manage scanner app accounts.
          </p>

        </div>

        <div className="text-sm text-gray-500">
          Total: {appAdmins.length}
        </div>

      </div>


      {/* TABLE */}

      <div className="border rounded-lg overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-4 py-3 text-sm">
                  Name
                </th>

                <th className="text-left px-4 py-3 text-sm">
                  Email
                </th>

                <th className="text-center px-4 py-3 text-sm">
                  Status
                </th>

                <th className="text-left px-4 py-3 text-sm">
                  Created
                </th>

                <th className="text-center px-4 py-3 text-sm">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {appAdmins.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
                  >
                    No app admins found
                  </td>

                </tr>

              ) : (

                appAdmins.map(appAdmin => (

                  <tr
                    key={appAdmin._id}
                    className="border-t hover:bg-gray-50"
                  >

                    {/* NAME */}

                    <td className="px-4 py-3">
                      {appAdmin.name}
                    </td>


                    {/* EMAIL */}

                    <td className="px-4 py-3">
                      {appAdmin.email}
                    </td>


                    {/* STATUS */}

                    <td className="px-4 py-3 text-center">

                      {appAdmin.isLoggedIn ? (

                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Active
                        </span>

                      ) : (

                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Offline
                        </span>

                      )}

                    </td>


                    {/* CREATED */}

                    <td className="px-4 py-3 text-sm text-gray-600">

                      {appAdmin.createdAt
                        ? new Date(
                            appAdmin.createdAt
                          ).toLocaleDateString()
                        : "-"
                      }

                    </td>


                    {/* DELETE */}

                    <td className="px-4 py-3 text-center">

                      <button
                        onClick={() =>
                          handleDelete(appAdmin._id)
                        }
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
                      >
                        Delete
                      </button>

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

export default AppAdminTable;