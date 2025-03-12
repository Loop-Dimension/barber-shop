import React from "react";

export default function ServicesSection() {

    return (
        <section className="services-1 section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <div className="section-head text-center">
                            <div className="section-subtitle">Our Services</div>
                            <div className="section-title">What We Offer</div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-1" />
                            <h5>Men’s Haircut</h5>
                            <p>Precision haircuts tailored to your style by our expert stylists.</p>
                            <div className="shape"> <span className="icon icon-icon-1-1" /> </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-9" />
                            <h5>Women's Haircut</h5>
                            <p>Chic and trendy cuts to complement your unique beauty.</p>
                            <div className="shape"> <span className="icon icon-icon-1-9" /> </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-3" />
                            <h5>Hair Coloring</h5>
                            <p>Professional coloring services from highlights to full transformations.</p>
                            <div className="shape"> <span className="icon icon-icon-1-3" /> </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-2" />
                            <h5>Hair Straightening</h5>
                            <p>Get silky smooth, frizz-free hair with our expert straightening treatments.</p>
                            <div className="shape"> <span className="icon icon-icon-1-2" /> </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-6" />
                            <h5>Beard Grooming</h5>
                            <p>Keep your beard looking sharp and well-maintained with our grooming services.</p>
                            <div className="shape"> <span className="icon icon-icon-1-6" /> </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="item">
                            <span className="icon icon-icon-1-8" />
                            <h5>Waxing & Threading</h5>
                            <p>Achieve smooth, flawless skin with our professional waxing and threading services.</p>
                            <div className="shape"> <span className="icon icon-icon-1-8" /> </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}