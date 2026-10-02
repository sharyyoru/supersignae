import { prisma } from "../src/lib/prisma";
import { renderSignatureHtml, renderPlainText } from "../src/lib/signature-renderer";
import { DEFAULT_SIGNATURE_DATA } from "../src/types/signature";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || "wilson@drehomes.com";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("Admin user not found");
    process.exit(1);
  }

  const data = DEFAULT_SIGNATURE_DATA;
  const html = renderSignatureHtml(data, "classic-horizontal");
  const plainText = renderPlainText(data);

  const signature = await prisma.signature.create({
    data: {
      name: "Sample Sales Signature",
      data: JSON.stringify(data),
      html,
      plainText,
      status: "ACTIVE",
      userId: user.id,
      layoutId: "classic-horizontal",
    },
  });

  console.log("Created signature:", signature.id);
}

main().finally(async () => {
  await prisma.$disconnect();
});
