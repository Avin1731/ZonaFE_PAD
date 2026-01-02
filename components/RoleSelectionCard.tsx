// src/components/RoleSelectionCard.tsx
"use client";

import Link from "next/link";

// Definisikan tipe untuk props
interface ButtonProps {
  text: string;
  href: string;
}

interface FooterLinkProps {
  text: string;
  href: string;
}

interface RoleSelectionCardProps {
  title: string;
  subtitle: string;
  buttons: ButtonProps[];
  footerLink?: FooterLinkProps;
}

export default function RoleSelectionCard({
  title,
  subtitle,
  buttons,
}: RoleSelectionCardProps) {
  return (
    // Komponen ini HANYA card putihnya saja
    <div className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-lg text-center border border-gray-300">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500 mb-8">{subtitle}</p>

      <div className="space-y-4">
        {buttons.map((button) => (
          <Link
            key={button.text}
            href={button.href}
            className="block w-full bg-[#00A86B] text-white font-bold py-3 px-4 rounded-lg hover:brightness-90 transition duration-300 shadow-sm" // WARNA BARU + EFEK HOVER
          >
            {button.text}
          </Link>
        ))}
      </div>
    </div>
  );
}