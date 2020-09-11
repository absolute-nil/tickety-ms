import axios from 'axios';

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return <h1>Hello world</h1>;
};

LandingPage.getInitialProps = async ({ req }) => {
  // cant use useRequest because hooks can only be used inside react components and getInitialProps
  // is a function
  if (typeof window === 'undefined') {
    // we are on server
    // request should be mate to ingress server
    // ! since this request is being made from server the cookies and all are not included so add them manually
    //* http://SERVICENAME.NAMESPACE.svc.cluster.local
    const { data } = await axios.get(
      'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/users/currentuser',
      {
        // need to specify the host as there may be many different rules related to different domains in ingress
        // req.headers includes cookies Host and other things relevant to make request
        headers: req.headers,
      }
    );

    return data;
  } else {
    // we are on browser we can just use the default tickety.com by browser
    const { data } = await axios.get('/api/users/currentuser');

    return data;
  }
};

export default LandingPage;
