
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import React, { useEffect, useRef } from 'react';
import { BsFillEmojiSunglassesFill } from 'react-icons/bs';

const SignleChat = ({text, handleChange, showEmojiPicker, toggleEmojiPicker, handleEmojiSelect, messages, renderMessage, sendMessage}) => {
    const chatRef = useRef(null)
    // scroll to the bottom of the chat container
    const scrollToBottom = () => {
    const chatContainer = chatRef.current;
        if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
       
    return (
        <div className='w-full border-x border-b border-green-700 relative'>
            <div className='rounded-lg mb-2 tab-bar overflow-y-auto chat-h px-2 capitalize' ref={chatRef}>
                { messages?.map(renderMessage)}
                { scrollToBottom()}
               
            </div>

            <div className='flex items-center justify-center gap-2 bg-green-600 rounded p-2 mt-6'>
                <form className='flex items-center gap-2' onSubmit={sendMessage}>
                    <button><i className="far fa-image text-3xl text-gray-200"></i></button>
                    <input type="text" value={text} onChange={handleChange} placeholder="Type here" className="p-2 rounded-md border border-slate-600-none w-full px-2" />
                    <button type='submit'> <i className="far fa-paper-plane text-2xl font-medium text-gray-200"></i> </button>
                </form>
                <button type='button' onClick={toggleEmojiPicker}><BsFillEmojiSunglassesFill className='text-yellow-400 ms-2' size={28}/></button>

                <div className='absolute bottom-0 end-0'>
                    {showEmojiPicker && (
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                )} 
                </div>
            </div>          
        </div>

    )
};

export default SignleChat;