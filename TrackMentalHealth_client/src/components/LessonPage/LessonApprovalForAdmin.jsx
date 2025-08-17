import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const LessonApprovalForAdmin = () => {
  const [lessons, setLessons] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = () => {
    axios
      .get(`http://localhost:9999/api/lesson`) // Admin lấy tất cả lesson
      .then((response) => {
        setLessons(response.data);
      })
      .catch((error) => console.error('Error loading lessons:', error));
  };

  const approveLesson = (id) => {
    Swal.fire({
      title: 'Approve this lesson?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:9999/api/lesson/${id}/approve`) // Backend đổi status thành true
          .then(() => {
            Swal.fire('Approved!', 'Lesson has been approved.', 'success');
            loadLessons();
          })
          .catch((error) => {
            console.error('Error approving lesson:', error);
            Swal.fire('Error', 'Could not approve lesson.', 'error');
          });
      }
    });
  };

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
    { name: 'Category', selector: (row) => row.category || 'Uncategorized' },
    {
      name: 'Status',
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
      cell: (row) => format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm'),
      sortable: true,
    },
    {
      name: 'Updated At',
      cell: (row) => format(new Date(row.updatedAt), 'dd/MM/yyyy HH:mm'),
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <button
            onClick={() => window.location.href = `/TrackMentalHealth/lesson/${row.id}`}
            className="btn btn-sm btn-outline-primary"
          >
            View
          </button>

          {/* Chỉ hiển thị nút Approve nếu chưa duyệt */}
          {row.status !== 'true' && (
            <button
              onClick={() => approveLesson(row.id)}
              className="btn btn-sm btn-outline-success"
            >
              Approve
            </button>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="mb-3">Lesson Approval</h2>

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

export default LessonApprovalForAdmin;
