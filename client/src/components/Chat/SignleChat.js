
import React from 'react';

const SignleChat = ({text, handleChange, messages, renderMessage, sendMessage}) => {
    return (
        <div className='w-full border-x border-b border-green-700'>
            <div className='rounded-lg mb-2 tab-bar overflow-y-auto chat-h px-2'>
                
                { messages?.map(renderMessage)}
    
            </div>


            <form className='flex items-center gap-2 bg-green-600 rounded p-2 mt-6' onSubmit={sendMessage}>
                <button><i className="far fa-image text-3xl text-gray-200"></i></button>
                <input type="text" value={text} onChange={handleChange} placeholder="Type here" className="p-2 rounded-md border border-slate-600-none w-full px-2" />
                <button type='submit'> <i className="far fa-paper-plane text-2xl font-medium text-gray-200"></i> </button>
            </form>            
        </div>

    )
};

export default SignleChat;