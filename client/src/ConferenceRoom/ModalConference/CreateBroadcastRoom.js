import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CreateBroadcastRoom = () => {
    const navigate = useNavigate();

    const createbroadCastRooom = () =>{
        navigate('/conference/liveCast')
    }


    return (
        <div className=' items-center justify-center'>
            <label for="my-modal-4" className="hover:cursor-pointer"><i className="far fa-signal-stream font-bold text-3xl bg-clock bg-transparent border border-gray-300 p-2"></i></label>

            <input type="checkbox" id="my-modal-4" className="modal-toggle" />
            
            <div className="modal modal-bottom sm:modal-middle  ">
                <div className="modal-box bg-chat h-auto  mx-auto  ">
                    <h2 className="text-center text-3xl divide-y font-semibold">Crate Room Broadcast</h2>
                    <div className='flex justify-center gap-3'>
                        {/* Cancel Btn */}
                        <div className="modal-action">
                            <label for="my-modal-4" className="btn">Cancel</label>
                            <div className="flex gap-2 items-center">
                            {/* <button  type="button" className="schedule" onClick={() => setModalShow(true)}> Schedule Call </button> */}
                            <Link to="/conference/schedule" className="btn">Schedule</Link>
                            <button  type="button" className="btn" onClick={()=>createbroadCastRooom()}> BroadCost</button>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateBroadcastRoom;