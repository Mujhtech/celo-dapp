import React, { useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarText,
  Container,
  Badge
} from 'reactstrap';

const Header = ({balance}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="dark" dark expand="md">
        <Container>
          <NavbarBrand href="/">CeloDapp</NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar className="ml-auto">
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap">Support Us</NavLink>
              </NavItem>
            </Nav>
            <NavbarText>Balance: <Badge color="secondary">{balance}cUSD</Badge></NavbarText>
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default Header;