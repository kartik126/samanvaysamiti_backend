import bcrypt from "bcrypt";

// Function to hash the password securely using bcrypt
export async function hashPasswordSecurely(password: string): Promise<string> {
  return bcrypt.hash(password, 10); // The second parameter is the salt rounds
}
