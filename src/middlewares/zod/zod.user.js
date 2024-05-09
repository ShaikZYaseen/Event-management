import Zod from "zod";

const signUp = {
  username: Zod.string().min(1, { message: 'Username must be at least 1 character long' }).max(255),
  email: Zod.string().email({ message: 'Invalid email address' }),
  password: Zod.string().min(6, { message: 'Password must be at least 6 characters long' }).max(30),
  firstName: Zod.string().optional(),
  lastName: Zod.string().optional(),
  bio: Zod.string().optional(),
  profilePicture: Zod.string().optional(),
};


const signIn = {
  email: Zod.string().email({ message: 'Invalid email address' }),
  password: Zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
};


export { 
    signUp,
    signIn
 };
