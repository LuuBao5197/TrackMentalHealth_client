import React, { useEffect, useState, useCallback } from 'react';
import { Card } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import {
  IconEye,
  IconEdit,
  IconTrash,
  IconSearch,
} from '@tabler/icons-react';
import TestPreviewModal from './TestPreviewModal';
import { useNavigate } from 'react-router';
import { showAlert } from '../../utils/showAlert';
import { maxHeight, maxWidth, width } from '@mui/system';

const TestList = () => {
  const [tests, setTests] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const navigate = useNavigate();

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
    setSelectedTest(test);
    setShowDetail(true);
  };

  const handleEdit = (test) => {
    console.log(test);
    navigate(`/testDesigner/test/edit/${test.id}`)
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await axios.delete(`http://localhost:9999/api/test/${testId}`);
        fetchTests(currentPage - 1);
      } catch (error) {
        showAlert('Delete failed because data relevant other data', "error");
      }
    }
  };

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      maxWidth: '300px'
      // grow: 2, // Cho phép cột này rộng hơn các cột khác
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
      maxWidth: '400px'
      // grow: 3, // Cột này sẽ rộng nhất
    },
    {
      name: 'Instructions',
      sortable: true,
      selector: row => row.instructions,
      maxWidth: '200px'
      // grow: 3, // Cột này cũng rộng
    },
    {
      name: 'Actions',
      center: true, // Chỉ căn giữa cho cột Actions
      maxWidth: '200px', // Đặt chiều rộng tối thiểu để các nút không bị vỡ
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
        paddingTop: '10px',
        paddingBottom: '10px',
      },
    },
    headCells: {
      style: {
        fontWeight: 'bold',
        fontSize: '14px', // Chỉnh size chữ cho header
      },
    },
    cells: {
      style: {
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        // overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'left', // Căn lề trái cho dễ đọc
        justifyContent: 'left', // Căn lề trái cho dễ đọc
      },
    },
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Header className="p-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="mb-0">Test List</h4>
            <div className="input-group" style={{ minWidth: '300px', maxWidth: '400px' }}>
              <span className="input-group-text">
                <IconSearch size={18} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search tests..."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0"> {/* p-0 để DataTable vừa khít */}
          <DataTable
            columns={columns}
            data={tests}
            customStyles={customStyles}
            progressPending={loading}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            paginationRowsPerPageOptions={[5, 10, 15, 20]}
            highlightOnHover
            striped
            responsive
            noDataComponent={<div className="p-4">No data available</div>}
          />
        </Card.Body>
      </Card>

      <TestPreviewModal
        show={showDetail}
        onClose={() => setShowDetail(false)}
        testData={selectedTest}
        title="Test Detail"
      />
    </div>
  );
};

export default TestList;
