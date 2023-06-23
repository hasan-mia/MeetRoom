import React from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./ParticipantSlide.css";

// import required modules
import { Grid, Keyboard, Mousewheel, Navigation, Pagination } from "swiper";

const ParticipantSlide = ({ peers, Video }) => {
	return (
		<>
			<Swiper
				cssMode={true}
				mousewheel={true}
				keyboard={true}
				slidesPerView={5}
				grid={{ rows: 1 }}
				spaceBetween={0}
				pagination={true}
				modules={[Navigation, Grid, Pagination, Mousewheel, Keyboard]}
				className="mySwiper relative"
			>
				{peers.map((peer) => {
					return (
						<SwiperSlide key={peer.peerID}>
							<Video class="groupVideo" peer={peer.peer} />
							<i className="fal fa-microphone font-bold text-md text-gray-200 bg-green-400 p-1 absolute bottom-4 right-4 rounded-md"></i>
						</SwiperSlide>
					);
				})}
			</Swiper>
		</>
	);
};

export default ParticipantSlide;
