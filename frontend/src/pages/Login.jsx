import React from 'react'
import logo from '../assets/logo.png'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { adminDataContext } from '../context/AdminContext';
import axios from 'axios';
import Loader from '../components/Loader';


const API_URL = import.meta.env.VITE_BACKEND_URL;

function Login() {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const {setAdmin} = useContext(adminDataContext)
    const [loading, setLoading] = useState(false);

const handleFormSubmit = async (e) => {

e.preventDefault();

const adminData = {
    email:email.trim(),
    password:password
}

setLoading(true);

try {
    
const res = await axios.post(`${API_URL}/loginAdmin`, adminData);

console.log(res);

if(res.status === 200){

    const data = res.data
    console.log(data.admin)
    setAdmin(data.admin )
    localStorage.setItem('token', data.token)

setEmail('')
setPassword('')

    navigate('/dashboard')

}

} catch (error) {
console.log(error.response);
} finally {
    setLoading(false);
}
    }


return (
<section className="bg-gray-50 dark:bg-gray-900">
<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <img className="size-50 h-60" src={logo} alt="logo"/>
    <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in 
            </h1>

            <form className="space-y-4 md:space-y-6" onSubmit={(e) => handleFormSubmit(e)} >
                <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                    <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}

                    type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#0D5BA9] focus:border-[#0D5BA9] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#0D5BA9] dark:focus:border-[#0D5BA9]" placeholder="name@company.com" required/>
                </div>
                <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                    <input 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-[#0D5BA9] focus:border-[#0D5BA9] block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[#0D5BA9] dark:focus:border-[#0D5BA9]" required/>
                </div>
                <button
                disabled={loading}
                type="submit" className={`cursor-pointer h-12 w-full text-white hover:bg-[#0D5BA9] font-medium rounded-lg text-sm px-5 py-2.5 text-center ${loading?"bg-blue-300":"bg-blue-700"}`}>{loading ? <Loader/> : 'Sign in'}</button>
            </form>

        </div>
    </div>
</div>
</section>
)
}

export default Login