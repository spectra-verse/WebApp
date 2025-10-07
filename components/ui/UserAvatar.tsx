"use client";
import { MD5 } from "crypto-js";

const UserAvatar = ({
  email,
  size = 80,
  alt = "User Avatar",
}: {
  email: string;
  size?: number;
  alt?: string;
}) => {
  // Gravatar requires the email to be trimmed and lowercased [1.2.3]
  const processedEmail = email.trim().toLowerCase();

  // Hash the email with MD5 as required by Gravatar API
  const hash = MD5(processedEmail).toString();

  // Construct the Gravatar URL [1.1.2, 1.2.1]
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;

  return (
    <img
      src={gravatarUrl}
      width={size}
      height={size}
      alt={alt}
      style={{ borderRadius: "50%" }}
    />
  );
};

export default UserAvatar;
