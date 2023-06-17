import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer>
			<div className="footer flex flex-wrap justify-between py-10 bg-neutral text-neutral-content px-2 lg:px-12">
				<div>
					<span className="footer-title">About</span>
					<Link to="/about">About us</Link>
					<Link to="/contact">Contact us</Link>
					<a href="#ok" className="link link-hover">
						Jobs
					</a>
					<a href="#ok" className="link link-hover">
						Press kit
					</a>
				</div>
				<div>
					<span className="footer-title">Download</span>
					<a href="#ok" className="link link-hover">
						Branding
					</a>
					<a href="#ok" className="link link-hover">
						Design
					</a>
					<a href="#ok" className="link link-hover">
						Marketing
					</a>
					<a href="#ok" className="link link-hover">
						Advertisement
					</a>
				</div>
				<div>
					<span className="footer-title">Feature</span>
					<Link to="/single" className="link link-hover">
						Single
					</Link>
					<Link to="/receive" className="link link-hover">
						Receive
					</Link>
					<Link to="/chat" className="link link-hover">
						Chat
					</Link>
					<Link to="/participant" className="link link-hover">
						Video
					</Link>
				</div>
				<div>
					<span className="footer-title">Legal</span>
					<a href="#ok" className="link link-hover">
						Terms of use
					</a>
					<a href="#ok" className="link link-hover">
						Privacy policy
					</a>
					<a href="#ok" className="link link-hover">
						Cookie policy
					</a>
				</div>
			</div>
			<div className="flex justify-between bg-neutral text-neutral-content px-2 lg:px-12 pb-2">
				<p className="text-sm">All right reserved by MeetRoom &copy; 2022</p>
				<div className="grid grid-flow-col gap-2">
					<i className="fab fa-facebook text-md"></i>
					<i className="fab fa-twitter text-md"></i>
					<i className="fab fa-instagram text-md"></i>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
