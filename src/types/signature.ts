export interface SocialLink {
  platform: string;
  url: string;
}

export interface Badge {
  imageUrl: string;
  linkUrl: string;
  alt: string;
}

export interface CustomLink {
  label: string;
  url: string;
}

export interface SignatureData {
  details: {
    fullName: string;
    jobTitle: string;
    company: string;
    email: string;
    phone: string;
    mobile: string;
    fax: string;
    website: string;
    address: string;
    disclaimer: string;
    logoUrl: string;
    avatarUrl: string;
  };
  social: {
    links: SocialLink[];
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    logoShape: "square" | "rounded" | "circle";
    logoSize: number;
    avatarShape: "square" | "rounded" | "circle";
    socialIconStyle: "filled" | "outline" | "monochrome";
    socialIconColor: string;
    separator: " | " | "  " | " • " | " - ";
  };
  addons: {
    bannerUrl: string;
    bannerLink: string;
    badges: Badge[];
    links: CustomLink[];
    quote: string;
    meetingUrl: string;
    mobileAppIos: string;
    mobileAppAndroid: string;
  };
}

export const DEFAULT_SIGNATURE_DATA: SignatureData = {
  details: {
    fullName: "",
    jobTitle: "",
    company: "",
    email: "",
    phone: "",
    mobile: "",
    fax: "",
    website: "",
    address: "",
    disclaimer: "",
    logoUrl: "",
    avatarUrl: "",
  },
  social: {
    links: [
      { platform: "LinkedIn", url: "" },
      { platform: "X", url: "" },
      { platform: "Facebook", url: "" },
      { platform: "Instagram", url: "" },
    ],
  },
  design: {
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    fontFamily: "Arial, sans-serif",
    fontSize: "14",
    logoShape: "square",
    logoSize: 80,
    avatarShape: "circle",
    socialIconStyle: "filled",
    socialIconColor: "#2563eb",
    separator: " | ",
  },
  addons: {
    bannerUrl: "",
    bannerLink: "",
    badges: [],
    links: [],
    quote: "",
    meetingUrl: "",
    mobileAppIos: "",
    mobileAppAndroid: "",
  },
};

export const FONT_OPTIONS = [
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "Times New Roman, serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "Trebuchet MS, sans-serif" },
];

export const SOCIAL_PLATFORMS = [
  "LinkedIn",
  "X",
  "Twitter",
  "Facebook",
  "Instagram",
  "YouTube",
  "GitHub",
  "Threads",
  "TikTok",
];
