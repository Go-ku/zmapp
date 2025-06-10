'use client'
import { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext({user:null, loading:true})

export function UserProvider({children}) {
   const [user, setUser] = useState(null) 
   const [loading, setLoading] = useState(true)

    useEffect(()=>{
        const loadUser = async () => {
            try {
             
                const res = await fetch('api/auth/me')
                if (!res.ok) {
                    throw new Error('Unauthorized!')
                }
                const data = await res.json() 
                setUser(data.user)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
            

        }

        loadUser()
    }, [])
    return (
        <UserContext.Provider value={{user,loading}}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    return (
        useContext(UserContext)
    )
}