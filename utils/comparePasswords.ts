import bcrypt from "bcrypt";

export async function comparePasswords(
  providedPassword: string,
  hashedPassword: string
): Promise<boolean> {
  // Implement your password comparison logic here
  // Example using bcrypt:
  return bcrypt.compare(providedPassword, hashedPassword);
}
