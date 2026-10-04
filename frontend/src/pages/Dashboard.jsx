import React, { useContext, useRef, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import StudentTable from '../components/StudentTable';
import AdminTable from '../components/AdminTable';
import CreateStudent from '../components/CreateStudent';
import CreateAdmin from '../components/CreateAdmin';
import AppAdminTable from '../components/AppAdminTable';
import CreateAppAdmin from '../components/CreateAppAdmin';
import Loader from '../components/Loader';

import { IoStatsChartSharp } from "react-icons/io5";
import { GrUserAdmin } from "react-icons/gr";
import { RiFileExcel2Fill } from "react-icons/ri";
import { IoPersonAddSharp } from "react-icons/io5";
import { PiStudentBold } from "react-icons/pi";
import { GiCloudRing } from "react-icons/gi";
import { PiApplePodcastsLogoFill } from "react-icons/pi";
import { IoIosCreate } from "react-icons/io";


import { adminDataContext } from '../context/AdminContext';




const API_URL = import.meta.env.VITE_BACKEND_URL;

function Dashboard() {

const [showStatsModal, setShowStatsModal] = useState(false);
const [stats, setStats] = useState(null);
const [statsLoading, setStatsLoading] = useState(false);

const [showCreateAppAdmin, setShowCreateAppAdmin] = useState(false);
const [appAdminRefreshKey, setAppAdminRefreshKey] = useState(0);

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

const handleAppAdminCreated = () => {
  setShowCreateAppAdmin(false);

  setAppAdminRefreshKey(prev => prev + 1);
};

  // --------------------------------
  // Total stats jo bhi hai
  // --------------------------------
const fetchStats = async () => {
  try {
    setStatsLoading(true);

    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${API_URL}/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setStats(response.data.stats);
    setShowStatsModal(true);

  } catch (error) {
    console.error(
      "Failed to fetch stats:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.msg ||
      "Failed to fetch statistics"
    );

  } finally {
    setStatsLoading(false);
  }
};


  return (
    <div className="dashboard">

      {/* --------------------------------
          Header
      -------------------------------- */}

      <header className="bg-white border-b">

        <div className="max-w-7xl mx-auto px- py-4">

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

      <main className="max-w-7xl mx-auto px- py-8">

        {/* --------------------------------
            Controls
        -------------------------------- */}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          {/* Section buttons */}

          <div className="flex gap-2">

            <button
              onClick={() => setActiveSection('students')}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeSection === 'students'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Students
              <span><PiStudentBold size={18} /></span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveSection('admins')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  activeSection === 'admins'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Admins
                <span><GiCloudRing size={18} /></span>
              </button>
            )}

{isSuperAdmin && (
  <button
    onClick={() => setActiveSection('appAdmins')}
    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
      activeSection === 'appAdmins'
        ? 'bg-blue-600 text-white'
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    }`}
  >
    App Admins
    <span><PiApplePodcastsLogoFill size={20} /></span>
  </button>
)}

{admin?.role === "superadmin" && (
  <button
    onClick={fetchStats}
    className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 cursor-pointer flex items-center"
  >
    View Stats
    <span className='ml-2'><IoStatsChartSharp /></span>
  </button>
)}

          </div>


          {/* Action buttons */}

          <div className="flex flex-wrap gap-2">

            {/* Add Student */}

            <button
              onClick={() => setShowCreateStudent(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <span><IoPersonAddSharp /></span>
              Add Student
            </button>


            {/* Create Admin */}

            {isSuperAdmin && (
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="px-4 py-2 bg-[#EAC100] text-white rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 hover:bg-[#ddb502]"
              >
                <span><GrUserAdmin /></span>
                Create Admin
              </button>
            )}

{isSuperAdmin && (
  <button
    onClick={() => setShowCreateAppAdmin(true)}
    className="px-4 py-2 bg-[#4379F2] text-white rounded-lg text-sm font-medium hover:bg-[#3066db] cursor-pointer flex items-center gap-2"
  >
    <span><IoIosCreate size={16} /></span>
    Create App Admin
  </button>
)}
            {/* Upload Excel */}

            {isSuperAdmin && (
              <>
                <button
                  onClick={handleExcelButtonClick}
                  disabled={uploadingExcel}
                  className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingExcel && <Loader />}
<span><RiFileExcel2Fill /></span>
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

{activeSection === 'students' && (
  <StudentTable />
)}

{activeSection === 'admins' && isSuperAdmin && (
  <AdminTable />
)}

{activeSection === 'appAdmins' && isSuperAdmin && (
  <AppAdminTable
    refreshKey={appAdminRefreshKey}
  />
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

{showCreateAppAdmin && isSuperAdmin && (
  <CreateAppAdmin
    onClose={() => setShowCreateAppAdmin(false)}
    onAppAdminCreated={handleAppAdminCreated}
  />
)}

{showStatsModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Event Statistics
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Freshers 2026
          </p>
        </div>

        <button
          onClick={() => setShowStatsModal(false)}
          className="text-gray-500 hover:text-gray-900 text-2xl"
        >
          ×
        </button>

      </div>


      {statsLoading ? (

        <div className="flex justify-center py-12">
          <Loader />
        </div>

      ) : stats ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* TOTAL STUDENTS */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Total Students
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalStudents.toLocaleString()}
            </p>
          </div>


          {/* PASSES SENT */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Passes Sent
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.passesSent.toLocaleString()}
            </p>
          </div>


          {/* UNPAID */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Unpaid
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.unpaid.toLocaleString()}
            </p>
          </div>


          {/* SCANNED */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Total Tickets Scanned
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalTicketsScanned.toLocaleString()}
            </p>
          </div>


          {/* YET TO ENTER */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Yet To Enter
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.yetToEnter.toLocaleString()}
            </p>
          </div>


          {/* ENTRY RATE */}

          <div className="border rounded-xl p-5">
            <p className="text-sm text-gray-500">
              Entry Rate
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.entryRate}%
            </p>
          </div>


          {/* ACTIVE SCANNERS */}

          <div className="border rounded-xl p-5 sm:col-span-2">

            <p className="text-sm text-gray-500">
              Active Scanners
            </p>

            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.activeScanners}/{stats.totalScanners}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Currently active
            </p>

          </div>

        </div>

      ) : null}


      {/* CLOSE */}

      <div className="flex justify-end mt-6">

        <button
          onClick={() => setShowStatsModal(false)}
          className="px-5 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default Dashboard;