import React from "react";
import { useAuth } from "./AuthContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 20px",
                borderBottom: "1px solid #ddd",
            }}
        >
            <h2 style={{ margin: 0 }}>Secure Clipboard</h2>

            <div>
                {!user ? (
                    <>
                        <button onClick={() => navigate("/login")} style={{ marginRight: "10px" }}>
                            Login
                        </button>
                        <button onClick={() => navigate("/signup")}>Signup</button>
                    </>
                ) : (
                    <button onClick={handleLogout}>Logout</button>
                )}
            </div>
        </div>
    );
}

export default Navbar;
