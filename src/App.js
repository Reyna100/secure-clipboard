import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Login from "./Login";
import Clipboard from "./Clipboard";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      {/* ToastContainer can be placed here, it works globally */}
      <ToastContainer
        position="bottom-center"
        autoClose={5000}  // 5 seconds
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
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Clipboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

