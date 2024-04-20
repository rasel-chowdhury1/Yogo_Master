import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import img from '../../../assets/home/girl.jpg';


const PopularTeacher = () => {
    const axiosFetch = useAxiosFetch();
    const [instructors, setInstructors] = useState([])

    console.log('image -> ',img)

    useEffect( () => {
            axiosFetch.get('/popular-instructors')
            .then( (data) => {
                console.log('response -> ', data.data)
                setInstructors(data.data)
            })
            .catch((err) => {console.log(err)})
            
    },[])

    console.log('instructors data -> ', instructors)
    return (
        <div className='md:w-[80%] mx-auto my-36'>
            <div>
                <h1 className='text-5xl font-bold text-center dark:text-white'>Our <span className='text-secondary'>Best</span> Instructors</h1>
                <div className='w-[40%] text-center mx-auto my-4'>
                    <p className='text-gray-500'>Explore Our Popular Classes. Here is some popular classes based on How many student enrolled</p>
                </div>
            </div>

            {
                instructors ? <>
                <div className='grid md:grid-cols-3 w-[90%] gap-4 mx-auto '>
                    {instructors?.slice(0,6).map((instructor, i) => (
                        <div className='flex dark:text-white hover:-translate-y-2 duration-200 cursor-pointer flex-col shadow-md py-8 px-10 md:px-8 rounded-md'>
                            <div className='flex flex-col gap-6 md:gap-8'>
                                <img className="rounded-full border-4 border-gray-300 h-24 w-24 mx-auto" src={instructor?.instructor?.photoUrl || `${img}`} alt="" />

                                <div>
                                    <p className='font-medium texl-lg dark:text-white'>{instructor?.instructor?.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </> : <><h3>not exist</h3></>
            }

        </div>
    );
};

export default PopularTeacher;