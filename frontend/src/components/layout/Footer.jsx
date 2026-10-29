import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        
        {/* Brand Column */}
        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <Leaf />
            </span>
            <span>
              SAVVY<span className="brand-light"> ENERGY</span>
              <small>POWERING YOUR TOMORROW</small>
            </span>
          </Link>
          <p>Smarter solar products and dependable energy solutions for homes and businesses.</p>
        </div>

        {/* Navigation Column */}
        <div>
          <h4>Explore</h4>
          <Link to="/shop">Shop products</Link>
          <Link to="/solutions">Energy solutions</Link>
          <Link to="/about">About us</Link>
        </div>

        {/* Contact Info Column */}
        <div>
          <h4>Get in touch</h4>
          <span>
            <Mail size={15} /> hello@savvyenergy.example
          </span>
          <span>
            <Phone size={15} /> Contact our team
          </span>
          <span>
            <MapPin size={15} /> Nigeria
          </span>
        </div>

      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Savvy Energy. Product availability and prices are subject to confirmation.
      </div>
    </footer>
  );
}