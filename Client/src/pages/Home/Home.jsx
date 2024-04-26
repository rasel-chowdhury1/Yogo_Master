import React from 'react';
import HeroContainer from './Hero/HeroContainer';
import Gallary from './Gallary/Gallary';
import PopularClasses from './PopularClasses/PopularClasses';
import PopularTeacher from './PopularTeacher/PopularTeacher';
import useAuth from '../../hooks/useAuth';

const Home = () => {
    const {user} = useAuth()
    console.log("user from home",user)
    return (
        <section>
            <HeroContainer/>
            <div className='max-w-screen-xl mx-auto'>
                <Gallary/>
                <PopularClasses/>
                <PopularTeacher/>
            </div>
        </section>
    );
};

export default Home;