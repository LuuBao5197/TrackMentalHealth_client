import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

const ArticleApprovalForAdmin = () => {
  const [articles, setArticles] = useState([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = () => {
    axios
      .get(`http://localhost:9999/api/article/`) // Admin lấy tất cả article
      .then((response) => setArticles(response.data))
      .catch((error) => console.error('Error loading article list:', error));
  };

  const approveArticle = (id) => {
    Swal.fire({
      title: 'Approve this article?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve it!',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:9999/api/article/${id}/approve`) // API approve
          .then(() => {
            Swal.fire('Approved!', 'Article has been approved.', 'success');
            loadArticles();
          })
          .catch((error) => {
            console.error('Error approving article:', error);
            Swal.fire('Error', 'Could not approve article.', 'error');
          });
      }
    });
  };

  const filteredArticles = articles.filter((article) =>
    article.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      name: 'Image',
      cell: (row) => (
        <img
          src={row.photo?.startsWith('http') ? row.photo : '/assets/img/default-article.webp'}
          alt={row.title}
          style={{ width: 80, height: 50, objectFit: 'cover', borderRadius: 4 }}
        />
      ),
      width: '100px',
    },
    { name: 'Title', selector: (row) => row.title, sortable: true },
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
        row.createdAt
          ? format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm')
          : 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <button
            onClick={() => (window.location.href = `/TrackMentalHealth/auth/article/${row.id}`)}
            className="btn btn-sm btn-outline-primary"
          >
            View
          </button>

          {/* Chỉ hiện Approve nếu chưa duyệt */}
          {row.status !== 'true' && row.status !== true && (
            <button
              onClick={() => approveArticle(row.id)}
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
      <h2 className="mb-3">📰 Article Approval</h2>

      <div className="mb-3">
        <input
          type="text"
          className="form-control w-50"
          style={{ maxWidth: '500px' }}
          placeholder="Search articles by title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredArticles}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="No articles found."
      />
    </div>
  );
};

export default ArticleApprovalForAdmin;
