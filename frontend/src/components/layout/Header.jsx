import { Link, NavLink } from 'react-router-dom';
import { Sun, Moon, ShoppingCart, UserRound, LogOut, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Fixed: Added semicolon
import logo from '../../assets/products/savvy1.png'; // Fixed: Changed path depth to match contexts

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="nav-wrap">

        <Link className="brand" to="/" onClick={close}>
          <span className="brand-mark">
            <img src={logo} alt="Savvy Energy Logo" style={{ height: '25px', width: 'auto' }} />
          </span>
          <span>
            SAVVY<span className="brand-light"> ENERGY</span>
            <small>POWERING YOUR TOMORROW</small>
          </span>
        </Link>

        <button 
          className="mobile-toggle icon-button" 
          onClick={() => setOpen(!open)} 
          aria-label="Toggle navigation"
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/shop" onClick={close}>Shop</NavLink>
          <NavLink to="/solutions" onClick={close}>Solutions</NavLink>
          <NavLink to="/about" onClick={close}>About</NavLink>
          <NavLink to="/quote" onClick={close}>Request a quote</NavLink>
          
          {user?.role === 'admin' && (
            <NavLink to="/admin" onClick={close}>Admin</NavLink>
          )}

          <button 
            className="icon-button theme-toggle" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} 
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {user ? (
            <button className="nav-action" onClick={() => { logout(); close(); }}>
              <LogOut size={16} /> Log out
            </button>
          ) : (
            <Link className="nav-action" to="/login" onClick={close}>
              <UserRound size={16} /> Log in
            </Link>
          )}

          <Link className="cart-link" to="/cart" onClick={close}>
            <ShoppingCart size={19} />
            <span>Cart</span>
            {count > 0 && <b>{count}</b>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
