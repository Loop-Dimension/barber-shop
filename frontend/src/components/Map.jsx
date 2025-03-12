import React from "react";

export default function Map() {
    return (
        <div className="container-fluid p-0 ">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.732560607668!2d-79.38468062326702!3d43.65373225239562!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34cc8e24e5ab%3A0x746bd991335fc068!2s483%20Bay%20St.%2C%20Toronto%2C%20ON%20M5G%201P5%2C%20Canada!5e0!3m2!1sen!2seg!4v1741574289177!5m2!1sen!2seg"
                width="100%"
                height="600px"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
}
