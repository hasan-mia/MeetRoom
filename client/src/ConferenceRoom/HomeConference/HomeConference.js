/* eslint-disable jsx-a11y/no-distracting-elements */
import React from "react";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import RoomHome from "../../components/RoomHome/RoomHome";
const HomeConference = () => {
	return (
		<>
			<div className="md:w-12/12 lg:w-12/12">
				<div className="w-full text-center mt-5 bg-green-200 py-2 rounded-full text-red-800 font-semibold text-xl">
					<marquee behavior="scroll" direction="left">
						Live BroadCast & Group Meeting Comming Soon....
					</marquee>
				</div>
			</div>
			<div className="flex justify-center lg:items-center mt-auto mb-auto gap-1 flex-col lg:flex-row">
				<div className="md:w-12/12 lg:w-12/12">
					<RoomHome></RoomHome>
				</div>
			</div>
		</>
	);
};

export default HomeConference;
