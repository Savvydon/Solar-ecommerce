import {createContext,useContext,useEffect,useState} from 'react';
const ThemeContext=createContext(null);
export function ThemeProvider({children}){
 const [theme,setTheme]=useState(()=>localStorage.getItem('se_theme')|| (window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light'));
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('se_theme',theme)},[theme]);
 return <ThemeContext.Provider value={{theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark')}}>{children}</ThemeContext.Provider>
}
export const useTheme=()=>useContext(ThemeContext);
