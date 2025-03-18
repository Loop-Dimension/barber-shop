import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/api";

export default function HeroSection() {
    // Queue states
    const [showModal, setShowModal] = useState(false);
    const [queueData, setQueueData] = useState(null);
    const [allQueueEntries, setAllQueueEntries] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cancelConfirmation, setCancelConfirmation] = useState(false);
    const [rescheduleMode, setRescheduleMode] = useState(false);
    const [newTime, setNewTime] = useState("");
    const [availableTimes] = useState([
        "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00"
    ]);

    // Appointment states
    const [showApptModal, setShowApptModal] = useState(false);
    const [appointmentId, setAppointmentId] = useState("");
    const [appointmentData, setAppointmentData] = useState(null);
    const [appointmentError, setAppointmentError] = useState("");
    const [showAppointmentSearch, setShowAppointmentSearch] = useState(false);
    const [cancelAppointmentConfirm, setCancelAppointmentConfirm] = useState(false);
    const [rescheduleAppointment, setRescheduleAppointment] = useState(false);
    const [newAppointmentTime, setNewAppointmentTime] = useState("");
    const [newAppointmentDate, setNewAppointmentDate] = useState("");

    // All Queues modal state
    const [showAllQueuesModal, setShowAllQueuesModal] = useState(false);

    // Helper to include JWT in headers if available.
    const getAuthHeaders = () => {
        const token = localStorage.getItem("accessToken");
        return token
            ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json" };
    };

    // JOIN QUEUE
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
            .catch(() => {
                setError("Error joining the queue automatically");
                setQueueData(null);
                setIsLoading(false);
            });
    };

    // FETCH QUEUE STATUS
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

    // FETCH ALL QUEUE ENTRIES
    const fetchAllQueueEntries = () => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/queue/list/`, {
            headers: getAuthHeaders(),
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Error fetching queue data");
                }
                return res.json();
            })
            .then((data) => {
                setAllQueueEntries(data);
                setIsLoading(false);
            })
            .catch(() => {
                setError("Error fetching queue entries");
                setIsLoading(false);
            });
    };

    // FETCH APPOINTMENT BY ID
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

    // CANCEL APPOINTMENT
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
            .catch(() => {
                setAppointmentError("Failed to cancel your appointment");
                setIsLoading(false);
                setCancelAppointmentConfirm(false);
            });
    };

    // RESCHEDULE APPOINTMENT (using ISO format date-time)
    const handleRescheduleAppointment = () => {
        if (
            !appointmentData ||
            !appointmentData.id ||
            !newAppointmentTime ||
            !newAppointmentDate
        ) {
            setAppointmentError("Please select both a new date and time");
            return;
        }
        const newAppointmentDateTime = `${newAppointmentDate}T${newAppointmentTime}:00`;
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/appointments/reschedule/${appointmentData.id}/`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ newAppointmentTime: newAppointmentDateTime }),
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
                setNewAppointmentDate("");
                alert("Appointment rescheduled successfully");
            })
            .catch(() => {
                setAppointmentError("Failed to reschedule your appointment");
                setIsLoading(false);
            });
    };

    // CANCEL QUEUE
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
            .catch(() => {
                setError("Failed to cancel your queue entry");
                setIsLoading(false);
                setCancelConfirmation(false);
            });
    };

    // RESCHEDULE QUEUE
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
            .catch(() => {
                setError("Failed to reschedule your queue entry");
                setIsLoading(false);
            });
    };

    // Poll queue status every 5 seconds when queue modal is open
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

    // Poll all queue entries every 5 seconds when viewing all queues
    useEffect(() => {
        let interval;
        if (showAllQueuesModal) {
            fetchAllQueueEntries();
            interval = setInterval(() => {
                fetchAllQueueEntries();
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [showAllQueuesModal]);

    // When the queue modal opens, fetch the queue status immediately if a queueId exists
    useEffect(() => {
        if (showModal) {
            const storedQueueId = localStorage.getItem("queueId");
            if (storedQueueId) {
                fetchQueueStatus(storedQueueId);
            }
        }
    }, [showModal]);

    // Handle joining the queue manually via the form
    const handleJoinQueue = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        joinQueueAutomatically(name);
    };

    // Close modals and clear temporary state
    const closeModal = () => {
        setShowModal(false);
        setName("");
        setQueueData(null);
        setError("");
        setCancelConfirmation(false);
        setRescheduleMode(false);
    };

    const closeApptModal = () => {
        setShowApptModal(false);
        setAppointmentId("");
        setAppointmentData(null);
        setAppointmentError("");
        setCancelAppointmentConfirm(false);
        setRescheduleAppointment(false);
        setNewAppointmentTime("");
        setNewAppointmentDate("");
        setShowAppointmentSearch(false);
    };

    const closeAllQueuesModal = () => {
        setShowAllQueuesModal(false);
        setAllQueueEntries([]);
    };

    // Get tomorrow's date in YYYY-MM-DD format for date input min attribute
    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
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
                                    className="button-1 mt-20 mr-20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowApptModal(true);
                                        setShowAppointmentSearch(true);
                                    }}
                                >
                                    Manage My Appointment<span />
                                </a>
                                <a
                                    href="#"
                                    className="button-1 mt-20"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowAllQueuesModal(true);
                                    }}
                                >
                                    View All Queues<span />
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
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Walk-In Queue</h5>
                                    <button type="button" className="close" onClick={closeModal} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {isLoading && <p>Loading...</p>}
                                    {error && <p className="text-danger">{error}</p>}

                                    {/* Cancellation Confirmation */}
                                    {cancelConfirmation && queueData && (
                                        <div>
                                            <p className="alert alert-warning">
                                                Are you sure you want to cancel your place in the queue?
                                            </p>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button className="btn btn-danger" onClick={handleCancelQueue} disabled={isLoading}>
                                                    Yes, Cancel
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => setCancelConfirmation(false)} disabled={isLoading}>
                                                    No, Keep My Place
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Reschedule Queue */}
                                    {rescheduleMode && queueData && !cancelConfirmation && (
                                        <div>
                                            <h6>Select a New Time:</h6>
                                            <select className="form-control mb-3" value={newTime} onChange={(e) => setNewTime(e.target.value)}>
                                                <option value="">Select a time</option>
                                                {availableTimes.map((time, index) => (
                                                    <option key={index} value={time}>
                                                        {time}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button className="btn btn-primary" onClick={handleRescheduleQueue} disabled={!newTime || isLoading}>
                                                    Confirm Reschedule
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => setRescheduleMode(false)} disabled={isLoading}>
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
                                                <strong>Current Position:</strong> {queueData.position}
                                            </p>
                                            <div className="mt-3 d-flex justify-content-between">

                                                <button className="btn btn-outline-danger" onClick={() => setCancelConfirmation(true)}>
                                                    Cancel Queue
                                                </button>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <button className="btn btn-link" onClick={() => { closeModal(); setShowApptModal(true); setShowAppointmentSearch(true); }}>
                                                    Need to manage an appointment instead?
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Join Queue Form */}
                                    {!queueData && !cancelConfirmation && !rescheduleMode && (
                                        <form onSubmit={handleJoinQueue}>
                                            <div className="form-group">
                                                <label htmlFor="name">Enter Your Name to Join Queue</label>
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
                                            <div className="mt-3 text-center">
                                                <button className="btn btn-link" onClick={() => { closeModal(); setShowApptModal(true); setShowAppointmentSearch(true); }}>
                                                    Need to manage an appointment instead?
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* All Queues Modal */}
            {showAllQueuesModal && (
                <>
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Current Queue Status</h5>
                                    <button type="button" className="close" onClick={closeAllQueuesModal} aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {isLoading && <p>Loading queue data...</p>}
                                    {error && <p className="text-danger">{error}</p>}
                                    <p className="text-muted small">
                                        <i className="fas fa-sync-alt mr-1"></i>
                                        Live data - refreshes automatically every 5 seconds
                                    </p>
                                    {allQueueEntries.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Position</th>
                                                        <th>Name</th>
                                                        <th>Join Time</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allQueueEntries.map((entry) => (
                                                        <tr key={entry.id}>
                                                            <td>{entry.position}</td>
                                                            <td>{entry.name}</td>
                                                            <td>
                                                                {new Date(entry.created_at).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </td>
                                                            <td>
                                                                <span className={`badge badge-${entry.status === "pending" ? "warning" : "success"}`}>
                                                                    {entry.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-center">No one is currently in the queue.</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary mr-2" onClick={fetchAllQueueEntries}>
                                        Refresh Now
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={closeAllQueuesModal}>
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
                    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Manage Appointment</h5>
                                    <button type="button" className="close" onClick={closeApptModal} aria-label="Close">
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
                                                <label htmlFor="appointmentId">Enter Your Appointment ID</label>
                                                <input
                                                    type="text"
                                                    id="appointmentId"
                                                    className="form-control"
                                                    value={appointmentId}
                                                    onChange={(e) => setAppointmentId(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <button className="btn btn-primary mt-2" onClick={fetchAppointment} disabled={isLoading || !appointmentId}>
                                                Find My Appointment
                                            </button>
                                            <div className="mt-3 text-center">
                                                <button className="btn btn-link" onClick={() => { closeApptModal(); setShowModal(true); }}>
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
                                                <button className="btn btn-danger" onClick={handleCancelAppointment} disabled={isLoading}>
                                                    Yes, Cancel Appointment
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => setCancelAppointmentConfirm(false)} disabled={isLoading}>
                                                    No, Keep Appointment
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Reschedule View */}
                                    {rescheduleAppointment && appointmentData && !cancelAppointmentConfirm && (
                                        <div>
                                            <h6>Select a New Date and Time:</h6>
                                            <div className="form-group">
                                                <label htmlFor="newDate">New Date:</label>
                                                <input
                                                    type="date"
                                                    id="newDate"
                                                    className="form-control mb-3"
                                                    value={newAppointmentDate}
                                                    onChange={(e) => setNewAppointmentDate(e.target.value)}
                                                    min={getTomorrowDate()}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="newTime">New Time:</label>
                                                <select
                                                    id="newTime"
                                                    className="form-control mb-3"
                                                    value={newAppointmentTime}
                                                    onChange={(e) => setNewAppointmentTime(e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select a time</option>
                                                    {availableTimes.map((time, index) => (
                                                        <option key={index} value={time}>
                                                            {time}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="d-flex justify-content-between mt-3">
                                                <button className="btn btn-primary" onClick={handleRescheduleAppointment} disabled={!newAppointmentTime || !newAppointmentDate || isLoading}>
                                                    Confirm Reschedule
                                                </button>
                                                <button className="btn btn-secondary" onClick={() => setRescheduleAppointment(false)} disabled={isLoading}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Appointment Details View */}
                                    {appointmentData && !cancelAppointmentConfirm && !rescheduleAppointment && (
                                        <div>
                                            <p><strong>Appointment ID:</strong> {appointmentData.id}</p>
                                            <p><strong>Date:</strong> {appointmentData.appointment_date}</p>
                                            <p><strong>Time:</strong> {appointmentData.appointment_time}</p>

                                            <p><strong>Status:</strong> {appointmentData.status}</p>
                                            <div className="mt-3 d-flex justify-content-between">
                                                <button className="btn btn-outline-primary" onClick={() => setRescheduleAppointment(true)} disabled={appointmentData.status === "cancelled" || appointmentData.status === "completed"}>
                                                    Reschedule
                                                </button>
                                                <button className="btn btn-outline-danger" onClick={() => setCancelAppointmentConfirm(true)} disabled={appointmentData.status === "cancelled" || appointmentData.status === "completed"}>
                                                    Cancel Appointment
                                                </button>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <button className="btn btn-link" onClick={() => { closeApptModal(); setShowModal(true); }}>
                                                    Need to check your walk-in queue instead?
                                                </button>
                                                <button className="btn btn-link mt-1" onClick={() => { closeApptModal(); setShowAllQueuesModal(true); }}>
                                                    View all current queues
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeApptModal}>
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
