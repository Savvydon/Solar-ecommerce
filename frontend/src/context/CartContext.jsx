import {createContext,useContext,useEffect,useState} from 'react';
const CartContext=createContext(null);
export function CartProvider({children}){
 const [items,setItems]=useState(()=>{try{return JSON.parse(localStorage.getItem('se_cart'))||[]}catch{return []}});
 useEffect(()=>localStorage.setItem('se_cart',JSON.stringify(items)),[items]);
 const add=(product,quantity=1)=>setItems(old=>{const found=old.find(x=>x.id===product.id);return found?old.map(x=>x.id===product.id?{...x,quantity:Math.min(x.quantity+quantity,product.stock||999)}:x):[...old,{...product,quantity}]});
 const remove=id=>setItems(old=>old.filter(x=>x.id!==id));
 const update=(id,quantity)=>setItems(old=>old.map(x=>x.id===id?{...x,quantity:Math.max(1,Math.min(Number(quantity)||1,x.stock||999))}:x));
 const clear=()=>setItems([]); const count=items.reduce((s,x)=>s+x.quantity,0); const total=items.reduce((s,x)=>s+x.price*x.quantity,0);
 return <CartContext.Provider value={{items,add,remove,update,clear,count,total}}>{children}</CartContext.Provider>
}
export const useCart=()=>useContext(CartContext);
