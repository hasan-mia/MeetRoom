import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuid } from "uuid";
import useRoom from '../../hooks/useRoom';
// import emailjs from 'emailjs-com';

const CreateSingleRoom = () => {
    const {setId} = useRoom()
    // creating a room id
    // redirecting the user to the correct page
    const navigate = useNavigate();
    const create =()=> {
        const id = uuid();
       navigate(`/conference/room/${id}`, {replace: true});
       setId(id)
    }

    // // creating a room id for scheduling a call
    // const scheduleID =()=> {
    //     const id = uuid();
    //     var url = window.location.href;
    //     var n = url.lastIndexOf('CreateRoom');
    //     return url.substring(0, n - 1) + `/room/${id}`;
    // }
    
    // //sending an email to the user
    // const sendEmail = (e)=> {
    //     e.preventDefault();

    //     emailjs.sendForm('gmail', 'template_kgfrx5w', e.target, 'user_nAYJJym0KTqRP8NWdzKqS')
    //         .then((result) => {
    //             window.location.reload()
    //         }, (error) => {
    //             console.log(error.text);
    //         });
    // }
   
    return (
			<div className=" items-center justify-center">
				<button type="button" className="card-body" onClick={() => create()}>
					<div className="flex justify-start gap-1">
						<i className="fal fa-video font-bold text-3xl bg-clock bg-transparent border border-gray-300 p-2"></i>
					</div>
					<h2 className="text-xl font-semibold">One to One</h2>
					<p className="text-sm">Start single call</p>
				</button>
			</div>
		);
};

export default CreateSingleRoom;
