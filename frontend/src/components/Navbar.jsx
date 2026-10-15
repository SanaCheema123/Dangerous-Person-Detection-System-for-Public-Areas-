import { NavLink } from "react-router-dom";
import { Shield, Radio } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const navItems = [
    { name: "HOME", path: "/" },
    { name: "DETECTION", path: "/detection" },
    { name: "LIVE MONITORING", path: "/live-monitoring" },
    { name: "HISTORY", path: "/history" },
    { name: "ABOUT", path: "/about" },
  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="brand">
          <div className="brand-icon">
            <Shield size={34} strokeWidth={1.5} />
          </div>

          <div className="brand-text">
            <strong>DANGEROUS-PERSON</strong>
            <span>DETECTION SYSTEM</span>
          </div>
        </NavLink>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <NavLink to="/live-monitoring" className="live-button">
          <Radio size={15} />
          <span>LIVE</span>
        </NavLink>
      </div>
    </header>
  );
}

export default Navbar;