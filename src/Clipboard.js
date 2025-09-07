import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    where,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./AuthContext";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function Clipboard() {
    const [input, setInput] = useState("");
    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState("");
    const { user } = useAuth();

    // 🔹 Load clipboard history
    useEffect(() => {
        if (!user) {
            setItems([]);
            return;
        }

        const q = query(
            collection(db, "clipboard"),
            where("uid", "==", user.uid),
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

    // 🔹 Save new entry
    const handleSave = async () => {
        if (!user) {
            toast.error("Please login to save!");
            return;
        }

        if (!input.trim()) return;

        await addDoc(collection(db, "clipboard"), {
            text: input,
            createdAt: serverTimestamp(),
            uid: user.uid,
        });

        setInput("");
        toast.success("Saved!");
    };

    // 🔹 Handle select/unselect
    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    // 🔹 Open modal for delete
    const openDeleteModal = () => {
        if (selected.length === 0) {
            toast.error("Select at least 1 item to delete!");
            return;
        }
        setShowModal(true);
    };

    // 🔹 Confirm delete after password check
    const confirmDelete = async () => {
        if (!password) {
            toast.error("Enter your password!");
            return;
        }

        try {
            const auth = getAuth();
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);

            // Delete all selected at once
            const batchDelete = selected.map((id) => deleteDoc(doc(db, "clipboard", id)));
            await Promise.all(batchDelete);

            setSelected([]);
            setPassword("");
            setShowModal(false);
            toast.success("Deleted successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Password incorrect ❌");
        }
    };

    const cancelDelete = () => {
        setPassword("");
        setShowModal(false);
    };

    // 🔹 Copy
    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Copied!");
        } catch {
            toast.error("Copy failed!");
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

            {user && items.length > 0 && (
                <div style={{ marginTop: "40px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                        }}
                    >
                        <h3 style={{ margin: 0 }}>History</h3>
                        <button
                            onClick={openDeleteModal}
                            disabled={selected.length === 0}
                            style={{
                                background: selected.length === 0 ? "#ccc" : "red",
                                color: "white",
                                padding: "6px 12px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: selected.length === 0 ? "not-allowed" : "pointer",
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* 🔹 Clipboard items */}
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
                        <input
                            type="checkbox"
                            checked={selected.includes(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            style={{ marginRight: "10px" }}
                        />
                        <span style={{ flex: 1 }}>{item.text}</span>
                        <button onClick={() => handleCopy(item.text)}>Copy</button>
                    </div>
                ))}
            </div>

            {/* 🔹 Delete Confirmation Modal */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            width: "300px",
                            textAlign: "center",
                        }}
                    >
                        <h3>Confirm Delete</h3>
                        <p>
                            Are you sure you want to delete{" "}
                            {selected.length === 1
                                ? "this item?"
                                : `${selected.length} items?`}
                        </p>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={{
                                width: "100%",
                                padding: "8px",
                                margin: "10px 0",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}
                        />

                        <div style={{ marginTop: "10px" }}>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    background: "red",
                                    color: "white",
                                    padding: "8px 12px",
                                    marginRight: "10px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={cancelDelete}
                                style={{
                                    background: "#ccc",
                                    padding: "8px 12px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="bottom-center" autoClose={5000} />
        </div>
    );
}
