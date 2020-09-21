import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/Header';

// the Component, pageProps and currentUser we get from getInitialProps
const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // to execute the getInitialProps of the pages we have to implement this
  // this happens because we defined the get initial props in _app so the page's getInitialProps
  // wont get invoked automatically
  let pageProps = {};

  if (appContext.Component.getInitialProps) {
    // we passdown the client and current user so that we dont have to
    // import build client again and again and currentuserId
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }
  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
