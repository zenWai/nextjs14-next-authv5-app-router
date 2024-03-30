"use server"

import {RegisterSchema} from "@/schemas";
import * as zod from "zod";

export const register = async (values: zod.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields"
    }
  }

  return {success: "Registration successful"}
}