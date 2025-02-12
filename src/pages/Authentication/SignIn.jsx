import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { Label, TextInput, Button, Alert } from 'flowbite-react'
import { HiMail, HiLockClosed } from 'react-icons/hi'
import summaryApi from '../../common'
import { useDispatch, useSelector } from 'react-redux'
import { signInFailure, signInStart, signInSuccess } from '../../redux/user/userSlice'
import OAuth from '../../components/OAuth/OAuth'


function SignIn() {
  const [formData, setFormData] = useState({});
  // const [errorMessage, setErrorMessage] = useState(null);
  // const [loading, setLoading] = useState(false);
  const {loading, error: errorMessage} = useSelector((state) => state.user);
  const dispatch = useDispatch()
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill out all fields'));
    }
    try {
      dispatch(signInStart())
      const res = await fetch(summaryApi.loginUser.url, {
        method: summaryApi.loginUser.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        return dispatch(signInFailure(data.message));
      }
      
      if(res.ok) {
        dispatch(signInSuccess(data))
        localStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message))      
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className="flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-8">
        {/* left side */}
        <div className="flex-1">
          <Link className='font-bold dark:text-white text-4xl'>
            <div className='flex flex-col items-center gap-1'>
              <video 
                src={assets.logo4}
                autoPlay
                muted
                loop
                playsInline         
                className="w-20 rounded-lg object-cover cursor-pointer [filter:contrast(1.2)_brightness(1.1)_saturate(1.2)]"
              /> 
              <div className='flex flex-col items-center -mt-1'>
                <span className='text-[14px] font-medium'>
                  Spectrum Blog
                </span>
                <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full text-white text-[10px] px-3 py-0.5'>
                  By Sonia
                </span>
              </div>
            </div>                    
          </Link>
          <p className='text-sm mt-5 text-gray-600 dark:text-slate-100 text-center'>
            Welcome back to Spectrum Blog! Sign in to continue your journey through our kaleidoscope of stories, insights, and discoveries.
          </p>
        </div>

        {/* right side */}
        <div className="flex-1">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label htmlFor='email' value='Your Email' className='text-gray-700' />
              <TextInput
                type='email'
                placeholder='name@email.com'
                id='email'
                icon={HiMail}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor='password' value='Your Password' className='text-gray-700' />
              <TextInput
                type='password'
                placeholder='Password'
                id='password'
                icon={HiLockClosed}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <Button 
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
              className='w-full'
            >
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
            <OAuth/>
          </form>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account?</span>
            <Link to='/sign-up' className='text-blue-500'>
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn