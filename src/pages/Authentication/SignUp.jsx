import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { Label, TextInput, Button, Alert, Spinner } from 'flowbite-react'
import { HiMail, HiLockClosed, HiUser } from 'react-icons/hi'
import summaryApi from '../../common'
import OAuth from '../../components/OAuth/OAuth'

function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('Please fill out all fields');
    }
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(summaryApi.registerUsers.url, {  
        method: summaryApi.registerUsers.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: formData.username,  
          email: formData.email,
          password: formData.password
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if(res.ok) {
        navigate('/sign-in');
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
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
                <span className='bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 rounded-full text-white text-[10px] px-3 py-0.5'>
                  By Sonia
                </span>
              </div>
            </div>                    
          </Link>
          <p className='text-sm mt-5 text-gray-600 dark:text-slate-100 text-center'>  
            Spectrum Blog by Sonia is your one-stop destination for insights, ideas, and inspiration across every topic under the sun. From lifestyle to technology, food to travel, we cover the entire spectrum of human curiosity and creativity, bringing you a vibrant mix of information and entertainment.
          </p>
        </div>

        {/* right side */}
        <div className="flex-1">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label htmlFor='username' value='Your Username' className='text-gray-700' />
              <TextInput
                type='text'
                placeholder='Username'
                id='username'
                icon={HiUser}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
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
                autoComplete="new-password"
              />
            </div>
            <Button 
              gradientDuoTone='purpleToBlue'
              type='submit'
              disabled={loading}
              className='w-full'
            >
              {loading ? (
              <>
              <Spinner size='sm'/>
              <span className='pl-3'>Loading...</span>
               </> ):( 'Sign Up')}
            </Button>
            <OAuth type="sign up" />
          </form>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
          <div className="flex gap-2 text-sm mt-5">
            <span>Have an account?</span>
            <Link to='/sign-in' className='text-blue-500'>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp