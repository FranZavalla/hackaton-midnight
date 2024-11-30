"use client";

import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";

import { Wallet } from "./wallet";

export const Header = () => {
  return (
    <Navbar className="bg-stone-900">
      <NavbarBrand className="text-2xl">
        <b>Ballot Midnight</b>
      </NavbarBrand>
      <NavbarContent>
        <Wallet />
      </NavbarContent>
    </Navbar>
  );
};
