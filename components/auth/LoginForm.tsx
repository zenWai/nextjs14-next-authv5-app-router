"use client"
import {login} from "@/actions/login";
import {CardWrapper} from "@/components/auth/CardWrapper";
import {FormError} from "@/components/form-messages/FormError";
import {FormSuccess} from "@/components/form-messages/FormSuccess";
import {Button} from "@/components/ui/button";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {LoginSchema} from "@/schemas";
import {zodResolver} from "@hookform/resolvers/zod";
import {useState, useTransition} from "react";
import {useForm} from "react-hook-form";
import * as zod from "zod";

export function LoginForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<zod.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = (values: zod.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {

      login(values).then((data) => {
        if(data?.error) {
          setError(data.error);
        }
      }).catch((error) => {
        setError("An unexpected error occurred.");
        console.log(error);
      });

    });

  }
  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/register"
      showSocial
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="john.doe@example.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="1234567"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
          </div>
          <FormError message={error}></FormError>
          <FormSuccess message={success}></FormSuccess>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            Login
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}