import {createContext,useContext,useEffect,useState} from 'react';
import {api,token} from '../services/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('se_user'))}catch{return null}});
 const [loading,setLoading]=useState(Boolean(token()));
 useEffect(()=>{if(token()) api('/auth/me').then(u=>{setUser(u);localStorage.setItem('se_user',JSON.stringify(u))}).catch(()=>{localStorage.removeItem('se_token');localStorage.removeItem('se_user');setUser(null)}).finally(()=>setLoading(false))},[]);
 const login=async (email,password)=>{const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('se_token',d.access_token);localStorage.setItem('se_user',JSON.stringify(d.user));setUser(d.user);return d.user};
 const register=async (name,email,password)=>{const d=await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})});localStorage.setItem('se_token',d.access_token);localStorage.setItem('se_user',JSON.stringify(d.user));setUser(d.user);return d.user};
 const logout=()=>{localStorage.removeItem('se_token');localStorage.removeItem('se_user');setUser(null)};
 return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
