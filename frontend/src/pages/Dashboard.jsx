import React, { useContext, useRef, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import StudentTable from '../components/StudentTable';
import AdminTable from '../components/AdminTable';
import CreateStudent from '../components/CreateStudent';
import CreateAdmin from '../components/CreateAdmin';
import Loader from '../components/Loader';

import { adminDataContext } from '../context/AdminContext';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {

  const { admin } = useContext(adminDataContext);

  const [activeSection, setActiveSection] = useState('students');

  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  const [uploadingExcel, setUploadingExcel] = useState(false);

  const fileInputRef = useRef(null);

  const isSuperAdmin = admin?.role === "superadmin";

  // --------------------------------
  // Excel upload
  // --------------------------------

  const handleExcelButtonClick = () => {
    if (uploadingExcel) return;

    fileInputRef.current?.click();
  };

  const handleExcelUpload = async (e) => {

    const file = e.target.files?.[0];

    // Allows selecting the same file again
    e.target.value = '';

    if (!file) return;

    setUploadingExcel(true);

    try {

      const token = localStorage.getItem('token');

      const formData = new FormData();

      formData.append('file', file);

      const response = await axios.post(
        `${API_URL}/uploadExcel`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Excel upload response:", response.data);

      const summary = response.data.summary;

      alert(
        `Excel uploaded successfully!\n\n` +
        `Total rows: ${summary?.totalRows ?? 0}\n` +
        `Inserted: ${summary?.inserted ?? 0}\n` +
        `Skipped: ${summary?.skipped ?? 0}\n` +
        `Duplicates: ${summary?.duplicateSkipped ?? 0}`
      );

      // StudentTable fetches its own data.
      // Reloading the page ensures the newly inserted students appear.
      window.location.reload();

    } catch (error) {

      console.error(
        "Excel upload failed:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.msg ||
        "Excel upload failed"
      );

    } finally {
      setUploadingExcel(false);
    }
  };

  // --------------------------------
  // Student created
  // --------------------------------

  const handleStudentCreated = () => {
    setShowCreateStudent(false);

    // StudentTable currently owns its own state,
    // so reload to display the newly created student.
    window.location.reload();
  };

  // --------------------------------
  // Admin created
  // --------------------------------

  const handleAdminCreated = () => {
    setShowCreateAdmin(false);

    window.location.reload();
  };

  return (
    <div className="dashboard">

      {/* --------------------------------
          Header
      -------------------------------- */}

      <header className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-6 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
            </div>

            <div className="text-right">

              <p className="text-sm font-medium text-gray-900">
                {admin?.name}
              </p>

              <p className="text-xs text-gray-500 capitalize">
                {admin?.role}
              </p>

            </div>

          </div>

        </div>

      </header>


      {/* --------------------------------
          Main
      -------------------------------- */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* --------------------------------
            Controls
        -------------------------------- */}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          {/* Section buttons */}

          <div className="flex gap-2">

            <button
              onClick={() => setActiveSection('students')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeSection === 'students'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Students
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveSection('admins')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeSection === 'admins'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Admins
              </button>
            )}

          </div>


          {/* Action buttons */}

          <div className="flex flex-wrap gap-2">

            {/* Add Student */}

            <button
              onClick={() => setShowCreateStudent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Add Student
            </button>


            {/* Create Admin */}

            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Create Admin
              </button>
            )}


            {/* Upload Excel */}

            {isSuperAdmin && (
              <>
                <button
                  onClick={handleExcelButtonClick}
                  disabled={uploadingExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingExcel && <Loader />}

                  {uploadingExcel
                    ? "Uploading..."
                    : "Upload Excel"
                  }
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </>
            )}

          </div>

        </div>


        {/* --------------------------------
            Content
        -------------------------------- */}

        {activeSection === 'students' ? (
          <StudentTable />
        ) : (
          <AdminTable />
        )}

      </main>


      {/* --------------------------------
          Create Student Popup
      -------------------------------- */}

      {showCreateStudent && (
        <CreateStudent
          onClose={() => setShowCreateStudent(false)}
          onStudentCreated={handleStudentCreated}
        />
      )}


      {/* --------------------------------
          Create Admin Popup
      -------------------------------- */}

      {showCreateAdmin && isSuperAdmin && (
        <CreateAdmin
          onClose={() => setShowCreateAdmin(false)}
          onAdminCreated={handleAdminCreated}
        />
      )}

    </div>
  );
}

export default Dashboard;