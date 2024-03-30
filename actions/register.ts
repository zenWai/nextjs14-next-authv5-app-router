"use server"

import {RegisterSchema} from "@/schemas";
import * as zod from "zod";
import bcrypt from "bcrypt";
import {db} from "@/lib/db";

export const register = async (values: zod.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields"
    }
  }

  const {email, password, name} = validatedFields.data;
  // auto generate salted hash
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.user.findUnique({
    where: {
      email
    }
  })

  if(existingUser) {
    return {error: "Email already registered!"};
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword
    }
  })

  // TODO: send verification email

  return {success: "User created!"}
}