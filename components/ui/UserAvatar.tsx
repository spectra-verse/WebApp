import Image from "next/image";
import { SHA256 } from "crypto-js";

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

  // Hash the email with SHA256 as recommended [1.2.3, 1.4.6]
  const hash = SHA256(processedEmail).toString();

  // Construct the Gravatar URL [1.1.2, 1.2.1]
  const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?s=${size}&d=mp`;

  return (
    <Image
      src={gravatarUrl}
      width={size}
      height={size}
      alt={alt}
      style={{ borderRadius: "50%" }}
    />
  );
};

export default UserAvatar;
