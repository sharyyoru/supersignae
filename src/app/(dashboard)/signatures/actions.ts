"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { renderSignatureHtml, renderPlainText } from "@/lib/signature-renderer";
import type { SignatureData } from "@/types/signature";
import { nanoid } from "nanoid";

export async function createSignature(payload: {
  name: string;
  data: SignatureData;
  layoutId?: string;
}) {
  const user = await requireAuth();
  const html = renderSignatureHtml(payload.data, payload.layoutId);
  const plainText = renderPlainText(payload.data);

  const signature = await prisma.signature.create({
    data: {
      name: payload.name,
      data: JSON.stringify(payload.data),
      html,
      plainText,
      status: "ACTIVE",
      userId: user.id,
      layoutId: payload.layoutId || "classic-horizontal",
    },
  });

  revalidatePath("/dashboard");
  return signature;
}

export async function updateSignature(
  id: string,
  payload: { name?: string; data?: SignatureData; layoutId?: string; status?: string }
) {
  const user = await requireAuth();
  const existing = await prisma.signature.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Signature not found");

  const data = payload.data ? JSON.stringify(payload.data) : existing.data;
  const parsed: SignatureData = payload.data || JSON.parse(existing.data);
  const html = payload.data ? renderSignatureHtml(parsed, payload.layoutId || existing.layoutId || undefined) : existing.html;
  const plainText = payload.data ? renderPlainText(parsed) : existing.plainText;

  const signature = await prisma.signature.update({
    where: { id },
    data: {
      name: payload.name ?? existing.name,
      data,
      html,
      plainText,
      status: payload.status ?? existing.status,
      layoutId: payload.layoutId ?? existing.layoutId,
    },
  });

  revalidatePath("/dashboard");
  return signature;
}

export async function deleteSignature(id: string) {
  const user = await requireAuth();
  await prisma.signature.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard");
}

export async function duplicateSignature(id: string) {
  const user = await requireAuth();
  const existing = await prisma.signature.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Signature not found");

  const signature = await prisma.signature.create({
    data: {
      name: `${existing.name} (Copy)`,
      data: existing.data,
      html: existing.html,
      plainText: existing.plainText,
      status: "ACTIVE",
      userId: user.id,
      layoutId: existing.layoutId,
    },
  });

  revalidatePath("/dashboard");
  return signature;
}

export async function sendInstallEmail(id: string, recipientEmail: string) {
  const user = await requireAuth();
  const signature = await prisma.signature.findFirst({ where: { id, userId: user.id } });
  if (!signature) throw new Error("Signature not found");

  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.installLink.create({
    data: {
      token,
      signatureId: signature.id,
      recipientEmail,
      installStatus: "PENDING",
      expiresAt,
    },
  });

  // If Resend is configured, send email; otherwise return link.
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/install/${token}`;
  let sent = false;
  if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: recipientEmail,
        subject: `Install your ${signature.name} email signature`,
        html: `<p>Hi,</p><p>Your team has created a new email signature for you. <a href="${link}">Install Signature</a></p><p>If the button does not work, copy this link: ${link}</p>`,
      });
      sent = true;
    } catch (err) {
      console.error("Resend failed:", err);
    }
  }

  await prisma.installLink.update({
    where: { token },
    data: { installStatus: sent ? "SENT" : "PENDING" },
  });

  revalidatePath("/dashboard");
  return { link, sent };
}
