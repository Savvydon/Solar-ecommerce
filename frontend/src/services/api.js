const API_URL = import.meta.env.VITE_API_URL || 'https://solar-ecommerce-ciim.onrender.com';
export function token(){ return localStorage.getItem('se_token'); }
export async function api(path, options={}){
  const headers={...(options.body?{'Content-Type':'application/json'}:{}),...(token()?{Authorization:`Bearer ${token()}`}:{ }),...(options.headers||{})};
  const response=await fetch(`${API_URL}${path}`,{...options,headers});
  const data=await response.json().catch(()=>({detail:'Unexpected server response'}));
  if(!response.ok) throw new Error(data.detail||data.message||'Request failed');
  return data;
}
