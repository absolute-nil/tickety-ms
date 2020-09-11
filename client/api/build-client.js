import axios from 'axios';

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on server
    // request should be mate to ingress server
    // ! since this request is being made from server the cookies and all are not included so add them manually
    // http://SERVICENAME.NAMESPACE.svc.cluster.local

    return axios.create({
      baseURL:
        'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
      // need to specify the host as there may be many different rules related to different domains in ingress
      // req.headers includes cookies Host and other things relevant to make request
      headers: req.headers,
    });
  } else {
    // we are on browser we can just use the default tickety.com by browser
    return axios.create({
      baseURL: '/',
    });
  }
};

export default buildClient;
