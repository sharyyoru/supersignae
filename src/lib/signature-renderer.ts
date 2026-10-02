import type { SignatureData } from "@/types/signature";
import DOMPurify from "isomorphic-dompurify";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function linked(text: string, url: string, style?: string) {
  const clean = escapeHtml(text);
  if (url && isValidUrl(url)) {
    return `<a href="${escapeHtml(url)}" target="_blank" style="color:inherit;text-decoration:none;${style || ""}">${clean}</a>`;
  }
  return clean;
}

function detailLine(label: string, value: string) {
  if (!value) return "";
  return `<tr><td style="padding:1px 0;">${escapeHtml(value)}</td></tr>`;
}

function renderContactRows(data: SignatureData) {
  const { details, design } = data;
  const items: string[] = [];
  if (details.jobTitle) items.push(escapeHtml(details.jobTitle));
  if (details.company) items.push(escapeHtml(details.company));
  if (details.email)
    items.push(`<a href="mailto:${escapeHtml(details.email)}" style="color:${design.secondaryColor};text-decoration:none;">${escapeHtml(details.email)}</a>`);
  if (details.phone)
    items.push(`<a href="tel:${escapeHtml(details.phone)}" style="color:${design.secondaryColor};text-decoration:none;">${escapeHtml(details.phone)}</a>`);
  if (details.mobile)
    items.push(`<a href="tel:${escapeHtml(details.mobile)}" style="color:${design.secondaryColor};text-decoration:none;">${escapeHtml(details.mobile)}</a>`);
  if (details.website && isValidUrl(details.website))
    items.push(`<a href="${escapeHtml(details.website)}" target="_blank" style="color:${design.primaryColor};text-decoration:none;">${escapeHtml(details.website)}</a>`);
  if (details.address) items.push(escapeHtml(details.address));

  if (!items.length) return "";
  return `<tr><td style="padding-top:4px;font-size:${design.fontSize}px;color:${design.secondaryColor};line-height:1.5;">${items.join(data.design.separator)}</td></tr>`;
}

function renderSocialIcons(data: SignatureData) {
  const links = data.social.links.filter((l) => l.url && isValidUrl(l.url));
  if (!links.length) return "";
  const size = 20;
  const icons = links
    .map((l) => {
      const color = data.design.socialIconColor;
      return `<a href="${escapeHtml(l.url)}" target="_blank" style="display:inline-block;margin-right:8px;width:${size}px;height:${size}px;background:${color};border-radius:50%;text-align:center;line-height:${size}px;color:#fff;font-size:10px;text-decoration:none;font-family:sans-serif;font-weight:bold;" title="${escapeHtml(l.platform)}">${escapeHtml(l.platform[0])}</a>`;
    })
    .join("");
  return `<tr><td style="padding-top:10px;">${icons}</td></tr>`;
}

function renderBanner(data: SignatureData) {
  const { bannerUrl, bannerLink } = data.addons;
  if (!bannerUrl) return "";
  const img = `<img src="${escapeHtml(bannerUrl)}" alt="Banner" style="max-width:520px;height:auto;display:block;margin-top:12px;" />`;
  if (bannerLink && isValidUrl(bannerLink)) {
    return `<a href="${escapeHtml(bannerLink)}" target="_blank" style="text-decoration:none;">${img}</a>`;
  }
  return img;
}

function renderBadges(data: SignatureData) {
  const badges = data.addons.badges.filter((b) => b.imageUrl);
  if (!badges.length) return "";
  const imgs = badges
    .map((b) => {
      const img = `<img src="${escapeHtml(b.imageUrl)}" alt="${escapeHtml(b.alt || "")}" style="height:36px;width:auto;display:inline-block;margin-right:8px;" />`;
      return b.linkUrl && isValidUrl(b.linkUrl) ? `<a href="${escapeHtml(b.linkUrl)}" target="_blank" style="text-decoration:none;">${img}</a>` : img;
    })
    .join("");
  return `<tr><td style="padding-top:10px;">${imgs}</td></tr>`;
}

