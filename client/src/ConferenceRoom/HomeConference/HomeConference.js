import React from 'react';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import RoomHome from '../../components/RoomHome/RoomHome';
const HomeConference = () => {
    return (

        <div className="flex justify-center lg:items-center mt-auto mb-auto gap-1 flex-col lg:flex-row">
            <div className="md:w-12/12 lg:w-12/12">
                <RoomHome></RoomHome>
            </div>
        </div>
    );
};

export default HomeConference;