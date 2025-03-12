import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import clients1 from "../assets/img/clients/2.png";
import clients2 from "../assets/img/clients/3.png";
import clients3 from "../assets/img/clients/4.png";
import clients4 from "../assets/img/clients/5.png";
import clients5 from "../assets/img/clients/6.png";

export default function Clients() {
    return (
        <section className="clients">
            <div className="container">
                <div className="row">
                    <div className="col-md-7">
                        <Swiper
                            modules={[Autoplay, Navigation, Pagination]}
                            spaceBetween={20}
                            slidesPerView={3}
                            autoplay={{ delay: 2000 }}
                            loop
                            breakpoints={{
                                0: { slidesPerView: 1 },
                                600: { slidesPerView: 3 },
                                1000: { slidesPerView: 5 }
                            }}
                        >
                            <SwiperSlide><img src={clients1} alt="Client 1" /></SwiperSlide>
                            <SwiperSlide><img src={clients2} alt="Client 2" /></SwiperSlide>
                            <SwiperSlide><img src={clients3} alt="Client 3" /></SwiperSlide>
                            <SwiperSlide><img src={clients4} alt="Client 4" /></SwiperSlide>
                            <SwiperSlide><img src={clients5} alt="Client 5" /></SwiperSlide>
                            <SwiperSlide><img src={clients4} alt="Client 4" /></SwiperSlide>

                        </Swiper>
                    </div>
                </div>
            </div>
        </section>
    );
}
