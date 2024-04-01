"use server"

import {getUserByEmail} from "@/data/user";
import {generateVerificationToken} from "@/lib/tokens";
import {DEFAULT_LOGIN_REDIRECT} from "@/routes";
import {LoginSchema} from "@/schemas";
import {AuthError} from "next-auth";
import * as zod from "zod";
import {signIn} from '@/auth'

export const login = async (values: zod.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {error: "Invalid fields!"}
  }

  const {email, password} = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if(!existingUser || !existingUser.email || !existingUser.password) {
    return {error: "Invalid credentials"};
  }

  if(!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(email);
    return {success: "Confirmation email sent!"};
  }


  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT
    })
  } catch(error) {
    if(error instanceof AuthError) {
      switch(error.type) {
        case "CredentialsSignin":
          return {error: "Invalid credentials"}
        default:
          return {error: "An error occurred"}
      }
    }

    throw error;
  }
}