import React from 'react' 
import { useState } from 'react'; 
import { createContext } from 'react' 



export const adminDataContext = createContext(); 


export default function AdminContext({children}) { 
  
  const [admin, setAdmin] = useState({ email: '', name:'', role:'' }) 
  
  return ( 
    <adminDataContext.Provider value={{admin, setAdmin}}> 
    {children} 
    </adminDataContext.Provider> 
) }