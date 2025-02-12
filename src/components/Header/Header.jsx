import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AiOutlineSearch } from 'react-icons/ai'
import { FaMoon, FaUserCircle, FaSignOutAlt, FaCog, FaSun } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { toggleTheme } from '../../redux/theme/themeSlice'
import { useProfile } from '../../hooks/userProfile'
import { signOutFailure, signOutStart, signOutSuccess } from '../../redux/user/userSlice'
import summaryApi from '../../common'
import { persistor, store } from '../../redux/store'
import { getAuth } from 'firebase/auth'
import { app } from '../../firebase'

function Header() {
    const path = useLocation().pathname
    const location = useLocation()
    const { currentUser } = useSelector((state) => state.user)
    const { theme } = useSelector((state) => state.theme)
    const [searchTerm, setSearchTerm] = useState('')
    const [showMobileSearch, setShowMobileSearch] = useState(false)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const userData = currentUser?.rest || {}
    const { profilePicture } = useProfile()

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const searchTermFromUrl = urlParams.get('searchTerm')
        if (searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl)
        }
    }, [location.search])

    const handleSignOut = async () => {
        try {
            dispatch(signOutStart())

            const response = await fetch(summaryApi.loggingOff.url, {
                method: summaryApi.loggingOff.method,
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`,
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            if (data.success) {
                const auth = getAuth(app)
                await auth.signOut()

                dispatch(signOutSuccess())
                localStorage.clear()
                await persistor.purge()

                store.dispatch({ type: 'RESET_STORE' })

                navigate('/sign-in')
            } else {
                throw new Error(data.message || "Failed to sign out")
            }
        } catch (error) {
            console.error('Sign out error:', error)
            dispatch(signOutFailure(error.message))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const urlParams = new URLSearchParams(location.search)
        urlParams.set('searchTerm', searchTerm)
        const searchQuery = urlParams.toString()
        navigate(`/search?${searchQuery}`)
        setShowMobileSearch(false)
    }

    const handleLiveStream = ()=>{
        if (userData?.isVip) {
            navigate('/create-stream')            
        } else{
            navigate("/live-stream")
        }
    }

    return (
        <Navbar className='border-b-2'>
            <Link
                to='/'
                className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
            >
                <video
                    src={assets.logo4}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onClick={() => navigate('/')}
                    className="w-14 rounded-lg object-cover cursor-pointer [filter:contrast(1.2)_brightness(1.1)_saturate(1.2)]"
                />
                <h3 className='text-[14px]'>
                    Spectrum Blog <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white text-[8px] px-2 py-1'>By Sonia</span>
                </h3>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSubmit} className='hidden lg:block'>
                <TextInput
                    type='text'
                    placeholder='Search...'
                    rightIcon={AiOutlineSearch}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </form>

            {/* Mobile/Tablet Search Button and Input */}
            <div className='lg:hidden flex items-center gap-2'>
                {showMobileSearch ? (
                    <form onSubmit={handleSubmit} className='flex items-center gap-2'>
                        <TextInput
                            type='text'
                            placeholder='Search...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full'
                            autoFocus
                        />
                        <Button 
                            color='gray' 
                            pill
                            onClick={() => setShowMobileSearch(false)}
                            className='flex-shrink-0'
                        >
                            Cancel
                        </Button>
                    </form>
                ) : (
                    <Button
                        className='w-12 h-10'
                        color='gray'
                        pill
                        onClick={() => setShowMobileSearch(true)}
                    >
                        <AiOutlineSearch />
                    </Button>
                )}
            </div>

            <div className='flex gap-2 md:order-2'>
                <Button
                    className='w-12 h-10 sm:inline'
                    color='gray'
                    pill
                    onClick={() => dispatch(toggleTheme())}
                >
                    {theme === 'light' ? <FaSun /> : <FaMoon />}
                </Button>
                {currentUser ? (
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt='user avatar'
                                img={userData.profilePicture}
                                rounded
                                size="md"
                                className="cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all duration-300"
                            />
                        }
                        className="shadow-lg rounded-xl border border-gray-200"
                    >
                        <Dropdown.Header>
                            <div className="flex flex-col gap-1 px-1 py-2">
                                <span className="text-sm font-semibold text-gray-900">
                                    {userData.userName}
                                </span>
                                <span className="text-xs font-normal text-gray-500 truncate">
                                    {userData.email}
                                </span>
                            </div>
                        </Dropdown.Header>
                        <Link to={'/dashboard?tab=profile'}>
                            <Dropdown.Item className="flex items-center gap-2 hover:bg-purple-50">
                                <FaUserCircle className="text-purple-500" />
                                <span>Profile</span>
                            </Dropdown.Item>
                        </Link>
                        <Link to={'/dashboard?tab=settings'}>
                            <Dropdown.Item className="flex items-center gap-2 hover:bg-purple-50">
                                <FaCog className="text-purple-500" />
                                <span>Settings</span>
                            </Dropdown.Item>
                        </Link>
                        <Dropdown.Divider />
                        <Dropdown.Item
                            onClick={() => navigate('/logout')}
                            className="flex items-center gap-2 hover:bg-red-50"
                        >
                            <FaSignOutAlt className="text-red-500" />
                            <span
                                className="text-red-500"
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </span>
                        </Dropdown.Item>
                    </Dropdown>
                ) : (
                    <Link to='/sign-in'>
                        <Button gradientDuoTone='purpleToBlue' outline>
                            Sign In
                        </Button>
                    </Link>
                )}
                <Navbar.Toggle />
            </div>
            <Navbar.Collapse>
                <Navbar.Link active={path === '/'} as={'div'}>
                    <Link to='/'>Home</Link>
                </Navbar.Link>
                <Navbar.Link active={path === '/about'} as={'div'}>
                    <Link to='/about'>About</Link>
                </Navbar.Link>
                <Navbar.Link active={path === '/advert'} as={'div'}>
                    <Link to='/advert-page'>Adverts</Link>
                </Navbar.Link>
                <Navbar.Link 
        active={path === '/live-stream' || path === '/create-stream'} 
        as={'div'}
    >
        <Link 
            to={userData?.isVip ? '/create-stream' : '/live-stream'}
            onClick={(e) => {
                e.preventDefault();
                handleLiveStream();
            }}
        >
            Live Stream
        </Link>
       </Navbar.Link>
            </Navbar.Collapse>
        </Navbar>
    )
}

export default Header