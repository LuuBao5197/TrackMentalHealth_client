
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log(token);
  return {
    headers: {
      'Content-Type': 'application/json',
       'Accept': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};
export default getAuthHeaders;