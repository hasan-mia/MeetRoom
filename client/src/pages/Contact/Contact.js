import React from 'react';

const Contact = () => {
    return (
        <main className='px-2'>
                <div className='lg:px-6 py-2'>
                    <div className="flex justify-center flex-col lg:flex-row-reverse ">
                        <div className="w-12/12 lg:w-4/12">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input type="text" placeholder="name" className="input input-bordered" />
            
                                    <label className="label">
                                        <span className="label-text">Message</span>
                                    </label>
                                    <textarea className="textarea textarea-bordered h-24" placeholder="Send Message"></textarea>
                                </div>
                                <div className="form-control mt-6">
                                    <button  type="button" className="btn btn-primary">Send</button>
                                </div>
                        </div>                    
                    <div className="w-12/12 lg:w-8/12 ">
                        <div className="text-center px-4">
                            <h2 className="text-3xl leading-normal font-bold text-gray-600 dark:text-gray-200">
                                <span className="font-light">Please</span> <span className='border-b'>Contact us!</span>
                            </h2>
                        </div>
                        <p className="py-2 lg:py-6 pr-0 lg:pr-8 text-justify">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                <div className="">
                                    <h3 className='text-lg font-semibold'>Colaborate</h3>
                                    <p>Support@example.com</p>
                                    <p>+880-1617892323</p>
                                </div>
                                <div className="">
                                    <h3 className='text-lg font-semibold'>Support</h3>
                                    <p>Support@example.com</p>
                                    <p>+880-1617892323</p>
                                </div>
                                
                                <div className="">
                                    <h3 className='text-lg font-semibold'>Join our team</h3>
                                    <p>Support@example.com</p>
                                    <p>+880-1617892323</p>
                                </div>
                                <div className="">
                                    <h3 className='text-lg font-semibold'>Say hello</h3>
                                    <p>Support@example.com</p>
                                    <p>+880-1617892323</p>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
                {/* end contact div */}
                <div className='lg:px-6 py-2'>
                    <div className="hero" style={{backgroundImage: 'url(https://placeimg.com/1000/800/arch)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
                        <div className="hero-overlay py-8 bg-opacity-60"></div>
                        <div className="hero-content text-center text-neutral-content">
                            <div className="max-w-md">
                                <h1 className="mb-5 text-xl lg:text-5xl font-bold">Looking for new career?</h1>
                                <p className="mb-5">Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem quasi. In deleniti eaque aut repudiandae et a id nisi.</p>
                                <button  type="button" className="btn btn-primary">We are Hiring</button>
                            </div>
                        </div>
                    </div>
                </div>
           
        </main>
    );
};

export default Contact;