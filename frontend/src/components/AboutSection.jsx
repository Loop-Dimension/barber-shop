import React from "react";

export default function AboutSection() {
    return (
        <section className="about section-padding" data-scroll-index={1} id="about">
            <div className="container">
                <div className="row">
                    <div className="col-md-12 mb-30">
                        <div className="section-head mb-20">
                            <div className="section-subtitle">Since 1996</div>
                            <div className="section-title">Style By Serkan</div>
                        </div>
                        <p>Welcome to Style By Serkan, your go-to destination for contemporary and cutting-edge hair styling.
                            Located in the heart of Downtown Toronto, we specialize in men's and women's haircuts, coloring,
                            straightening, and much more.</p>
                        <p>With a passion for excellence, our highly trained team provides innovative, high-end styling services
                            in a creative and welcoming environment. Whether you're looking for a fresh new look or expert grooming,
                            we've got you covered.</p>
                        <ul className="about-list list-unstyled mb-30">
                            <li>
                                <div className="about-list-icon"> <span className="ti-check" /> </div>
                                <div className="about-list-text">
                                    <p>Experienced & certified hairstylists</p>
                                </div>
                            </li>
                            <li>
                                <div className="about-list-icon"> <span className="ti-check" /> </div>
                                <div className="about-list-text">
                                    <p>Premium hair products from top international brands</p>
                                </div>
                            </li>
                            <li>
                                <div className="about-list-icon"> <span className="ti-check" /> </div>
                                <div className="about-list-text">
                                    <p>Customer-focused approach with personalized consultations</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
}
