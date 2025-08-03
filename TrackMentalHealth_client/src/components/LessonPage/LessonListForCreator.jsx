import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';

const LessonListForCreator = () => {
  const [lessons, setLessons] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    let userId = null;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        userId = decoded.contentCreatorId;
      } catch (error) {
        console.error('Invalid token:', error);
        return;
      }
    }

    if (!userId) {
      console.error('contentCreatorId not found in token.');
      return;
    }

    axios
      .get(`http://localhost:9999/api/lesson/creator/${userId}`)
      .then((response) => {
        console.log('Lessons data:', response.data); // Debug: Check the data
        setLessons(response.data);
      })
      .catch((error) => console.error('Error loading lessons:', error));
  }, []);

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: 'Image',
      cell: (row) => (
        <img
          src={row.photo?.startsWith('http') ? row.photo : '/assets/img/default-lesson.webp'}
          alt={row.title}
          style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
      width: '100px',
    },
    { name: 'Title', selector: (row) => row.title, sortable: true },
    {
      name: 'Category',
      selector: (row) => row.category || 'Uncategorized', // Should display "aaa" if present
    },
    {
      name: 'Status',
      selector: (row) => (row.status === 'true' ? 'Active' : 'Inactive'),
      cell: (row) => (
        <span
          className={`badge ${row.status === 'true' ? 'bg-success' : 'bg-secondary'}`}
        >
          {row.status === 'true' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      name: 'Created At',
      selector: (row) => row.createdAt,
      cell: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm'),
      sortable: true,
    },
    {
      name: 'Updated At',
      selector: (row) => row.updatedAt,
      cell: (row) => format(new Date(row.updatedAt), 'dd/MM/yyyy HH:mm'),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <Link
            to={`/auth/lesson/${row.id}`}
            className="btn btn-sm btn-outline-primary"
          >
            View
          </Link>
          <Link
            to={`/auth/lesson/edit/${row.id}`}
            state={{ lesson: row }}
            className="btn btn-sm btn-outline-secondary"
          >
            Edit
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-3">List of Lessons You Have Created</h2>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          style={{ maxWidth: '500px' }}
          placeholder="Search lessons by title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredLessons}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No lessons found."
      />
    </div>
  );
};

export default LessonListForCreator;