function renderDisclaimer(data: SignatureData) {
  if (!data.details.disclaimer) return "";
  return `<tr><td style="padding-top:10px;font-size:11px;color:#6b7280;line-height:1.4;max-width:520px;">${escapeHtml(data.details.disclaimer)}</td></tr>`;
}

function renderQuote(data: SignatureData) {
  if (!data.addons.quote) return "";
  return `<tr><td style="padding-top:10px;font-style:italic;color:${data.design.secondaryColor};font-size:${Number(data.design.fontSize) - 1}px;">"${escapeHtml(data.addons.quote)}"</td></tr>`;
}

function renderMeeting(data: SignatureData) {
  if (!data.addons.meetingUrl) return "";
  const url = data.addons.meetingUrl;
  return `<tr><td style="padding-top:8px;"><a href="${escapeHtml(url)}" target="_blank" style="display:inline-block;padding:6px 12px;background:${data.design.primaryColor};color:#fff;border-radius:4px;text-decoration:none;font-size:13px;">Book a meeting</a></td></tr>`;
}

function renderMobileApps(data: SignatureData) {
  const ios = data.addons.mobileAppIos;
  const android = data.addons.mobileAppAndroid;
  if (!ios && !android) return "";
  const parts = [];
  if (ios && isValidUrl(ios)) parts.push(`<a href="${escapeHtml(ios)}" target="_blank" style="color:${data.design.primaryColor};text-decoration:none;">Download on the App Store</a>`);
  if (android && isValidUrl(android)) parts.push(`<a href="${escapeHtml(android)}" target="_blank" style="color:${data.design.primaryColor};text-decoration:none;">Get it on Google Play</a>`);
  return `<tr><td style="padding-top:8px;font-size:12px;">${parts.join("  ")}</td></tr>`;
}

function renderCustomLinks(data: SignatureData) {
  if (!data.addons.links.length) return "";
  const links = data.addons.links
    .filter((l) => l.url && isValidUrl(l.url))
    .map((l) => `<a href="${escapeHtml(l.url)}" target="_blank" style="color:${data.design.primaryColor};text-decoration:none;margin-right:10px;">${escapeHtml(l.label)}</a>`)
    .join("");
  if (!links) return "";
  return `<tr><td style="padding-top:8px;font-size:${data.design.fontSize}px;">${links}</td></tr>`;
}

function renderLogo(data: SignatureData) {
  if (!data.details.logoUrl) return "";
  const { logoShape, logoSize, primaryColor } = data.design;
  const radius = logoShape === "circle" ? "50%" : logoShape === "rounded" ? "8px" : "0";
  return `<img src="${escapeHtml(data.details.logoUrl)}" alt="${escapeHtml(data.details.company || "Logo")}" style="border-radius:${radius};width:${logoSize}px;height:auto;max-height:${logoSize}px;object-fit:contain;" />`;
}

function renderAvatar(data: SignatureData) {
  if (!data.details.avatarUrl) return "";
  const { avatarShape, logoSize } = data.design;
  const size = Math.round(logoSize * 0.7);
  const radius = avatarShape === "circle" ? "50%" : avatarShape === "rounded" ? "8px" : "0";
  return `<img src="${escapeHtml(data.details.avatarUrl)}" alt="${escapeHtml(data.details.fullName || "")}" style="border-radius:${radius};width:${size}px;height:${size}px;object-fit:cover;" />`;
}

