// ! YOU HAVE TO SET TICKETS AND ORDERS SERVICE REPLICAS TO 4 TO TEST THE CONCURRENCY

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const axios = require('axios');

const cookie =
  'express:sess=eyJqd3QiOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcFpDSTZJalZtTmpOaU9HUXdabVUyTm1VNE1EQXlPV0ZqWXpCak1TSXNJbVZ0WVdsc0lqb2lkR1Z6ZEVCMFpYTjBMbU52YlNJc0ltbGhkQ0k2TVRZd01ETTNNRGc1Tm4wLlhWNjZ2UjhpbkRlZDYtVFNzaHBHRVFiTUptaDJDblFWNk5TcXhrX3NpOWsifQ==; Path=/; Domain=tickety.com; Secure; HttpOnly;';

const doRequest = async () => {
  const { data } = await axios.post(
    `https://tickety.com/api/tickets`,
    { title: 'ticket', price: 5 },
    {
      headers: { cookie },
    }
  );

  await axios.put(
    `https://tickety.com/api/tickets/${data.id}`,
    { title: 'ticket', price: 10 },
    {
      headers: { cookie },
    }
  );

  axios.put(
    `https://tickety.com/api/tickets/${data.id}`,
    { title: 'ticket', price: 15 },
    {
      headers: { cookie },
    }
  );

  console.log('Request complete');
};

(async () => {
  for (let i = 0; i < 200; i++) {
    doRequest();
  }
})();
