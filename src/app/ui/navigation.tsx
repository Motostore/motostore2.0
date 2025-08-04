'use client';
import NavLinks from './nav-links';
import { Navbar } from "flowbite-react";

export default function Navigation() {
  return (
    <Navbar fluid className='shadow-lg'>
      <Navbar.Toggle className=' text-gray-500 justify-center' />
      <Navbar.Collapse className='m-auto'>
        <NavLinks />
      </Navbar.Collapse>
    </Navbar>
  );
}