function baseTable(data: SignatureData, extra: { showLogo: boolean; showAvatar: boolean; layout: "horizontal" | "vertical" | "compact" }) {
  const { details, design } = data;
  const nameHtml = details.fullName
    ? `<strong style="font-size:${Number(design.fontSize) + 2}px;color:${design.primaryColor};">${escapeHtml(details.fullName)}</strong>`
    : "";

  const leftCol = [];
  if (extra.showLogo) leftCol.push(renderLogo(data));
  if (extra.showAvatar) leftCol.push(renderAvatar(data));
  const leftContent = leftCol.join('<div style="height:8px;"></div>');

  const rightRows = [
    nameHtml ? `<tr><td style="padding-bottom:2px;">${nameHtml}</td></tr>` : "",
    renderContactRows(data),
    renderSocialIcons(data),
    renderBadges(data),
    renderMeeting(data),
    renderMobileApps(data),
    renderCustomLinks(data),
    renderQuote(data),
    renderDisclaimer(data),
  ].join("");

  if (extra.layout === "horizontal" && leftContent) {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family:${design.fontFamily};color:${design.secondaryColor};">
        <tr>
          <td style="padding-right:16px;vertical-align:top;">${leftContent}</td>
          <td style="vertical-align:top;border-left:2px solid ${design.primaryColor};padding-left:16px;">
            <table cellpadding="0" cellspacing="0" border="0">${rightRows}</table>
          </td>
        </tr>
      </table>
    `;
  }

  if (extra.layout === "compact") {
    return `
      <table cellpadding="0" cellspacing="0" border="0" style="font-family:${design.fontFamily};color:${design.secondaryColor};">
        ${nameHtml ? `<tr><td>${nameHtml}</td></tr>` : ""}
        ${renderContactRows(data)}
        ${renderSocialIcons(data)}
        ${renderBadges(data)}
        ${renderCustomLinks(data)}
        ${renderDisclaimer(data)}
      </table>
    `;
  }

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family:${design.fontFamily};color:${design.secondaryColor};">
      ${leftContent ? `<tr><td style="padding-bottom:8px;">${leftContent}</td></tr>` : ""}
      ${nameHtml ? `<tr><td>${nameHtml}</td></tr>` : ""}
      ${renderContactRows(data)}
      ${renderSocialIcons(data)}
      ${renderBadges(data)}
      ${renderMeeting(data)}
      ${renderMobileApps(data)}
      ${renderCustomLinks(data)}
      ${renderQuote(data)}
      ${renderDisclaimer(data)}
    </table>
  `;
}

const layoutRenderers: Record<string, (data: SignatureData) => string> = {
  "classic-horizontal": (data) => baseTable(data, { showLogo: true, showAvatar: false, layout: "horizontal" }),
  "minimal-vertical": (data) => baseTable(data, { showLogo: false, showAvatar: true, layout: "vertical" }),
  "brand-horizontal": (data) => baseTable(data, { showLogo: true, showAvatar: true, layout: "horizontal" }),
  compact: (data) => baseTable(data, { showLogo: false, showAvatar: false, layout: "compact" }),
};

export function renderSignatureHtml(data: SignatureData, layoutId = "classic-horizontal"): string {
  const renderer = layoutRenderers[layoutId] || layoutRenderers["classic-horizontal"];
  const body = renderer(data);
  const banner = renderBanner(data);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;"><div style="font-family:${data.design.fontFamily};font-size:${data.design.fontSize}px;color:${data.design.secondaryColor};">${body}${banner}</div></body></html>`;
  return DOMPurify.sanitize(html, { WHOLE_DOCUMENT: true, ALLOWED_TAGS: ["!DOCTYPE", "html", "head", "meta", "body", "div", "table", "tr", "td", "a", "img", "strong", "br", "p", "span"], ALLOWED_ATTR: ["style", "href", "target", "src", "alt", "title", "charset"], KEEP_CONTENT: true });
}

export function renderPlainText(data: SignatureData): string {
  const lines = [];
  if (data.details.fullName) lines.push(data.details.fullName);
  if (data.details.jobTitle) lines.push(data.details.jobTitle);
  if (data.details.company) lines.push(data.details.company);
  if (data.details.email) lines.push(data.details.email);
  if (data.details.phone) lines.push(data.details.phone);
  if (data.details.mobile) lines.push(data.details.mobile);
  if (data.details.website) lines.push(data.details.website);
  if (data.details.address) lines.push(data.details.address);
  data.social.links.forEach((l) => {
    if (l.url) lines.push(`${l.platform}: ${l.url}`);
  });
  if (data.addons.quote) lines.push(`"${data.addons.quote}"`);
  if (data.details.disclaimer) lines.push(data.details.disclaimer);
  return lines.join("\n");
}
