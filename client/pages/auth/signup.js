export default () => {
  return (
    <form>
      <h1>Signup</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input className="form-control" />
      </div>
      <div className="form-group">
        <label>password</label>
        <input type="password" className="form-control" />
      </div>
    </form>
  );
};
