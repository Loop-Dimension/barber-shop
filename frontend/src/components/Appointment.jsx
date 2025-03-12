import React, { useState, useEffect } from "react";
import API_BASE_URL from "../api/api";
import Swal from "sweetalert2";

export default function Appointment() {
    const [barbers, setBarbers] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState("");
    const [date, setDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [service, setService] = useState("");

    useEffect(() => {
        fetchBarbers();
    }, []);

    const fetchBarbers = () => {
        fetch(`${API_BASE_URL}/api/barbers`)
            .then((res) => res.json())
            .then((data) => setBarbers(data))
            .catch((err) => console.error("Error fetching barbers:", err));
    };

    useEffect(() => {
        fetchAvailableSlots();
    }, [selectedBarber, date]);

    const fetchAvailableSlots = () => {
        if (selectedBarber && date) {
            fetch(`${API_BASE_URL}/api/schedule/${selectedBarber}/${date}`)
                .then((res) => res.json())
                .then((data) => setAvailableSlots(data.availableSlots))
                .catch((err) => console.error("Error fetching slots:", err));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const appointmentTime = `${date}T${selectedSlot}:00`;
        const appointmentData = {
            customerName,
            customerEmail: phone,
            appointmentTime,
            barberId: selectedBarber,
            service,
        };
        fetch(`${API_BASE_URL}/api/appointments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.id) {
                    Swal.fire({
                        icon: "success",
                        title: "Appointment Confirmed!",
                        html: `<p><strong>Appointment ID:</strong> ${data.id}</p>
                   <p><strong>Date:</strong> ${date}</p>
                   <p><strong>Time:</strong> ${selectedSlot}</p>
                   <p><strong>Queue Position:</strong> ${data.position}</p>
                   <button id="copyBtn" class="swal2-confirm swal2-styled">Copy Appointment ID</button>`,
                        didOpen: () => {
                            document.getElementById("copyBtn").addEventListener("click", () => {
                                navigator.clipboard.writeText(`${data.id}`);
                                Swal.fire("Copied!", "", "success");
                            });
                        },
                    });
                    fetchAvailableSlots();
                    setSelectedSlot("");
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to create appointment. Please try again!",
                    });
                }
            })
            .catch((err) => {
                console.error("Error creating appointment:", err);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Something went wrong. Try again!",
                });
            });
    };

    return (
        <section className="testimonials" id="Appointment">
            <div
                className=" valign bg-img bg-fixed"

                data-overlay-dark={0}
            >
                <div className="container">
                    <div className="row">

                        <div className="col-md-12 ">
                            <div className="booking-box">
                                <div className="head-box text-center">
                                    <h4>Make An Appointment</h4>
                                </div>
                                <div className="booking-inner clearfix">
                                    <form className="form1 clearfix" onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Name</label>
                                                    <div className="input2_inner">
                                                        <input
                                                            type="text"
                                                            className="form-control input"
                                                            placeholder="Name"
                                                            value={customerName}
                                                            onChange={(e) => setCustomerName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Phone</label>
                                                    <div className="input2_inner">
                                                        <input
                                                            type="text"
                                                            className="form-control input"
                                                            placeholder="Phone"
                                                            value={phone}
                                                            onChange={(e) => setPhone(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="input1_wrapper">
                                                    <label>Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control input"
                                                        placeholder="Date"
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="select1_wrapper">
                                                    <label>Choose Barber</label>
                                                    <select
                                                        className="select2 select"
                                                        style={{ width: "100%" }}
                                                        value={selectedBarber}
                                                        onChange={(e) => setSelectedBarber(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Barber</option>
                                                        {barbers.map((barber) => (
                                                            <option key={barber.id} value={barber.id}>
                                                                {barber.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {availableSlots.length > 0 && (
                                                <div className="col-md-6">
                                                    <div className="select1_wrapper">
                                                        <label>Time</label>
                                                        <select
                                                            className="select2 select"
                                                            style={{ width: "100%" }}
                                                            value={selectedSlot}
                                                            onChange={(e) => setSelectedSlot(e.target.value)}
                                                            required
                                                        >
                                                            <option value="">Select Time Slot</option>
                                                            {availableSlots.map((slot, index) => (
                                                                <option key={index} value={slot}>
                                                                    {slot}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="col-md-6">
                                                <div className="select1_wrapper">
                                                    <label>Services</label>
                                                    <select
                                                        className="select2 select"
                                                        style={{ width: "100%" }}
                                                        value={service}
                                                        onChange={(e) => setService(e.target.value)}
                                                        required
                                                    >
                                                        <option value="">Select Service</option>
                                                        <option value="Hair Styling">Hair Styling</option>
                                                        <option value="Face Mask">Face Mask</option>
                                                        <option value="Shaving">Shaving</option>
                                                        <option value="Beard Trimming">Beard Trimming</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <button type="submit" className="btn-form1-submit mt-15">
                                                    Make Appointment
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
