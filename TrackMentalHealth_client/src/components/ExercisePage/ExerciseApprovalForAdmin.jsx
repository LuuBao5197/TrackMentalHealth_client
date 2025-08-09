import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const ExerciseApprovalForAdmin = () => {
  const [exercises, setExercises] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = () => {
    axios
      .get(`http://localhost:9999/api/exercise/`) // Admin lấy tất cả exercise
      .then((response) => setExercises(response.data))
      .catch((error) => console.error('Failed to load exercise list:', error));
  };

  const approveExercise = (id) => {
    Swal.fire({
      title: 'Approve this exercise?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:9999/api/exercise/${id}/approve`) // API duyệt
          .then(() => {
            Swal.fire('Approved!', 'Exercise has been approved.', 'success');
            loadExercises();
          })
          .catch((error) => {
            console.error('Error approving exercise:', error);
            Swal.fire('Error', 'Could not approve exercise.', 'error');
          });
      }
    });
  };

  const filteredExercises = exercises.filter((exercise) =>
    exercise.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: 'Image',
      cell: (row) => (
        <img
          src={
            row.photo?.startsWith('http')
              ? row.photo
              : '/assets/img/default-exercise.webp'
          }
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
        <div
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 250,
          }}
        >
          {row.title}
        </div>
      ),
    },
    { name: 'Type', selector: (row) => row.mediaType || 'Unknown' },
    {
      name: 'Duration',
      selector: (row) =>
        row.estimatedDuration
          ? `${Math.round(row.estimatedDuration / 60)} min`
          : 'Unknown',
    },
    {
      name: 'Status',
      cell: (row) => (
        <span
          className={`badge ${
            row.status === 'true' || row.status === true
              ? 'bg-success'
              : 'bg-secondary'
          }`}
        >
          {row.status === 'true' || row.status === true
            ? 'Active'
            : 'Inactive'}
        </span>
      ),
    },
    {
      name: 'Created At',
      cell: (row) =>
        row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm') : '',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <button
            onClick={() => (window.location.href = `/TrackMentalHealth/auth/exercise/${row.id}`)}
            className="btn btn-sm btn-outline-primary"
          >
            View
          </button>

          {/* Chỉ hiện Approve nếu chưa public */}
          {row.status !== 'true' && row.status !== true && (
            <button
              onClick={() => approveExercise(row.id)}
              className="btn btn-sm btn-outline-success"
            >
              Approve
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-3">🏋️ Exercise Approval</h2>

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

export default ExerciseApprovalForAdmin;
