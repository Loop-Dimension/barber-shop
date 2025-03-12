import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    FaUser,
    FaList,
    FaPlus,
    FaTrash,
    FaCheckCircle,
    FaTimesCircle,
    FaEdit,
    FaSignOutAlt
} from "react-icons/fa";
import API_BASE_URL from "../api/api";

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("barbers");
    const [barbers, setBarbers] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [queueEntries, setQueueEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filterDate, setFilterDate] = useState(new Date());
    const [showBarberModal, setShowBarberModal] = useState(false);
    const [newBarber, setNewBarber] = useState({
        name: "",
        experience: "",
        start: "09:00",
        end: "17:00",
        slotDuration: 30,
        availableDays: "Monday,Tuesday,Wednesday,Thursday,Friday"
    });
    const navigate = useNavigate();
    const getAuthConfig = () => {
        const token = localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user")).idToken
            : "";
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    useEffect(() => {
        if (activeTab === "barbers") fetchBarbers();
        if (activeTab === "appointments") fetchAppointments(filterDate);
        if (activeTab === "queue") fetchQueueEntries();
    }, [activeTab, filterDate]);

    const fetchBarbers = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/api/barbers`, getAuthConfig());
            setBarbers(res.data);
        } catch (err) {
            setError("Failed to load barbers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async (date) => {
        try {
            setLoading(true);
            setError(null);
            const formattedDate = date.toISOString().split("T")[0];
            const res = await axios.get(`${API_BASE_URL}/api/appointments/${formattedDate}`, getAuthConfig());
            setAppointments(res.data);
        } catch (err) {
            setError("Failed to load appointments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchQueueEntries = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`${API_BASE_URL}/api/queue`, getAuthConfig());
            setQueueEntries(res.data);
        } catch (err) {
            setError("Failed to load queue entries. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddBarber = async () => {
        try {
            setLoading(true);
            setError(null);
            const payload = {
                name: newBarber.name,
                experience: newBarber.experience,
                workingHours: {
                    start: newBarber.start,
                    end: newBarber.end,
                    slotDuration: parseInt(newBarber.slotDuration, 10)
                },
                availableDays: newBarber.availableDays.split(",").map((day) => day.trim())
            };
            await axios.post(`${API_BASE_URL}/api/barbers`, payload, getAuthConfig());
            setShowBarberModal(false);
            setNewBarber({
                name: "",
                experience: "",
                start: "09:00",
                end: "17:00",
                slotDuration: 30,
                availableDays: "Monday,Tuesday,Wednesday,Thursday,Friday"
            });
            fetchBarbers();
        } catch (err) {
            setError("Failed to add barber. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBarber = async (id) => {
        if (window.confirm("Are you sure you want to delete this barber? This will also delete all their appointments.")) {
            try {
                setLoading(true);
                setError(null);
                await axios.delete(`${API_BASE_URL}/api/barbers/${id}`, getAuthConfig());
                fetchBarbers();
            } catch (err) {
                setError("Failed to delete barber. Please try again.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCompleteAppointment = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await axios.post(`${API_BASE_URL}/api/appointments/complete/${id}`, {}, getAuthConfig());
            fetchAppointments(filterDate);
        } catch (err) {
            setError("Failed to mark appointment as complete.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await axios.post(`${API_BASE_URL}/api/appointments/cancel/${id}`, {}, getAuthConfig());
            fetchAppointments(filterDate);
        } catch (err) {
            setError("Failed to cancel appointment.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (window.confirm("Are you sure you want to delete this appointment?")) {
            try {
                setLoading(true);
                setError(null);
                await axios.delete(`${API_BASE_URL}/api/appointments/${id}`, getAuthConfig());
                fetchAppointments(filterDate);
            } catch (err) {
                setError("Failed to delete appointment.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRescheduleAppointment = async (id) => {
        const newTime = prompt("Enter new appointment time (YYYY-MM-DDTHH:MM)", "");
        if (newTime) {
            try {
                setLoading(true);
                setError(null);
                await axios.post(`${API_BASE_URL}/api/appointments/reschedule/${id}`, { newAppointmentTime: newTime }, getAuthConfig());
                fetchAppointments(filterDate);
            } catch (err) {
                setError("Failed to reschedule appointment.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteQueue = async (id) => {
        if (window.confirm("Are you sure you want to remove this queue entry?")) {
            try {
                setLoading(true);
                setError(null);
                await axios.delete(`${API_BASE_URL}/api/queue/${id}`, getAuthConfig());
                fetchQueueEntries();
            } catch (err) {
                setError("Failed to delete queue entry.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCompleteQueue = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await axios.post(`${API_BASE_URL}/api/queue/complete/${id}`, {}, getAuthConfig());
            fetchQueueEntries();
        } catch (err) {
            setError("Failed to mark queue entry as complete.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelQueue = async (id) => {
        try {
            setLoading(true);
            setError(null);
            await axios.post(`${API_BASE_URL}/api/queue/cancel/${id}`, {}, getAuthConfig());
            fetchQueueEntries();
        } catch (err) {
            setError("Failed to cancel queue entry.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const Sidebar = () => (
        <div className="bg-dark text-white vh-100 p-3" style={{ minWidth: "220px" }}>
            <h3 className="mb-4 text-center fw-bold">
                <FaUser className="me-2" />
                Barber Shop
            </h3>
            <hr className="border-light" />
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <button className={`btn btn-${activeTab === "barbers" ? "primary" : "outline-light"} w-100 d-flex align-items-center`} onClick={() => setActiveTab("barbers")}>
                        <FaUser className="me-3" /> Barbers
                    </button>
                </li>
                <li className="nav-item mb-3">
                    <button className={`btn btn-${activeTab === "appointments" ? "primary" : "outline-light"} w-100 d-flex align-items-center`} onClick={() => setActiveTab("appointments")}>
                        <FaList className="me-3" /> Appointments
                    </button>
                </li>
                <li className="nav-item mb-3">
                    <button className={`btn btn-${activeTab === "queue" ? "primary" : "outline-light"} w-100 d-flex align-items-center`} onClick={() => setActiveTab("queue")}>
                        <FaList className="me-3" /> Queue
                    </button>
                </li>
            </ul>
            <div className="mt-auto pt-5">
                <div className="d-grid gap-2">
                    <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                        <FaSignOutAlt className="me-2" /> Logout
                    </Button>
                </div>
            </div>
        </div>
    );

    const BarbersTab = () => (
        <div className="animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Barbers</h2>
                <button className="btn btn-success" onClick={() => setShowBarberModal(true)}>
                    <FaPlus className="me-2" /> Add Barber
                </button>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="light" />
                </div>
            ) : barbers.length === 0 ? (
                <Alert variant="info">No barbers found. Add a barber to get started.</Alert>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    {barbers.map((barber) => (
                        <div key={barber.id} className="col">
                            <Card className="h-100 bg-dark text-white border-primary">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">{barber.name}</h5>
                                    <Badge bg="info">{barber.experience} yrs exp.</Badge>
                                </Card.Header>
                                <Card.Body>
                                    <Card.Text>
                                        <strong>Working Hours:</strong><br />
                                        {barber.workingHours?.start} - {barber.workingHours?.end} (
                                        {barber.workingHours?.slotDuration} min slots)
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Available Days:</strong><br />
                                        {barber.availableDays.join(", ")}
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer className="d-grid">
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteBarber(barber.id)}>
                                        <FaTrash className="me-2" /> Remove Barber
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
            <Modal show={showBarberModal} onHide={() => setShowBarberModal(false)} centered backdrop="static">
                <Modal.Header closeButton className="bg-dark text-white">
                    <Modal.Title>
                        <FaPlus className="me-2" /> Add Barber
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={newBarber.name} onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })} className="bg-dark text-white" placeholder="Enter barber's name" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Experience (years)</Form.Label>
                            <Form.Control type="number" value={newBarber.experience} onChange={(e) => setNewBarber({ ...newBarber, experience: e.target.value })} className="bg-dark text-white" placeholder="Years of experience" />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Working Hours Start</Form.Label>
                                    <Form.Control type="time" value={newBarber.start} onChange={(e) => setNewBarber({ ...newBarber, start: e.target.value })} className="bg-dark text-white" />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Working Hours End</Form.Label>
                                    <Form.Control type="time" value={newBarber.end} onChange={(e) => setNewBarber({ ...newBarber, end: e.target.value })} className="bg-dark text-white" />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Slot Duration (minutes)</Form.Label>
                            <Form.Control type="number" value={newBarber.slotDuration} onChange={(e) => setNewBarber({ ...newBarber, slotDuration: e.target.value })} className="bg-dark text-white" min="15" max="120" step="15" />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Available Days</Form.Label>
                            <Form.Control type="text" value={newBarber.availableDays} onChange={(e) => setNewBarber({ ...newBarber, availableDays: e.target.value })} className="bg-dark text-white" placeholder="Monday,Tuesday,Wednesday,Thursday,Friday" />
                            <Form.Text className="text-muted">Enter days separated by commas</Form.Text>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="bg-dark text-white">
                    <Button variant="secondary" onClick={() => setShowBarberModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddBarber} disabled={loading || !newBarber.name || !newBarber.experience}>
                        {loading ? (<><Spinner animation="border" size="sm" className="me-2" /> Saving...</>) : (<>Add Barber</>)}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );

    const AppointmentsTab = () => {
        const formattedDate = filterDate.toISOString().split("T")[0];
        const sortedAppointments = appointments.sort((a, b) => a.position - b.position);
        return (
            <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Appointments</h2>
                    <div className="d-flex align-items-center gap-2">
                        <Form.Group controlId="appointmentDateFilter" className="mb-0">
                            <Form.Control type="date" value={formattedDate} onChange={(e) => setFilterDate(new Date(e.target.value))} className="bg-dark text-white" />
                        </Form.Group>
                        <Button variant="outline-info" onClick={() => fetchAppointments(filterDate)} disabled={loading}>
                            Refresh <FaList className="ms-2" />
                        </Button>
                    </div>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="light" /></div>
                ) : sortedAppointments.length === 0 ? (
                    <Alert variant="info">No appointments for the selected date.</Alert>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Customer Name</th>
                                    <th>Appointment Date</th>
                                    <th>Appointment Time</th>
                                    <th>Barber</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAppointments.map((app) => {
                                    const barber = barbers.find((b) => b.id === app.barberId);
                                    const time = new Date(app.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                    return (
                                        <tr key={app.id} className={app.status === "canceled" ? "table-danger" : ""}>
                                            <td><Badge bg={app.position === 1 ? "success" : "primary"} className="fs-6">{app.position}</Badge></td>
                                            <td>{app.customerName}</td>
                                            <td>{app.appointmentDate}</td>
                                            <td>{time}</td>
                                            <td>{barber ? barber.name : "Unknown"}</td>
                                            <td>
                                                <Badge bg={app.status === "pending" ? "warning" : app.status === "completed" ? "success" : "danger"}>
                                                    {app.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    {app.status === "pending" && (
                                                        <>
                                                            <Button variant="success" size="sm" onClick={() => handleCompleteAppointment(app.id)} title="Mark as completed">
                                                                <FaCheckCircle />
                                                            </Button>
                                                            <Button variant="danger" size="sm" onClick={() => handleCancelAppointment(app.id)} title="Cancel appointment">
                                                                <FaTimesCircle />
                                                            </Button>
                                                            <Button variant="primary" size="sm" onClick={() => handleRescheduleAppointment(app.id)} title="Reschedule appointment">
                                                                <FaEdit />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="secondary" size="sm" onClick={() => handleDeleteAppointment(app.id)} title="Delete appointment">
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const QueueTab = () => {
        // Sort queue entries by their computed position (assumed to be provided by the backend)
        const sortedQueueEntries = queueEntries.sort((a, b) => a.position - b.position);
        return (
            <div className="animate__animated animate__fadeIn">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Queue Order</h2>
                    <Button variant="outline-info" onClick={fetchQueueEntries} disabled={loading}>
                        Refresh <FaList className="ms-2" />
                    </Button>
                </div>
                {error && <Alert variant="danger">{error}</Alert>}
                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="light" />
                    </div>
                ) : sortedQueueEntries.length === 0 ? (
                    <Alert variant="info">No queue entries found.</Alert>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-dark table-striped table-hover">
                            <thead>
                                <tr>
                                    <th>Position</th>
                                    <th>Customer Name</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedQueueEntries.map((entry) => (
                                    <tr key={entry.id} className={entry.status === "canceled" ? "table-danger" : ""}>
                                        <td>
                                            <Badge bg={entry.position === 1 ? "success" : "primary"} className="fs-6">
                                                {entry.position}
                                            </Badge>
                                        </td>
                                        <td>{entry.name}</td>
                                        <td>
                                            <Badge bg={entry.status === "pending" ? "warning" : entry.status === "completed" ? "success" : "danger"}>
                                                {entry.status}
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {entry.status === "pending" && (
                                                    <>
                                                        <Button variant="success" size="sm" onClick={() => handleCompleteQueue(entry.id)} title="Mark as complete">
                                                            <FaCheckCircle />
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleCancelQueue(entry.id)} title="Cancel entry">
                                                            <FaTimesCircle />
                                                        </Button>
                                                    </>
                                                )}
                                                <Button variant="secondary" size="sm" onClick={() => handleDeleteQueue(entry.id)} title="Remove from queue">
                                                    <FaTrash />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case "barbers":
                return <BarbersTab />;
            case "appointments":
                return <AppointmentsTab />;
            case "queue":
                return <QueueTab />;
            default:
                return <BarbersTab />;
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 p-4 bg-secondary text-white" style={{ minHeight: "100vh", overflowY: "auto" }}>
                {renderContent()}
            </div>
        </div>
    );
}
