"use client";

import React from "react";
import { IoDocumentTextSharp } from "react-icons/io5";
import { RiPlantFill } from "react-icons/ri";
import { FaHandshake } from "react-icons/fa";
import PlanSelector from "@/app/components/PlanSelector";
import FAQData from "@/app/components/FAQData";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Page(): React.ReactElement {
  const { user } = useAuth();
  
      if (!user) {
          return (
          <div className="font-bold text-red-500 animate-pulse"> You need to sign in before you choose a subscription plan.
              <Link href={'/login'} className="bg-blue-600 text-white p-2 rounded-2xl ml-4">Sign Me In</Link>
          </div>
      );
  }
  return (
    <div>
      <div className="bg-blue-900 text-white max-w-250 h-auto m-auto pt-8 sm:rounded-bl-[100%] sm:rounded-br-[100%]">
        <div className="text-center max-w-200 m-auto text-5xl font-bold pt-16">
          Get unlimited access to many amazing books to read
          <p className="text-center max-w-150 m-auto pt-10 text-lg font-normal rounded-bl-2xl">
            Turn ordinary moments into amazing learning opportunities
          </p>
          <img className="w-70 m-auto rounded-t-full mt-6" src={"/pricing-top.png"} alt="Pricing Cover" />
        </div>
      </div>

      <div className="flex grid-cols-3 mx-auto max-w-3xl gap-8 text-center pt-8">
        <div className="flex flex-col items-center">
          <IoDocumentTextSharp className="inline text-6xl mb-4" />
          <p>
            <span className="font-semibold">Key ideas in few min</span> with many books to read
          </p>
        </div>
        <div className="flex flex-col items-center">
          <RiPlantFill className="inline text-6xl mb-4" />
          <p>
            <span className="font-semibold">3 million </span>people growing with Summarist everyday
          </p>
        </div>
        <div className="flex flex-col items-center">
          <FaHandshake className="inline text-6xl mb-4" />
          <p>
            <span className="font-semibold">Precise recommendations </span> collections curated by experts
          </p>
        </div>
      </div>

      <div className="flex justify-center text-center m-auto">
          <PlanSelector />
      </div>

      <div>
        <FAQData />
      </div>

      <footer className="bg-gray-100 p-10 w-full">
        <div className="flex flex-col sm:flex-row justify-between bg-gray-100 max-w-4xl m-auto">
          <ul className="mt-6 font-semibold cursor-not-allowed space-y-1">
            Actions
            <li className="text-sm font-normal"> Summarist Magazine </li>
            <li className="text-sm font-normal"> Cancel Subscription </li>
            <li className="text-sm font-normal">Help</li>
            <li className="text-sm font-normal">Contact Us</li>
          </ul>
          <ul className="mt-6 font-semibold cursor-not-allowed space-y-1">
            Useful Links
            <li className="text-sm font-normal">Pricing</li>
            <li className="text-sm font-normal"> Summarist Business </li>
            <li className="text-sm font-normal">Gift Cards</li>
            <li className="text-sm font-normal"> Authors & Publishers </li>
          </ul>
          <ul className="mt-6 font-semibold cursor-not-allowed space-y-1">
            Company
            <li className="text-sm font-normal">About</li>
            <li className="text-sm font-normal">Careers</li>
            <li className="text-sm font-normal">Partners</li>
            <li className="text-sm font-normal">Code of Conduct</li>
          </ul>
          <ul className="mt-6 font-semibold cursor-not-allowed space-y-1">
            Other
            <li className="text-sm font-normal">Sitemap</li>
            <li className="text-sm font-normal">Legal Notice</li>
            <li className="text-sm font-normal"> Terms of Service </li>
            <li className="text-sm font-normal"> Privacy Policies </li>
          </ul>
        </div>
        <div className="text-center font-semibold pt-10">
          Copyright © 2026 Summarist
        </div>
      </footer>
    </div>
  );
}
