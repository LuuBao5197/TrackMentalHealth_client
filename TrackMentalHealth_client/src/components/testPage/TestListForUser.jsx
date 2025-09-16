import React, { useState, useEffect } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Pagination, InputGroup,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaEdit } from 'react-icons/fa';
import axios from 'axios';

const TestListForUser = () => {
  const [tests, setTests] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:9999/api/test/', {
        params: { page, size: 2, search },
      });
      setTests(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTests();
  };

  const handleDoTest = (id) => {
    navigate(`/user/doTest/${id}`); x
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">🧠 Mental Health Tests</h2>

      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="primary">
            <FaSearch /> Search
          </Button>
        </InputGroup>
      </Form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Row>
          {tests.map((test) => (
            <Col md={6} key={test.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title><span
                    dangerouslySetInnerHTML={{ __html: test.title }}
                  ></span></Card.Title>
                  {/* <Card.Subtitle className="mb-2 text-muted">
                    {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Unknown date'}
                  </Card.Subtitle> */}
                  <Card.Text><span
                    dangerouslySetInnerHTML={{ __html: test.description?.substring(0, 150) }}
                  ></span></Card.Text>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-capitalize text-secondary">Status: {test.status}</span>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleDoTest(test.id)}
                    >
                      <FaEdit className="me-2" />
                      Do Test
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Pagination className="mt-4 justify-content-center">
        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
        {[...Array(totalPages)].map((_, idx) => (
          <Pagination.Item
            key={idx + 1}
            active={idx + 1 === page}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
      </Pagination>
    </Container>
  );
};

export default TestListForUser;
