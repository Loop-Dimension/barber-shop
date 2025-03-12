import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/api";

export default function HeroSection() {
    const [showModal, setShowModal] = useState(false);
    const [queueData, setQueueData] = useState(null);
    const [error, setError] = useState("");
    const [name, setName] = useState(""); // For entering the name to join queue
    const [isLoading, setIsLoading] = useState(false);

    // Function to automatically join the queue with a given name.
    // Saves both the queue ID and the name in localStorage.
    const joinQueueAutomatically = (queueName) => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: queueName }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error joining queue");
                }
                return res.json();
            })
            .then((data) => {
                localStorage.setItem("queueId", data.id);
                localStorage.setItem("queueName", queueName);
                setQueueData(data);
                setError("");
                setIsLoading(false);
            })
            .catch((err) => {
                setError("Error joining the queue automatically");
                setQueueData(null);
                setIsLoading(false);
            });
    };

    // Function to fetch the current queue status using the stored queue ID.
    // If the response is a 404, it automatically calls joinQueueAutomatically.
    const fetchQueueStatus = (queueId) => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/search/${queueId}`)
            .then((res) => {
                if (res.status === 404) {
                    throw new Error("NotFound");
                }
                if (!res.ok) {
                    throw new Error("FetchError");
                }
                return res.json();
            })
            .then((data) => {
                setQueueData(data);
                setError("");
                setIsLoading(false);
            })
            .catch((err) => {
                if (err.message === "NotFound") {
                    const storedName = localStorage.getItem("queueName");
                    if (storedName) {
                        joinQueueAutomatically(storedName);
                    } else {
                        setError("Queue entry not found. Please join the queue.");
                        setQueueData(null);
                    }
                } else {
                    setError("Error fetching queue data");
                    setQueueData(null);
                }
                setIsLoading(false);
            });
    };

    // Poll the queue status every 5 seconds while the modal is open and a queueId exists.
    useEffect(() => {
        let interval;
        if (showModal && localStorage.getItem("queueId")) {
            interval = setInterval(() => {
                fetchQueueStatus(localStorage.getItem("queueId"));
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showModal]);

    // When the modal opens, if a queue ID exists in localStorage, fetch its status immediately.
    useEffect(() => {
        if (showModal) {
            const storedQueueId = localStorage.getItem("queueId");
            if (storedQueueId) {
                fetchQueueStatus(storedQueueId);
            }
        }
    }, [showModal]);

    // Handle manual queue join via the form.
    const handleJoinQueue = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        joinQueueAutomatically(name);
    };

    // Close the modal and clear temporary state.
    const closeModal = () => {
        setShowModal(false);
        setName("");
        setQueueData(null);
        setError("");
    };

    return (
        <>
            <div
                className="banner-header full-height valign bg-img bg-fixed"
                data-overlay-light={0}

            >
                <div className="container">
                    <div className="row content-justify-center">
                        <div className="col-md-12 text-center">
                            <div className="v-middle">
                                <h5>Stay Stylish, Look Confident</h5>
                                <h1>
                                    TORONTO'S PREMIER
                                    <br />
                                    HAIR SALON & BARBER SHOP
                                </h1>
                                <h5>483 Bay Street, Toronto. Appointment: 416-212-3051</h5>
                                <a href="#Appointment" className="button-1 mt-20 mr-20">
                                    Book Appointment<span />
                                </a>
                                <a
                                    href="#"
                                    className="button-1 mt-20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowModal(true);
                                    }}
                                >
                                    Check Queue / Join Walk-In<span />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="arrow bounce text-center">
                    <a href="#about" data-scroll-nav={1}>
                        <i className="ti-arrow-down" />
                    </a>
                </div>
            </div>
            {showModal && (
                <>
                    <div
                        className="modal fade show"
                        style={{ display: "block" }}
                        tabIndex="-1"
                        role="dialog"
                    >
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Walk-In Queue</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={closeModal}
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {isLoading && <p>Loading...</p>}
                                    {error && <p className="text-danger">{error}</p>}
                                    {queueData ? (
                                        <div>
                                            <p>
                                                <strong>Your Queue ID:</strong> {queueData.id}
                                            </p>
                                            <p>
                                                <strong>Current Position:</strong> {queueData.position}
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleJoinQueue}>
                                            <div className="form-group">
                                                <label htmlFor="name">
                                                    Enter Your Name to Join Queue
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    className="form-control"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary mt-2">
                                                Join Queue
                                            </button>
                                        </form>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeModal}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
}
