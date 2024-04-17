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
                <h1 className='text-5xl font-bold text-center'>Our <span className='text-secondary'>Best</span> Instructors</h1>
                <div className='w-[40%] text-center mx-auto my-4'>
                    <p className='text-gray-500'>Explore Our Popular Classes. Here is some popular classes based on How many student enrolled</p>
                </div>
            </div>

            {
                instructors ? <>
                <div>
                    {instructors?.map((instructor, i) => (
                        <div>
                            <div>
                                <img className="rounded-full border-4 border-gray-300" src={instructor?.instructor?.photoUrl || `${img}`} alt="" />
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