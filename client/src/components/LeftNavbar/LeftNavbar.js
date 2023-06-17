import { signOut } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../../firebase.init';
import useRoom from '../../hooks/useRoom';

const LeftNavbar = () => {
    const {id} = useRoom()
    const navigate = useNavigate()
    const logout = () => {
        signOut(auth);
      };
      useEffect(()=>{
        if (id) {
            navigate(`/conference/room/${id}`, {replace: true})
        }
      },[id, navigate])
    return (
        <div className="drawer-side">
            <label for="my-drawer-2" className="drawer-overlay"></label> 
                <ul className="menu p-4 overflow-y-auto w-24 bg-black text-gray-200">
                    <div className="side-logo text-center bg-green-500 py-4 mb-0 lg:mb-12 rounded-full">
                       <Link to='/' onClick={logout}><i className="fas fa-video text-3x bg-white pr-2 pl-2 py-2 text-green-500 rounded-full"></i></Link>
                    </div>
                    <li><Link to="/conference"><i className="fal fa-home text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform active:text-green-500"></i></Link></li>
                    <li><Link to={`/conference/live`}><i className="fal fa-video text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform"></i></Link></li>
                    {/* <li><Link to="/conference/users"><i className="fal fa-users text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform focus:text-green-500"></i></Link></li> */}
                    <li><Link to="/conference/schedule"><i className="fas fa-calendar-alt text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform"></i></Link></li>
                    <li><Link to="/conference/notifications"><i className="fal fa-bell text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform"></i></Link></li>
                    {/* <li><Link to="/conference/settings"><i className="fal fa-cog text-gray-200 text-lg lg:text-3xl hover:text-green-400 hover:translate-x-0.5 transition-transform"></i></Link></li> */}
                    <div className="absolute left-1/3 bottom-2 cursor-pointer">
                    <Link to='/' onClick={logout}><i className="fal fa-sign-out-alt text-lg lg:text-3xl text-red-500 hover:text-green-400 hover:translate-x-0.5 transition-transform"></i></Link>
                
                    </div>
                </ul>
        </div>
    );
};

export default LeftNavbar;