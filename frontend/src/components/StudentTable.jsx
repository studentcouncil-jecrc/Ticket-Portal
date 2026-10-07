import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Loader from './Loader';

const API_URL = import.meta.env.VITE_BACKEND_URL;

function StudentTable() {

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all');


  // FETCH STUDENTS

  const fetchStudents = async () => {

    try {

      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/getStudents`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("GET STUDENTS BACKEND RESPONSE:", response.data);
    

      setStudents(response.data.data || []);

    } catch (error) {

      console.error(
        "Failed to fetch students:",
        error.response?.data || error.message
      );

    } finally {

      setLoading(false);

    }
  };


  // INITIAL FETCH

  useEffect(() => {
    fetchStudents();
  }, []);


  // SEARCH STUDENTS

  const handleSearch = async (e) => {

    const value = e.target.value;

    setSearch(value);

    // If search box is empty,
    // show all students again.
    if (!value.trim()) {
      fetchStudents();
      return;
    }

    try {

      setSearchLoading(true);

      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${API_URL}/searchStudents`,
        {
          params: {
            query: value
          },

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Search result:", response.data);

      setStudents(response.data.data || []);

    } catch (error) {

      console.error(
        "Search failed:",
        error.response?.data || error.message
      );

    } finally {

      setSearchLoading(false);

    }
  };

const filteredStudents = students.filter((student) => {
  if (paymentFilter === 'paid') {
    return student.isPaid === true;
  }

  if (paymentFilter === 'unpaid') {
    return student.isPaid === false;
  }

  return true;
});
  // DELETE STUDENT

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) return;

    try {

      const token = localStorage.getItem('token');

      await axios.delete(
        `${API_URL}/deleteStudent`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },

          data: {
            id
          }
        }
      );

      // Remove student from UI immediately.
      setStudents(prev =>
        prev.filter(student => student._id !== id)
      );

    } catch (error) {

      console.error(
        "Delete failed:",
        error.response?.data || error.message
      );

    }
  };


  // SEND TICKET / TOGGLE PAYMENT

  const handleTicket = async (student) => {

    // Don't allow another request while
    // ticket is already being processed.
    if (
      student.ticketStatus === "QUEUED" ||
      student.ticketStatus === "PROCESSING"
    ) {
      return;
    }

    try {

      const token = localStorage.getItem('token');



      // NEW TICKET


      if (!student.isPaid) {

        // Immediately show loader.
        setStudents(prev =>
          prev.map(s =>
            s._id === student._id
              ? {
                  ...s,
                  ticketStatus: "QUEUED"
                }
              : s
          )
        );

      }


      const response = await axios.patch(
        `${API_URL}/send-ticket`,
        {
          id: student._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      console.log(
        "SEND TICKET BACKEND RESPONSE:",
        response.data
      );



      // PAYMENT MARKED


      if (response.data.isPaid === true) {

        setStudents(prev =>
          prev.map(s =>
            s._id === student._id
              ? {
                  ...s,

                  isPaid: true,

                  ticketStatus:
                    response.data.ticketStatus ||
                    s.ticketStatus
                }
              : s
          )
        );

      }



      // PAYMENT REVOKED


      if (
        response.data.isPaid === false &&
        response.data.ticketStatus !== "QUEUED"
      ) {

        setStudents(prev =>
          prev.map(s =>
            s._id === student._id
              ? {
                  ...s,
                  isPaid: false
                }
              : s
          )
        );

      }

    } catch (error) {

      console.error(
        "Ticket error:",
        error.response?.data || error.message
      );

      // Backend is the source of truth.
      // Refresh the list if something went wrong.
      fetchStudents();

    }
  };


  // TICKET POLLING

  useEffect(() => {

    const processing = students.some(
      student =>
        student.ticketStatus === "QUEUED" ||
        student.ticketStatus === "PROCESSING"
    );

    // Nothing processing.
    // Don't create an interval.
    if (!processing) {
      return;
    }


    const interval = setInterval(() => {

      fetchStudents();

    }, 1000);


    return () => {
      clearInterval(interval);
    };

  }, [students]);


  // INITIAL LOADING

  if (loading) {

    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );

  }


  // UI

  return (

    <section className="bg-white rounded-xl shadow-sm p-6">


      {/* ================= HEADER ================= */}

      <div className="mb-2">

        <h2 className="text-xl font-semibold text-gray-900">
          Students
        </h2>

      </div>


      {/* ================= SEARCH ================= */}

<div className="flex flex-wrap items-center justify-between mb-6">
  
  {/* SEARCH */}
  <div className="relative w-full max-w-md">
    <input
      type="text"
      value={search}
      onChange={handleSearch}
      placeholder="Search by email..."
      className="
        w-full
        px-4
        py-2.5
        border
        border-gray-300
        rounded-lg
        outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />

    {searchLoading && (
      <div className="absolute right-3 top-3">
        <Loader />
      </div>
    )}
  </div>

  {/* PAYMENT FILTER */}
  <select
    value={paymentFilter}
    onChange={(e) => setPaymentFilter(e.target.value)}
    className="
      px-4
      py-2.5
      border
      border-gray-300
      rounded-lg
      bg-white
      text-gray-700
      outline-none
      focus:ring-2
      focus:ring-blue-500
      cursor-pointer
    "
  >
    <option value="all">All</option>
    <option value="paid">Paid</option>
    <option value="unpaid">Unpaid</option>
  </select>

</div>


      {/* ================= TABLE ================= */}

      <div className="border rounded-lg overflow-hidden">

        <div className="max-h-[500px] overflow-y-auto overflow-x-auto">

          <table className="w-full">


            {/* ================= HEAD ================= */}

            <thead className="bg-gray-50">

              <tr>

                <th className="text-left px-4 py-3 text-sm font-medium">
                  Name
                </th>

                <th className="text-left px-4 py-3 text-sm font-medium">
                  Email
                </th>

                <th className="text-left px-4 py-3 text-sm font-medium">
                  Phone Number
                </th>

                <th className="text-left px-4 py-3 text-sm font-medium">
                  Branch
                </th>

                <th className="text-left px-4 py-3 text-sm font-medium">
                  Year
                </th>

                <th className="text-center px-4 py-3 text-sm font-medium">
                  Ticket
                </th>

                <th className="text-center px-4 py-3 text-sm font-medium">
                  Action
                </th>

              </tr>

            </thead>


            {/* ================= BODY ================= */}

            <tbody>

              {filteredStudents.length === 0? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-10 text-gray-500"
                  >
                    No students found
                  </td>

                </tr>

              ) : (

                filteredStudents.map(student => (

                  <tr
                    key={student._id}
                    className="border-t hover:bg-gray-50"
                  >


                    {/* NAME */}

                    <td className="px-4 py-3">
                      {student.name}
                    </td>


                    {/* EMAIL */}

                    <td className="px-4 py-3">
                      {student.email}
                    </td>


                    {/* ROLL NO */}

                    <td className="px-4 py-3">
                      {student.studentId}
                    </td>


                    {/* BRANCH */}

                    <td className="px-4 py-3">
                      {student.branch}
                    </td>


                    {/* YEAR */}

                    <td className="px-4 py-3">
                      {student.Year}
                    </td>


                    {/* TICKET */}

                    <td className="px-4 py-3 text-center">

                      {(
                        student.ticketStatus === "QUEUED" ||
                        student.ticketStatus === "PROCESSING"
                      ) ? (

                        <div className="flex justify-center">

                          <Loader />

                        </div>

                      ) : (

                        <input
                          type="checkbox"
                          checked={student.isPaid}
                          onChange={() =>
                            handleTicket(student)
                          }
                          className="w-5 h-5 cursor-pointer"
                        />

                      )}

                    </td>


                    {/* DELETE */}

                    <td className="px-4 py-3 text-center">

                      <button
                        onClick={() =>
                          handleDelete(student._id)
                        }
                        className="
                          px-3
                          py-1.5
                          text-sm
                          rounded-lg
                          bg-red-500
                          text-white
                          hover:bg-red-600
                        "
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

export default StudentTable;