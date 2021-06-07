import React from 'react'
import { Navbar, Nav, NavDropdown } from 'react-bootstrap'

import './Navbar.css'

/**
 * Navbar component.
 */
const Navy = () => {
  /**
   * Render navbar links to login/logout or go
   * to the home page.
   */
  const renderNavLinks = () => {
    const auth = false
    return auth ? (
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto"></Nav>
        <Nav>
          <Nav.Link className="navbar--link" href={null}>
            <span id="account-link">
              <i className="far fa-user-circle"></i>
              <span> name </span>
            </span>
          </Nav.Link>
          <div className="navbar--link nav-link">
            <NavDropdown
              title={<i className="fas fa-bars"></i>}
              id="basic-nav-dropdown"
            >
              <NavDropdown.Item href={null}>Aide</NavDropdown.Item>
              <NavDropdown.Item href={null}>Another action</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href={null}>Déconexion</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Nav>
      </Navbar.Collapse>
    ) : (
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto"></Nav>
        <Nav>
          <Nav.Link className="navbar--link" href={null}>
            <span id="account-link">
              <i className="far fa-user-circle"></i>
              <span> MON COMPTE </span>
            </span>
          </Nav.Link>
          <div className="navbar--link nav-link">
            <NavDropdown
              title={<i className="fas fa-bars"></i>}
              id="basic-nav-dropdown"
            >
              <NavDropdown.Item href={null}>Aide</NavDropdown.Item>
              <NavDropdown.Item href={null}>Another action</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Nav>
      </Navbar.Collapse>
    )
  }

  return (
    <Navbar id="navy-diamant" className="navbar">
      <Navbar.Brand href="/" className="navbar--logo-holder">
        <h1> GINHO </h1>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      {renderNavLinks()}
    </Navbar>
  )
}

export default Navy
