import Image from "next/image";

const Logo = ({ className = "h-8 w-auto" }) => {
  return (
    <Image
      src="/images/logo-s.png"
      alt="Logo"
      width={250}
      height={250}
      className={className}
      priority
    />
  );
};

export default Logo;
