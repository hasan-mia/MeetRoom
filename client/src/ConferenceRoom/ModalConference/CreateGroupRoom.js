import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v1 as uuid } from "uuid";
import useRoom from '../../hooks/useRoom';

const CreateGroupRoom = () => {
    const {setId} = useRoom()
    // creating a room id
    // redirecting the user to the correct page
    const groupRoom = useNavigate();
    const create = ()=> {
        const id = uuid();
        groupRoom(`/conference/roomGroup/${id}`);
        setId(id)
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
    //                         <button class="scheduleBtn" onClick={props.onHide}> Close </button>
    //                     </div>
    //                 </div>

    //             </form>
    //         </Modal.Body>
    //         </Modal>
    //     );
    // }
    // const [modalShow, setModalShow] = React.useState(false);

    return (
        <div className=' items-center justify-center'>
            <label for="my-modal-2" className="hover:cursor-pointer"><i className="fas fa-video-plus font-bold text-3xl bg-clock bg-transparent border border-gray-300 p-2"></i></label>

            <input type="checkbox" id="my-modal-2" className="modal-toggle" />
            
            <div className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-chat h-auto">
                    <h2 className="text-center text-3xl divide-y font-semibold">Group Video Meeting</h2>
                    <div className='flex justify-center gap-3'>
                        {/* Cancel Btn */}
                        <div className="modal-action">
                            <label for="my-modal-2" className="btn">Cancel</label>
                            <div className="flex gap-2 items-center">
                            {/* <button className="schedule" onClick={() => setModalShow(true)}> Schedule Call </button> */}
                            <Link to="/conference/schedule" className="btn">Schedule</Link>
                            <button className="btn" onClick={()=>create()}> Start meet </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateGroupRoom;