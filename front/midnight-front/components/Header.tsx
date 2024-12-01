"use client";

import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";

import { Wallet } from "./Wallet";
import Image from "next/image";

export const Header = () => {
  return (
    <Navbar className="bg-stone-900">
      <NavbarBrand className="text-2xl">
        <Image src="/midnight.png" alt="" width={50} height={50} />
        <b>Ballot Midnight</b>
      </NavbarBrand>
      <NavbarContent>
        <Wallet />
      </NavbarContent>
    </Navbar>
  );
};
