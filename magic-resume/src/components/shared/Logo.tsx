/* Modified for 简励 by 17lijunyi, 2026-09-30. See root NOTICE and MODIFICATIONS.md. */
import React from "react";
import Image from "@/lib/image";

interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  size = 100,
  className = "",
  onClick,
}) => {
  return (
    <Image
      src="/icon.png?v=jianli-fullbleed-20260930"
      alt="简励 JL 图标"
      width={size}
      height={size}
      className={`rounded-[22%] ${className}`}
      onClick={onClick}
      priority={size >= 64}
    />
  );
};

export default Logo;
