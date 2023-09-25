import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v1 as uuid } from "uuid";
import useRoom from '../../hooks/useRoom';

const CreateGroupRoom = () => {
    const { setId, setIsHost } = useRoom();
    // creating a room id
    // redirecting the user to the correct page
    const groupRoom = useNavigate();
    const create = ()=> {
        const id = uuid();
        groupRoom(`/conference/roomGroup/${id}`);
        setId(id)
        setIsHost(true);
    }

    // // creating a room id for scheduling a call
    // const scheduleID = ()=> {
    //     const id = uuid();
    //     var url = window.location.href;
    //     var n = url.lastIndexOf('CreateRoomGroup');
    //     return url.substring(0, n - 1) + `/room/${id}`;
    // }
    
    // // sending an email to the user
    // const sendEmail= (e)=> {
    //     e.preventDefault();

    //     emailjs.sendForm('gmail', 'template_kr4bcy2', e.target, 'user_nAYJJym0KTqRP8NWdzKqS')
    //         .then((result) => {
    //             window.location.reload()
    //         }, (error) => {
    //             console.log(error.text);
    //         });
    // }
      
    // modal for scheduling details
    // const MyVerticallyCenteredModal = (props)=> {
    //     var id = scheduleID();
    //     return (
            
    //         <Modal
    //             {...props}
    //             size="lg"
    //             aria-labelledby="contained-modal-title-vcenter"
    //             centered
    //         >
            
    //         <Modal.Header closeButton>
    //             <Modal.Title id="contained-modal-title-vcenter" class="InvHeading">
    //             Send an Email Invitation
    //             </Modal.Title>
    //         </Modal.Header>
            
    //         <Modal.Body>
    //             <form className="contact-form" onSubmit={sendEmail}>
    //                 <div class="row">
    //                     <div class="col-6">
    //                         <label>Name of Organiser</label>
    //                         <input type="text" name="from_name" />

    //                         <label>Name of Attendee 1</label>
    //                         <input type="text" name="to_name_1" />

    //                         <label>Name of Attendee 2</label>
    //                         <input type="text" name="to_name_2" />

    //                         <label>Name of Attendee 3</label>
    //                         <input type="text" name="to_name_3" />
                            
    //                     </div>

    //                     <div class="col-6">

    //                         <label>Email Address of Organiser</label>
    //                         <input type="email" name="from_email" />

    //                         <label>Email Address of Attendee 1</label>
    //                         <input type="email" name="to_email_1" />

    //                         <label>Email Address of Attendee 2</label>
    //                         <input type="email" name="to_email_2" />

    //                         <label>Email Address of Attendee 3</label>
    //                         <input type="email" name="to_email_3" />
    //                     </div>
    //                 </div>

    //                 <div class="row">
    //                     <div class="col-6">
    //                         <label>Date of the Meeting</label> <br></br>
    //                         <input type="date" name="date" />
    //                     </div>
    //                     <div class="col-6">
    //                         <label>Time of the Meeting</label> <br></br>
    //                         <input type="time" name="time" />
    //                     </div>
    //                 </div>
    //                 <div class="row my-4">
    //                     <div class="col-12">
    //                         <label>Link to the Meeting</label> <br></br>
    //                         <input type="text" name = "id" value={id}></input>
    //                     </div>
    //                 </div>
    //                 <div class="row">
    //                     <div class="col-6">
    //                         <input class="scheduleBtn" type="submit" value="Send" />
    //                         <button  type="button" class="scheduleBtn" onClick={props.onHide}> Close </button>
    //                     </div>
    //                 </div>

    //             </form>
    //         </Modal.Body>
    //         </Modal>
    //     );
    // }
    // const [modalShow, setModalShow] = React.useState(false);

    return (
        <div className=" items-center justify-center">
				<button type="button" className="card-body" onClick={() => create()}>
					<div className="flex justify-start gap-1">
						<i className="fas fa-video-plus font-bold text-3xl"></i>
					</div>
					<h2 className="text-xl font-semibold">Group Call</h2>
					<p className="text-sm">Start group call</p>
				</button>
			</div>
    );
};

export default CreateGroupRoom;