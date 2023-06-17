import { signOut } from 'firebase/auth';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import auth from '../../firebase.init';
import useAdmin from '../../hooks/useAdmin';

const Navbar = () => {
    const [user] = useAuthState(auth);
    const [admin] = useAdmin(user);
    const logout = () => {
        signOut(auth);

    };
    return (
        <header className="lg:px-4 bg-header uppercase">
            <div className="navbar">
                <div className="navbar-start">
                    <div className="dropdown">
                        <label tabIndex="0" className="btn btn-ghost lg:hidden">
                            <i className="fad fa-align-left text-2xl text-gray-200"></i>
                        </label>
                        <ul tabIndex="0" className="menu menu-compact dropdown-content mt-3 p-2 lg:p-2 shadow bg-base-100 rounded-box w-52">
                            <li className='hover:bg-gray-600 hover:text-gray-200 transition-all'><Link to='/'>Home</Link></li>
                            <li className='hover:bg-gray-600 hover:text-gray-200 transition-all'><Link to='/about'>About</Link></li>
                            <li className='hover:bg-gray-600 hover:text-gray-200 transition-all'><Link to='/contact'>Contact</Link></li>
                            <li className='hover:bg-gray-600 hover:text-gray-200 transition-all'><Link to='/support'>Support</Link></li>
                        </ul>
                    </div>
                    <div className="flex display-flex">
                        <Link to="/" className="flex items-center lg:pl-6 gap-1 normal-case md:text-xl font-semibold text-gray-200"><img src={logo} className='w-1/6 text-left' alt='' /> MeetRoom</Link>
                    </div>
                </div>
                <div className="navbar-start hidden lg:flex">
                    <ul className="menu menu-horizontal p-0 text-gray-200">
                        <li><Link to='/'>Home</Link></li>
                        <li><Link to='/about'>About</Link></li>
                        <li><Link to='/contact'>Contact</Link></li>
                        <li><Link to='/support'>Support</Link></li>
                    </ul>
                </div>
                <div className="navbar-end">
                    { admin && <Link to='/dashboard'>Dashboard</Link>}
                    <ul className="menu menu-horizontal p-0 text-gray-200">
                        <li>{user ? <button  type="button" onClick={logout} className="">Sign out</button> : <Link to="/signIn">Sign in</Link>}</li>
                    </ul>
                </div>
            </div>

        </header>
    );
};

export default Navbar;