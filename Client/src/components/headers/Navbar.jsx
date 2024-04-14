import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, THEME_ID, createTheme } from '@mui/material/styles';

const navLinks = [
    {name: 'Home', route: "/"},
    {name: 'Instructors', route: "/instructors"},
    {name: 'Classes', route: "/classes"},
]

const theme = createTheme({
    palette: {
        primary: {
            main: "#ff0000",
        },
        secondary: {
            main: "#00ff00"
        }
    }
});

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isHome, setIsHome] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isFixed, setIsFixed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false)

    const [navBg, setNavBg] = useState('bg-[#15151580');
    
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    useEffect(() => {
        const darkClass = 'dark';
        const root = window.document.documentElement;
        if(isDarkMode){
            root.classList.add(darkClass)
        } else{
            root.classList.remove(darkClass)
        }
    },[isDarkMode]);

    useEffect( () => {
        setIsHome(location.pathname === "/");
        setIsLogin(location.pathname === "/login");
        setIsFixed(location.pathname === "/register" || location.pathname === "/login")
    },[location])

    return (
        <nav>
            <div className='lg:w-[95%] mx-auto sm:px-6 lg:px-6'>
                <div className='px-4 py-4 flex items-center justify-between'>
                    {/** logo */}
                    <div>
                        <h1 className='text-2xl inline-flex gap-3 items-center font-bold'>YogaMaster <img src="/yoga-logo.png" alt="yogo-logo" className='w-8 h-8' /></h1>
                        <p className='font-bold text-[13px] tracking-[8px]'>Quick Explore</p>
                    </div>

                    {/** mobile menu icon */}

                    {/** Navigational Links */}
                    <div className='hidden md:block text-black dark:text-white'>
                        <div className='flex'>
                            <ul className='ml-10 flex items-center space-x-4 pr-4'>
                                {
                                    navLinks.map((link) => (
                                        <li key={link.route}><NavLink to={link.route}
                                        className={({ isActive }) =>
                                          `font-bold ${isActive ? 'text-secondary' : `${navBg.includes('bg-transparent') ? 'text-white' : 'text-black dark:text-white'}`} hover:text-secondary duration-30 `
                                        }>{link.name}</NavLink></li>
                                    ))
                                }

                                {/** based on users */}
                                <li><NavLink to="/login" className={({ isActive }) =>
                                          `font-bold ${isActive ? 'text-secondary' : `${navBg.includes('bg-transparent') ? 'text-white' : 'text-black dark:text-white'}`} hover:text-secondary duration-30 `
                                        }>Login</NavLink></li>

                                {/** color toggle */}
                                <li>light / Dark</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;