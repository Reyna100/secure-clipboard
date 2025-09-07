import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Login";
import Signup from "./Signup";
import Clipboard from "./Clipboard";
import { useAuth } from "./AuthContext"; // ✅ to access user/logout

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();  // call your existing logout function
    navigate("/login"); // redirect to login after logout
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        padding: "10px",
        borderBottom: "1px solid #ccc",
      }}
    >
      {!user ? (
        <>
          <Link to="/login">
            <button style={{ marginRight: "10px" }}>Login</button>
          </Link>
          <Link to="/signup">
            <button>Signup</button>
          </Link>
        </>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <Header /> {/* Header always visible */}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Clipboard />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;



