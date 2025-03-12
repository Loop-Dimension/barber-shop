import React from "react";
import about3 from "../assets/img/about3.jpg";
import signature from "../assets/img/signature.svg";

export default function AboutTwoSection() {
    return (
        <section className="about section-padding bg-darkbrown">
            <div className="container">
                <div className="row">
                    <div className="col-md-5 mb-30 animate-box" data-animate-effect="fadeInLeft">
                        <img src={about3} alt="Style By Serkan Salon" />
                    </div>
                    <div className="col-md-7 valign mb-30 animate-box" data-animate-effect="fadeInRight">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="section-head mb-20">
                                    <div className="section-subtitle">Over 25 Years of Experience</div>
                                    <div className="section-title white">Transforming Styles Since 1996</div>
                                </div>
                                <p>At Style By Serkan, we are passionate about delivering innovative, high-end hairstyling
                                    for men and women. Located in the heart of Downtown Toronto, our salon offers expert
                                    cuts, coloring, and grooming services in a welcoming and creative environment.</p>
                                <p>We take pride in our craftsmanship, using premium hair care products and techniques to ensure
                                    every client leaves looking and feeling their best.</p>
                                <div className="about-bottom">
                                    <img src={signature} className="image about-signature" alt="Signature" />
                                    <div className="about-name-wrapper">
                                        <div className="about-rol">Founder & Lead Stylist</div>
                                        <div className="about-name">Serkan</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
