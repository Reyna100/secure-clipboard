import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./AuthContext"; // ✅ import auth context

export default function Clipboard() {
    const [input, setInput] = useState("");
    const [items, setItems] = useState([]);
    const { user } = useAuth(); // ✅ check login state

    // 🔹 Load clipboard history in realtime (only for logged-in user)
    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }

        const q = query(
            collection(db, "clipboard"),
            where("uid", "==", user.uid), // ✅ load only current user’s data
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setItems(
                snapshot.docs.map((doc) => ({
                    id: doc.id,
                    text: doc.data().text,
                }))
            );
        });

        return () => unsubscribe();
    }, [user]);

    // 🔹 Save clipboard entry
    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save!", {
                position: "bottom-center",
                autoClose: 5000,
            });
            return;
        }

        if (!input.trim()) return;

        await addDoc(collection(db, "clipboard"), {
            text: input,
            createdAt: serverTimestamp(),
            uid: user.uid, // ✅ link entry to logged-in user
        });

        setInput(""); // clear input box
        toast.success("Saved to clipboard history", {
            position: "bottom-center",
            autoClose: 5000,
        });
    };

    // 🔹 Copy to clipboard with notification
    const handleCopy = async (text) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard", {
                    position: "bottom-center",
                    autoClose: 5000,
                });
                return;
            }
        } catch (err) {
            console.warn("navigator.clipboard failed:", err);
        }

        // Fallback method
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.top = "0";
            ta.style.left = "0";
            document.body.appendChild(ta);

            ta.focus();
            ta.select();

            const ok = document.execCommand("copy");
            document.body.removeChild(ta);

            if (ok) {
                toast.success("Copied to clipboard", {
                    position: "bottom-center",
                    autoClose: 5000,
                });
            } else {
                throw new Error("execCommand copy failed");
            }
        } catch (err) {
            console.error("Fallback copy failed", err);
            toast.error("Copy not supported on this device ❌", {
                position: "bottom-center",
                autoClose: 5000,
            });
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
            <h2>Cloud Clipboard</h2>

            <textarea
                rows="3"
                style={{
                    height: "100px",
                    width: "100%",
                    marginBottom: "10px",
                    padding: "15px",
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type something..."
            />

            <button onClick={handleSave}>Save</button>

            {/* Show history only if user is logged in AND has items */}
            {user && items.length > 0 && (
                <>
                    <h3 style={{ marginTop: "70px" }}>History</h3>
                    <div>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    padding: "6px 10px",
                                    marginBottom: "6px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    background: "#f9f9f9",
                                }}
                            >
                                <span>{item.text}</span>
                                <button onClick={() => handleCopy(item.text)}>Copy</button>
                            </div>
                        ))}
                    </div>
                </>
            )}


            {/* Toast notifications container */}
            <ToastContainer />
        </div>
    );
}
