import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Clipboard() {
    const [input, setInput] = useState("");
    const [items, setItems] = useState([]);

    // 🔹 Load clipboard history in realtime
    useEffect(() => {
        const q = query(
            collection(db, "clipboard"),
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
    }, []);

    // 🔹 Save clipboard entry
    const handleSave = async () => {
        if (!input.trim()) return;
        await addDoc(collection(db, "clipboard"), {
            text: input,
            createdAt: serverTimestamp(),
        });
        setInput(""); // clear input box after save
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

        // Fallback method for mobile / older browsers
        try {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.top = "0";
            ta.style.left = "0";
            ta.style.width = "1px";
            ta.style.height = "1px";
            ta.style.padding = "0";
            ta.style.border = "none";
            ta.style.outline = "none";
            ta.style.boxShadow = "none";
            ta.style.background = "transparent";
            document.body.appendChild(ta);

            ta.focus();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);

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
                style={{ height: "100px", width: "100%", marginBottom: "10px", padding: "15px" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type something..."
            />

            <button onClick={handleSave}>Save</button>

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

            {/* Toast notifications container */}
            <ToastContainer />
        </div>
    );
}
