// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { ethers } from 'ethers';
import { useEffect, useState } from "react";
import '../css/nav.css'; // Import the external CSS

function Navbar() {
  

  return (
    <nav className="navbar">

      <div className="navbar-container">
        <Link to="/" className="navbar-logo">NFTbazar</Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link" >Home</Link>
          <Link to="/create" className="navbar-link">Create</Link>
          <Link to="/list" className="navbar-link">List</Link>
          <Link to="/mypurchase" className="navbar-link">My Orders</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
