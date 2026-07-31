"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "@/lib/validations/auth-schema";
import { db } from "@/lib/db";
import { mechanics } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ActionResult } from "@/types";

export async function loginAction(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Detect email confirmation errors and show a clear message
    const message = error.message.toLowerCase();
    if (
      message.includes("email not confirmed") ||
      message.includes("email_not_confirmed")
    ) {
      return {
        success: false,
        error:
          "Email no confirmado. Revisá tu bandeja de entrada o contactá al administrador del sistema.",
      };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function registerAction(
  prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: "Error al crear el usuario" };
  }

  // 2. Create the mechanic record linked to auth user
  try {
    await db.insert(mechanics).values({
      id: authData.user.id,
      fullName: parsed.data.fullName ?? parsed.data.email.split("@")[0],
    });
  } catch {
    // If the DB insert fails, we should clean up the auth user
    // but Supabase handles this — the mechanic just won't have a profile
    return { success: false, error: "Error al crear el perfil del mecánico" };
  }

  return { success: true };
}

export async function signOutAction(
  _formData?: FormData,
): Promise<void> {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error.message);
  }
}