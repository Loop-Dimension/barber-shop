import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/api";

export default function HeroSection() {
    const [showModal, setShowModal] = useState(false);
    const [showApptModal, setShowApptModal] = useState(false);
    const [queueData, setQueueData] = useState(null);
    const [appointmentData, setAppointmentData] = useState(null);
    const [error, setError] = useState("");
    const [name, setName] = useState(""); // For entering the name to join queue
    const [isLoading, setIsLoading] = useState(false);
    const [cancelConfirmation, setCancelConfirmation] = useState(false);
    const [rescheduleMode, setRescheduleMode] = useState(false);
    const [newTime, setNewTime] = useState("");
    const [availableTimes, setAvailableTimes] = useState([
        "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00"
    ]);

    // Appointment states
    const [appointmentId, setAppointmentId] = useState("");
    const [showAppointmentSearch, setShowAppointmentSearch] = useState(false);
    const [cancelAppointmentConfirm, setCancelAppointmentConfirm] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState(false);
    const [newAppointmentTime, setNewAppointmentTime] = useState("");
    const [appointmentError, setAppointmentError] = useState("");

    // Helper to include JWT in headers if available.
    const getAuthHeaders = () => {
        const token = localStorage.getItem("accessToken");
        return token
            ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" };
    };

    // Automatically join the queue with a given name.
    // Saves both the queue ID and the name in localStorage.
    const joinQueueAutomatically = (queueName) => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/`, {
            method: "POST",
            headers: getAuthHeaders(),
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

    // Fetch the current queue status using the stored queue ID.
    // If the response is a 404, automatically call joinQueueAutomatically.
    const fetchQueueStatus = (queueId) => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/search/${queueId}/`, {
            headers: getAuthHeaders(),
        })
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

    // Fetch appointment data by ID
    const fetchAppointment = () => {
        if (!appointmentId) {
            setAppointmentError("Please enter an appointment ID");
            return;
        }

        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/`, {
            headers: getAuthHeaders(),
        })
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
                setAppointmentData(data);
                setAppointmentError("");
                setIsLoading(false);
            })
            .catch((err) => {
                if (err.message === "NotFound") {
                    setAppointmentError("Appointment not found. Please check your ID.");
                } else {
                    setAppointmentError("Error fetching appointment data");
                }
                setAppointmentData(null);
                setIsLoading(false);
            });
    };

    // Cancel appointment
    const handleCancelAppointment = () => {
        if (!appointmentData || !appointmentData.id) return;

        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/appointments/cancel/${appointmentData.id}/`, {
            method: "POST",
            headers: getAuthHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error cancelling appointment");
                }
                return res.json();
            })
            .then(() => {
                setAppointmentData(null);
                setAppointmentError("");
                setAppointmentId("");
                setIsLoading(false);
                setCancelAppointmentConfirm(false);
            })
            .catch((err) => {
                setAppointmentError("Failed to cancel your appointment");
                setIsLoading(false);
                setCancelAppointmentConfirm(false);
            });
    };

    // Reschedule appointment
    const handleRescheduleAppointment = () => {
        if (!appointmentData || !appointmentData.id || !newAppointmentTime) {
            setAppointmentError("Please select a new time");
            return;
        }

        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/appointments/reschedule/${appointmentData.id}/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ new_time: newAppointmentTime }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error rescheduling appointment");
                }
                return res.json();
            })
            .then((data) => {
                setAppointmentData(data);
                setAppointmentError("");
                setIsLoading(false);
                setRescheduleAppointment(false);
                setNewAppointmentTime("");
            })
            .catch((err) => {
                setAppointmentError("Failed to reschedule your appointment");
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

    // When the modal opens, if a queue ID exists, fetch its status immediately.
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
        setCancelConfirmation(false);
        setRescheduleMode(false);
    };

    // Close appointment modal
    const closeApptModal = () => {
        setShowApptModal(false);
        setAppointmentId("");
        setAppointmentData(null);
        setAppointmentError("");
        setCancelAppointmentConfirm(false);
        setRescheduleAppointment(false);
        setNewAppointmentTime("");
        setShowAppointmentSearch(false);
    };

    // Handle queue cancellation
    const handleCancelQueue = () => {
        if (!queueData || !queueData.id) return;

        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/cancel/${queueData.id}/`, {
            method: "POST",
            headers: getAuthHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error cancelling queue entry");
                }
                return res.json();
            })
            .then(() => {
                localStorage.removeItem("queueId");
                localStorage.removeItem("queueName");
                setQueueData(null);
                setError("");
                setIsLoading(false);
                setCancelConfirmation(false);
            })
            .catch((err) => {
                setError("Failed to cancel your queue entry");
                setIsLoading(false);
                setCancelConfirmation(false);
            });
    };

    // Handle queue reschedule
    const handleRescheduleQueue = () => {
        if (!queueData || !queueData.id || !newTime) {
            setError("Please select a new time");
            return;
        }

        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/reschedule/${queueData.id}/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ new_time: newTime }),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error rescheduling queue entry");
                }
                return res.json();
            })
            .then((data) => {
                setQueueData(data);
                setError("");
                setIsLoading(false);
                setRescheduleMode(false);
                setNewTime("");
            })
            .catch((err) => {
                setError("Failed to reschedule your queue entry");
                setIsLoading(false);
            });
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
                                <h5>
                                    483 Bay Street, Toronto. Appointment: 416-212-3051
                                </h5>
                                <a href="#Appointment" className="button-1 mt-20 mr-20">
                                    Book Appointment<span />
                                </a>
                                <a
                                    href="#"
                                    className="button-1 mt-20 mr-20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowModal(true);
                                    }}
                                >
                                    Check Queue / Join Walk-In<span />
                                </a>
                                <a
                                    href="#"
                                    className="button-1 mt-20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowApptModal(true);
                                        setShowAppointmentSearch(true);
                                    }}
                                >
                                    Manage My Appointment<span />
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

            {/* Queue Modal */}
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

                                    {/* Cancellation Confirmation View */}
                                    {cancelConfirmation && queueData && (
                                        <div>
                                            <p className="alert alert-warning">
                                                Are you sure you want to cancel your place in the queue?
                                            </p>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={handleCancelQueue}
                                                    disabled={isLoading}
                                                >
                                                    Yes, Cancel
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setCancelConfirmation(false)}
                                                    disabled={isLoading}
                                                >
                                                    No, Keep My Place
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reschedule View */}
                                    {rescheduleMode && queueData && !cancelConfirmation && (
                                        <div>
                                            <h6>Select a New Time:</h6>
                                            <select
                                                className="form-control mb-3"
                                                value={newTime}
                                                onChange={(e) => setNewTime(e.target.value)}
                                            >
                                                <option value="">Select a time</option>
                                                {availableTimes.map((time, index) => (
                                                    <option key={index} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleRescheduleQueue}
                                                    disabled={!newTime || isLoading}
                                                >
                                                    Confirm Reschedule
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setRescheduleMode(false)}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Normal Queue View */}
                                    {queueData && !cancelConfirmation && !rescheduleMode && (
                                        <div>
                                            <p>
                                                <strong>Your Queue ID:</strong> {queueData.id}
                                            </p>
                                            <p>
                                                <strong>Current Position:</strong>{" "}
                                                {queueData.position}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="mt-3 d-flex justify-content-between">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setRescheduleMode(true)}
                                                >
                                                    Reschedule
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setCancelConfirmation(true)}
                                                >
                                                    Cancel Queue
                                                </button>
                                            </div>

                                            {/* View Appointment Button */}
                                            <div className="mt-3 text-center">
                                                <button
                                                    className="btn btn-link"
                                                    onClick={() => {
                                                        closeModal();
                                                        setShowApptModal(true);
                                                        setShowAppointmentSearch(true);
                                                    }}
                                                >
                                                    Need to manage an appointment instead?
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Queue Join Form */}
                                    {!queueData && !cancelConfirmation && !rescheduleMode && (
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

                                            {/* View Appointment Button */}
                                            <div className="mt-3 text-center">
                                                <button
                                                    className="btn btn-link"
                                                    onClick={() => {
                                                        closeModal();
                                                        setShowApptModal(true);
                                                        setShowAppointmentSearch(true);
                                                    }}
                                                >
                                                    Need to manage an appointment instead?
                                                </button>
                                            </div>
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

            {/* Appointment Management Modal */}
            {showApptModal && (
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
                                    <h5 className="modal-title">Manage Appointment</h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={closeApptModal}
                                        aria-label="Close"
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {isLoading && <p>Loading...</p>}
                                    {appointmentError && <p className="text-danger">{appointmentError}</p>}

                                    {/* Appointment Search Form */}
                                    {showAppointmentSearch && !appointmentData && (
                                        <div>
                                            <div className="form-group">
                                                <label htmlFor="appointmentId">
                                                    Enter Your Appointment ID
                                                </label>
                                                <input
                                                    type="text"
                                                    id="appointmentId"
                                                    className="form-control"
                                                    value={appointmentId}
                                                    onChange={(e) => setAppointmentId(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button
                                                className="btn btn-primary mt-2"
                                                onClick={fetchAppointment}
                                                disabled={isLoading || !appointmentId}
                                            >
                                                Find My Appointment
                                            </button>

                                            {/* View Queue Button */}
                                            <div className="mt-3 text-center">
                                                <button
                                                    className="btn btn-link"
                                                    onClick={() => {
                                                        closeApptModal();
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    Need to check your walk-in queue instead?
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Cancellation Confirmation */}
                                    {cancelAppointmentConfirm && appointmentData && (
                                        <div>
                                            <p className="alert alert-warning">
                                                Are you sure you want to cancel your appointment?
                                            </p>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={handleCancelAppointment}
                                                    disabled={isLoading}
                                                >
                                                    Yes, Cancel Appointment
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setCancelAppointmentConfirm(false)}
                                                    disabled={isLoading}
                                                >
                                                    No, Keep Appointment
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Reschedule View */}
                                    {rescheduleAppointment && appointmentData && !cancelAppointmentConfirm && (
                                        <div>
                                            <h6>Select a New Time:</h6>
                                            <select
                                                className="form-control mb-3"
                                                value={newAppointmentTime}
                                                onChange={(e) => setNewAppointmentTime(e.target.value)}
                                            >
                                                <option value="">Select a time</option>
                                                {availableTimes.map((time, index) => (
                                                    <option key={index} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleRescheduleAppointment}
                                                    disabled={!newAppointmentTime || isLoading}
                                                >
                                                    Confirm Reschedule
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setRescheduleAppointment(false)}
                                                    disabled={isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Details View */}
                                    {appointmentData && !cancelAppointmentConfirm && !rescheduleAppointment && (
                                        <div>
                                            <p>
                                                <strong>Appointment ID:</strong> {appointmentData.id}
                                            </p>
                                            <p>
                                                <strong>Date:</strong> {appointmentData.appointment_date}
                                            </p>
                                            <p>
                                                <strong>Time:</strong> {appointmentData.appointment_time}
                                            </p>
                                            <p>
                                                <strong>Barber:</strong> {appointmentData.barber_name}
                                            </p>
                                            <p>
                                                <strong>Service:</strong> {appointmentData.service_name}
                                            </p>
                                            <p>
                                                <strong>Status:</strong> {appointmentData.status}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="mt-3 d-flex justify-content-between">
                                                <button
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setRescheduleAppointment(true)}
                                                    disabled={appointmentData.status === 'cancelled' || appointmentData.status === 'completed'}
                                                >
                                                    Reschedule
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setCancelAppointmentConfirm(true)}
                                                    disabled={appointmentData.status === 'cancelled' || appointmentData.status === 'completed'}
                                                >
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={closeApptModal}
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