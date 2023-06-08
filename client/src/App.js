import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Hasan from './Indivisual/Hasan';
import Roctim from './Indivisual/Roctim';
import Alamin from './Indivisual/Alamin';
import Hossain from './Indivisual/Hossain';
import Ariful from './Indivisual/Ariful';
import Nibras from './Indivisual/Nibras';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Home from './pages/Home/Home';
import SignIn from './pages/Register/SignIn';
import SupportPage from './pages/SupportPage/SupportPage';
import SignUp from './pages/Register/SignUp';
import LiveChat from './components/LiveChat/LiveChat';
import RequireAuth from './pages/Register/RequireAuth';
import auth from './firebase.init';
import { useAuthState } from 'react-firebase-hooks/auth';
import UserConference from './ConferenceRoom/UserConference/UserConference';
import ConferenceRoom from './ConferenceRoom/ConferenceRoom';
import HomeConference from './ConferenceRoom/HomeConference/HomeConference';
import ScheduleConference from './ConferenceRoom/ScheduleConference/ScheduleConference';
import NotificationConference from './ConferenceRoom/NotificationConference/NotificationConference';
import SettingConference from './ConferenceRoom/SettingConference/SettingConference';
import MeetingSchedule from './components/MeetingSchedule/MeetingSchedule';
import Error from './components/Error/Error';
import Dashboard from './Dashboard/Dashboard';
import AllUser from './Dashboard/AllUser';
import { ToastContainer } from 'react-toastify';
import AddMember from './Dashboard/AddMember';
import ManageMember from './Dashboard/ManageMember';
import SingleRoom from './ConferenceRoom/VideoConference/SingleRoom';
import GroupRoom from './ConferenceRoom/VideoConference/GroupRoom';
import LiveBroadCast from './ConferenceRoom/VideoConference/LiveBroadCast';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [user] = useAuthState(auth);

  return (
    <>
      {!user ? <Navbar /> : ''}

      <Routes>
        {/* ================Indivisual Route =================*/}
        <Route path="/hasan" element={<Hasan />}> </Route>
        <Route path="/roctim" element={<Roctim />}> </Route>
        <Route path="/alamin" element={<Alamin />}> </Route>
        <Route path="/hossain" element={<Hossain />}> </Route>
        <Route path="/ariful" element={<Ariful />}> </Route>
        <Route path="/nibras" element={<Nibras />}> </Route>

        {/* ================Website Route =================*/}
        <Route path="/" element={<Home />}> </Route>
        <Route path="/signIn" element={<SignIn />}> </Route>
        <Route path="/signup" element={<SignUp />}> </Route>
        <Route path="/support" element={<SupportPage />}> </Route>
        <Route path="/about" element={<About />}> </Route>
        <Route path="/contact" element={<Contact />}> </Route>
        <Route path="/liveChat" element={<LiveChat />}> </Route>
        <Route path="/schedule" element={<MeetingSchedule />}> </Route>
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>}>
          <Route path='dashboard/users' element={<><AllUser></AllUser></>}> </Route>
          <Route path='dashboard/addMembers' element={<><AddMember></AddMember></>}> </Route>
          <Route path='dashboard/manageMembers' element={<><ManageMember></ManageMember></>}> </Route>
          <Route index element={<AllUser></AllUser>}></Route>
        </Route>

        {/* ================VideoConference Room Route =================*/}
        <Route path="/conference" element={<RequireAuth><ConferenceRoom /></RequireAuth>}>
          <Route index element={<HomeConference />}></Route>
          <Route path="users" element={<UserConference />}></Route>
          
          <Route path="video" element={<SingleRoom />}></Route>
          
          {/* single room */}
          <Route path="room/:roomID" element={<SingleRoom/>} />
          {/* group room */}
          <Route path="roomGroup/:roomGroupID" element={<GroupRoom/>} />
          {/* live broadcast */}
          <Route path="liveCast" element={<LiveBroadCast/>} />

          {/* just chat live */}
          <Route path="ChatLive" element={<LiveChat/>} />

          <Route path="schedule" element={<ScheduleConference />}></Route>
          <Route path="notifications" element={<NotificationConference />}></Route>
          <Route path="settings" element={<SettingConference />}></Route>

        </Route>

        <Route path='*' element={<Error />}></Route>
      </Routes>
      <ToastContainer />
      {!user ? <Footer /> : ''}
    </>
  );
}

export default App;
