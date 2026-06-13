"use client";

import { FORGOT_PASSWORD_FORM_FIELDS } from "@/modules/auth/constants/auth.constant";
import { ForgotPasswordValues, forgotPasswordSchema } from "@/modules/auth/dto/auth.dto";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    // Mocking an API call to send reset password link
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-accent p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center border border-green-200 font-medium">
              If an account exists for that email, we have sent a password reset link. Please check your inbox.
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {FORGOT_PASSWORD_FORM_FIELDS.map((field) => (
                <InputField key={field.name} control={form.control} {...field} />
              ))}

              <Button type="submit" className="w-full h-10 mt-4" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center border-t p-4 mt-2 bg-muted/20">
          <Link href={PATHS.AUTH.LOGIN} className="text-sm text-primary hover:underline font-medium">
            &larr; Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
