import React, { useEffect, useState, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
} from '@tabler/icons-react';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const fetchTests = useCallback(async (page, size = perPage, searchTerm = search) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:9999/api/test/`, {
        params: { page, size, search: searchTerm }
      });
      setTests(res.data.data);
      setTotalRows(res.data.total);
      setTotalPages(Math.ceil(res.data.total / size));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [perPage, search]);

  useEffect(() => {
    fetchTests(currentPage);
  }, [fetchTests, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchTests(1, newPerPage);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTests(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, fetchTests]);

  const handleDetail = (test) => {
    alert(`Detail of test ID ${test.id}`);
  };

  const handleEdit = (test) => {
    alert(`Edit test ID ${test.id}`);
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá không?')) {
      try {
        await axios.delete(`http://localhost:9999/api/test/${testId}`);
        fetchTests(currentPage - 1);
      } catch (error) {
        console.error('Xoá thất bại:', error);
      }
    }
  };

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      center: true,
      maxWidth: '200px',
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      center: true,
      maxWidth: '250px',
    },
    {
      name: 'Instructions',
      sortable: true,
      selector: row => row.instructions,
      center: true,
      maxWidth: '250px',
    },
    {
      name: 'Status',
      sortable: true,
      selector: row => row.status,
      center: true,
      maxWidth: '200px',
    },
    {
      name: 'Actions',
      center: true,
      button: true,
      maxWidth: '250px',
      cell: row => (
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-primary" onClick={() => handleDetail(row)}>
            <IconEye size={18} />
          </button>
          <button className="btn btn-sm btn-outline-warning mx-1" onClick={() => handleEdit(row)}>
            <IconEdit size={18} />
          </button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
            <IconTrash size={18} />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: '52px',
        maxHeight: '52px',
        alignItems: 'center',
      },
    },
    headCells: {
      style: {
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
      },
    },
    cells: {
      style: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
        justifyContent: 'center',
        maxWidth: '100%',
      },
    },
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Danh sách bài Test</h3>

      <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="input-group" style={{ minWidth: '250px' }}>
          <span className="input-group-text">
            <IconSearch size={18} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm tiêu đề..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <span className="text-muted">
          Trang {currentPage} / {totalPages}
        </span>
      </div>

      <DataTable
        columns={columns}
        data={tests}
        customStyles={customStyles}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationDefaultPage={currentPage}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerRowsChange}
        paginationRowsPerPageOptions={[5, 8, 10, 12, 15]}
        highlightOnHover
        striped
        responsive
        noDataComponent="Không có dữ liệu"

      />
    </div>
  );
};

export default TestList;
