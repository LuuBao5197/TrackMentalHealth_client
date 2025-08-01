import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';

const ExerciseListForCreator = () => {
  const [exercises, setExercises] = useState([]);
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
      .get(`http://localhost:9999/api/exercise/creator/${userId}`)
      .then((response) => setExercises(response.data))
      .catch((error) => console.error('Failed to load exercise list:', error));
  }, []);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: 'Image',
      cell: (row) => (
        <img
          src={row.photo?.startsWith('http') ? row.photo : '/assets/img/default-exercise.webp'}
          alt={row.title}
          style={{
            width: 80,
            height: 50,
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
      ),
      width: '100px',
    },
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
      cell: (row) => (
        <div style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 250,
        }}>
          {row.title}
        </div>
      ),
    },
    {
      name: 'Type',
      selector: (row) => row.mediaType || 'Unknown',
    },
    {
      name: 'Duration',
      selector: (row) =>
        row.estimatedDuration
          ? `${Math.round(row.estimatedDuration / 60)} min`
          : 'Unknown',
    },
    {
      name: 'Status',
      selector: (row) =>
        row.status === 'true' || row.status === true ? 'Active' : 'Inactive',
      cell: (row) => (
        <span
          className={`badge ${row.status === 'true' || row.status === true
            ? 'bg-success'
            : 'bg-secondary'
            }`}
        >
          {row.status === 'true' || row.status === true ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      name: 'Created At',
      selector: (row) => row.createdAt,
      cell: (row) =>
        row.createdAt
          ? format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm')
          : '',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <Link
            to={`/auth/exercise/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            View
          </Link>
          <Link
            to={`/auth/exercise/edit/${row.id}`}
            state={{ exercise: row }}
            className="btn btn-sm btn-outline-secondary"
            style={{ whiteSpace: 'nowrap' }}
          >
            Edit
          </Link>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-3">List of Exercises You Have Created</h2>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          style={{ maxWidth: '500px' }}
          placeholder="Search exercises by title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredExercises}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No exercises found."
      />
    </div>
  );
};

export default ExerciseListForCreator;
