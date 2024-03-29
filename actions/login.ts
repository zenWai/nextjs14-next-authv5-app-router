"use server"

import {LoginSchema} from "@/schemas";
import * as zod from "zod";

export const login = async (values: zod.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: "Invalid fields"
    }
  }

  return {success: "Email sent!"}
}