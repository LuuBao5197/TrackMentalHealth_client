import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { format } from 'date-fns';

const ArticleListForCreator = () => {
  const [articles, setArticles] = useState([]);

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
      .get(`http://localhost:9999/api/article/creator/${userId}`)
      .then((response) => setArticles(response.data))
      .catch((error) =>
        console.error('Error loading article list:', error)
      );
  }, []);

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
    {
      name: 'Title',
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row) => row.status === 'true' || row.status === true ? 'Active' : 'Inactive',
      cell: (row) => (
        <span
          className={`badge ${row.status === 'true' || row.status === true ? 'bg-success' : 'bg-secondary'}`}
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
          : 'N/A',
      sortable: true,
    },
    {
      name: 'Actions',
      cell: (row) => (
        <div className="d-flex gap-1" style={{ whiteSpace: 'nowrap' }}>
          <Link
            to={`/auth/article/${row.id}`}
            className="btn btn-sm btn-outline-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            View
          </Link>
          <Link
            to={`/auth/article/edit/${row.id}`}
            state={{ article: row }}
            className="btn btn-sm btn-outline-secondary"
            style={{ whiteSpace: 'nowrap' }}
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
      <h2 className="mb-3">📚 List of Articles You Have Created</h2>
      <DataTable
        columns={columns}
        data={articles}
        pagination
        highlightOnHover
        striped
        responsive
        noDataComponent="⏳ No articles found."
      />
    </div>
  );
};

export default ArticleListForCreator;
