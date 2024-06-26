import React, { useContext, useEffect, useState } from 'react';
import useAxiosFetch from '../../hooks/useAxiosFetch';
import { Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { toast } from 'react-toastify';

const Classes = () => {
    const axiosFetch = useAxiosFetch();
    const axiosSecure = useAxiosSecure();
    const { currentUser } = useUser();
    console.log('current user -> ',currentUser)
    const role = currentUser?.role;
    const [enrolledClasses, setEnrolledClasses] = useState([])
    const [classes, setClasses] = useState([]);
    const [hoverredCard, setHoveredCard] = useState(null)
    
    
    const handleHover = (index) => {
        setHoveredCard(index)
    }
    useEffect(() => {
       axiosFetch.get('/classes')
       .then((data) => setClasses(data.data))
       .catch(err => console.log(err))
    },[])

    // handle add to cart
    const handleSelect = (id) => {
      console.log('class id -> ', id)
      axiosSecure.get(`/enrolled-classes/${currentUser?.email}`)
      .then(res => setEnrolledClasses(res.data))
      .catch(err => console.log(err))

      if(!currentUser){
        return toast.error('Please, login first')
      }

      axiosSecure.get(`/cart-item/${id}?email=${currentUser.email}`)
      .then(res => {
        if(res.data.classId === id){
            return toast.error("Already Selected")
        } else if(enrolledClasses.find(item => item.classes._id === id)){
            return toast.error("Already Enrolled")
        } else{
            const data = {
                classId: id,
                userEmail: currentUser.email,
                date: new Date()
            }

            toast.promise(axiosSecure.post('add-to-cart', data))
            .then(res => {
                console.log(res.data)
            }), {
                pending: "Selecting...", 
                success: {
                    render(){
                        return "Selected Successfully!"
                    }
                },
                error: {
                    render(){
                        return `Error: ${data.message}`
                    }
                }
            }
        }
      })
    }


    return (

        <div>
            <div className='mt-20 pt-3'>
                <h1 className='text-4xl font-bold text-center text-secondary'>Classes</h1>
            </div>

            <div className='my-16 w-[90%] mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {
                    classes.map( (cls,index) => (
                        <div
                           key={index}
                           className={`relative hover:-translate-y-2 duration-150 hover:ring-[2px] hover:ring-secondary w-64  mx-auto ${cls.availableSeats < 1 ? 'bg-red-400' : 'bg-white'} dark:bg-slate-600 rounded-lg shadow-lg overflow-hidden cursor-pointer`}
                           onMouseEnter={() => handleHover(index)}
                           onMouseLeave={() => handleHover(null)}
                        >
                            <div className='relative h-48'>
                                <div className={`absolute inset-0 bg-black opacity-0 transition-opacity duration-300 ${hoverredCard === index ? "opacity-60 " : ""}`}></div>
                                <img src={cls.image} alt="classsImage" className='object-cover w-full h-full' />

                                <Transition
                                    show={hoverredCard === index}
                                    enter="transition-opacity duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="transition-opacity duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className='absolute inset-0 flex items-center justify-center'>
                                        <button 
                                         onClick={() => handleSelect(cls._id)} 
                                         title={role=='admin' || role=="instructor" ? "Instructor/Admin Can not be able to select" ? cls.availableSeats < 1 : "No Seat Available ": "You can select Classes"} 
                                         disabled={role=='admin' || role=="instructor" || cls.availableSeats < 1}
                                         className='px-4 py-2 text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700'>Add to Cart</button>
                                    </div>
                                </Transition>
                            </div>

                            {/** Details */}
                            <div className='px-6 py-2 '>
                                <h3 className={`${cls.name.length > 25 ? 'text-[14px]' : 'text-[16px]'} font-semibold mb-1`}>{cls.name}</h3>

                                <p className='text-gray-500 text-xs'>Instructors: {cls.instructorName}</p>
                                <div className='flex items-center justify-between mt-4'>
                                    <span className='text-gray-600 text-xs'>Available Seats: {cls.availableSeats}</span>
                                    <span className='text-green-500 font-semibold'>${cls.price}</span>
                                </div>

                                <Link to={`/class/${cls._id}`}><button className="px-4 py-2 mt-4 w-full mx-auto text-white disabled:bg-red-300 bg-secondary duration-300 rounded hover:bg-red-700">View</button></Link>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default Classes;