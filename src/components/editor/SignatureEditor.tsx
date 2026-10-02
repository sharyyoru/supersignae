"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  DEFAULT_SIGNATURE_DATA,
  FONT_OPTIONS,
  SOCIAL_PLATFORMS,
  type SignatureData,
} from "@/types/signature";
import { renderSignatureHtml } from "@/lib/signature-renderer";
import {
  Plus,
  Trash2,
  ImageIcon,
  Eye,
  Save,
  Monitor,
  Smartphone,
  Palette,
  User,
  Briefcase,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LAYOUTS = [
  { id: "classic-horizontal", name: "Classic Horizontal", showLogo: true },
  { id: "minimal-vertical", name: "Minimal Vertical", showLogo: false },
  { id: "brand-horizontal", name: "Brand Horizontal", showLogo: true },
  { id: "compact", name: "Compact", showLogo: false },
];

interface Props {
  initialName?: string;
  initialData?: SignatureData;
  initialLayoutId?: string;
  onSave: (payload: { name: string; data: SignatureData; layoutId: string }) => Promise<void> | void;
  saving?: boolean;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SignatureEditor({ initialName = "", initialData, initialLayoutId, onSave, saving }: Props) {
  const [name, setName] = useState(initialName);
  const [layoutId, setLayoutId] = useState(initialLayoutId || LAYOUTS[0].id);
  const [data, setData] = useState<SignatureData>(() => initialData || DEFAULT_SIGNATURE_DATA);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const html = useMemo(() => renderSignatureHtml(data, layoutId), [data, layoutId]);

  const updateDetails = (patch: Partial<SignatureData["details"]>) => {
    setData((prev) => ({ ...prev, details: { ...prev.details, ...patch } }));
  };

  const updateDesign = (patch: Partial<SignatureData["design"]>) => {
    setData((prev) => ({ ...prev, design: { ...prev.design, ...patch } }));
  };

  const updateAddons = (patch: Partial<SignatureData["addons"]>) => {
    setData((prev) => ({ ...prev, addons: { ...prev.addons, ...patch } }));
  };

  const setSocialLink = (index: number, patch: Partial<SignatureData["social"]["links"][number]>) => {
    setData((prev) => {
      const links = [...prev.social.links];
      links[index] = { ...links[index], ...patch };
      return { ...prev, social: { links } };
    });
  };

  const addSocialLink = () => setData((prev) => ({ ...prev, social: { links: [...prev.social.links, { platform: "LinkedIn", url: "" }] } }));
  const removeSocialLink = (index: number) =>
    setData((prev) => ({ ...prev, social: { links: prev.social.links.filter((_, i) => i !== index) } }));

  const addBadge = () => updateAddons({ badges: [...data.addons.badges, { imageUrl: "", linkUrl: "", alt: "" }] });
  const updateBadge = (index: number, patch: Partial<SignatureData["addons"]["badges"][number]>) => {
    const badges = [...data.addons.badges];
    badges[index] = { ...badges[index], ...patch };
    updateAddons({ badges });
  };
  const removeBadge = (index: number) => updateAddons({ badges: data.addons.badges.filter((_, i) => i !== index) });

  const addLink = () => updateAddons({ links: [...data.addons.links, { label: "", url: "" }] });
  const updateLink = (index: number, patch: Partial<SignatureData["addons"]["links"][number]>) => {
    const links = [...data.addons.links];
    links[index] = { ...links[index], ...patch };
    updateAddons({ links });
  };
  const removeLink = (index: number) => updateAddons({ links: data.addons.links.filter((_, i) => i !== index) });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "avatarUrl" | "bannerUrl", index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    if (field === "bannerUrl") updateAddons({ bannerUrl: url });
    else if (index !== undefined && field === "logoUrl") updateBadge(index, { imageUrl: url });
    else updateDetails({ [field]: url });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ name: name || "Untitled Signature", data, layoutId });
  };

  return (
    <form id="signature-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1 space-y-2">
          <Label htmlFor="sig-name">Signature name</Label>
          <Input id="sig-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Sales Team Default" required />
        </div>
        <div className="flex flex-wrap gap-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => setLayoutId(layout.id)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm transition hover:bg-accent",
                layoutId === layout.id && "border-primary bg-primary/10 text-primary"
              )}
            >
              {layout.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details"><User className="mr-1 h-4 w-4" /> Details</TabsTrigger>
              <TabsTrigger value="social"><Mail className="mr-1 h-4 w-4" /> Social</TabsTrigger>
              <TabsTrigger value="design"><Palette className="mr-1 h-4 w-4" /> Design</TabsTrigger>
              <TabsTrigger value="addons"><Briefcase className="mr-1 h-4 w-4" /> Add-ons</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 p-1 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full name" value={data.details.fullName} onChange={(v) => updateDetails({ fullName: v })} />
                <Field label="Job title" value={data.details.jobTitle} onChange={(v) => updateDetails({ jobTitle: v })} />
                <Field label="Company" value={data.details.company} onChange={(v) => updateDetails({ company: v })} />
                <Field label="Email" type="email" value={data.details.email} onChange={(v) => updateDetails({ email: v })} />
                <Field label="Phone" value={data.details.phone} onChange={(v) => updateDetails({ phone: v })} />
                <Field label="Mobile" value={data.details.mobile} onChange={(v) => updateDetails({ mobile: v })} />
                <Field label="Fax" value={data.details.fax} onChange={(v) => updateDetails({ fax: v })} />
                <Field label="Website" value={data.details.website} onChange={(v) => updateDetails({ website: v })} />
              </div>
              <Field label="Address" value={data.details.address} onChange={(v) => updateDetails({ address: v })} />
              <ImageField label="Logo" url={data.details.logoUrl} onUpload={(e) => handleImageUpload(e, "logoUrl")} onClear={() => updateDetails({ logoUrl: "" })} />
              <ImageField label="Avatar" url={data.details.avatarUrl} onUpload={(e) => handleImageUpload(e, "avatarUrl")} onClear={() => updateDetails({ avatarUrl: "" })} />
              <div>
                <Label htmlFor="disclaimer">Disclaimer / Legal note</Label>
                <Textarea id="disclaimer" value={data.details.disclaimer} onChange={(e) => updateDetails({ disclaimer: e.target.value })} rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4 p-1 pt-4">
              {data.social.links.map((link, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Select value={link.platform} onValueChange={(v) => setSocialLink(i, { platform: v ?? "" })}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input value={link.url} onChange={(e) => setSocialLink(i, { url: e.target.value })} placeholder="https://" className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSocialLink} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add social profile
              </Button>
            </TabsContent>

            <TabsContent value="design" className="space-y-4 p-1 pt-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ColorField label="Primary color" value={data.design.primaryColor} onChange={(v) => updateDesign({ primaryColor: v })} />
                <ColorField label="Secondary color" value={data.design.secondaryColor} onChange={(v) => updateDesign({ secondaryColor: v })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Font family</Label>
                  <Select value={data.design.fontFamily} onValueChange={(v) => updateDesign({ fontFamily: v ?? data.design.fontFamily })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Font size (px)</Label>
                  <Input type="number" value={data.design.fontSize} onChange={(e) => updateDesign({ fontSize: e.target.value })} />
                </div>
              </div>
              <ShapeSelect label="Logo shape" value={data.design.logoShape} onChange={(v) => updateDesign({ logoShape: v })} />
              <ShapeSelect label="Avatar shape" value={data.design.avatarShape} onChange={(v) => updateDesign({ avatarShape: v })} />
              <div>
                <Label>Logo size (px)</Label>
                <Input type="range" min={40} max={160} value={data.design.logoSize} onChange={(e) => updateDesign({ logoSize: Number(e.target.value) })} />
                <p className="text-xs text-muted-foreground">{data.design.logoSize}px</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>Social icon style</Label>
                  <Select value={data.design.socialIconStyle} onValueChange={(v: string | null) => updateDesign({ socialIconStyle: (v ?? data.design.socialIconStyle) as "outline" | "filled" | "monochrome" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filled">Filled</SelectItem>
                      <SelectItem value="outline">Outline</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <ColorField label="Social icon color" value={data.design.socialIconColor} onChange={(v) => updateDesign({ socialIconColor: v })} />
              </div>
              <div>
                <Label>Contact separator</Label>
                <Select value={data.design.separator} onValueChange={(v: string | null) => updateDesign({ separator: (v ?? data.design.separator) as " | " | "  " | " • " | " - " })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" | ">Pipe</SelectItem>
                    <SelectItem value="  ">Space</SelectItem>
                    <SelectItem value=" • ">Bullet</SelectItem>
                    <SelectItem value=" - ">Dash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="addons" className="space-y-4 p-1 pt-4">
              <div className="space-y-2">
                <Label>Banner image</Label>
                <ImageField label="" url={data.addons.bannerUrl} onUpload={(e) => handleImageUpload(e, "bannerUrl")} onClear={() => updateAddons({ bannerUrl: "" })} />
                <Field label="Banner link" value={data.addons.bannerLink} onChange={(v) => updateAddons({ bannerLink: v })} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Badges / awards</Label>
                {data.addons.badges.map((badge, i) => (
                  <div key={i} className="rounded-md border p-3 space-y-2">
                    <ImageField label="Badge image" url={badge.imageUrl} onUpload={(e) => handleImageUpload(e, "logoUrl", i)} onClear={() => updateBadge(i, { imageUrl: "" })} />
                    <Field label="Link URL" value={badge.linkUrl} onChange={(v) => updateBadge(i, { linkUrl: v })} />
                    <Field label="Alt text" value={badge.alt} onChange={(v) => updateBadge(i, { alt: v })} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeBadge(i)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remove badge
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addBadge} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add badge</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Custom links</Label>
                {data.addons.links.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={link.label} onChange={(e) => updateLink(i, { label: e.target.value })} placeholder="Label" className="flex-1" />
                    <Input value={link.url} onChange={(e) => updateLink(i, { url: e.target.value })} placeholder="https://" className="flex-[2]" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addLink} className="w-full"><Plus className="mr-2 h-4 w-4" /> Add link</Button>
              </div>
              <Field label="Quote" value={data.addons.quote} onChange={(v) => updateAddons({ quote: v })} />
              <Field label="Meeting scheduler URL" value={data.addons.meetingUrl} onChange={(v) => updateAddons({ meetingUrl: v })} />
              <Field label="iOS app link" value={data.addons.mobileAppIos} onChange={(v) => updateAddons({ mobileAppIos: v })} />
              <Field label="Android app link" value={data.addons.mobileAppAndroid} onChange={(v) => updateAddons({ mobileAppAndroid: v })} />
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Live preview</h3>
            <div className="flex items-center gap-2 rounded-md border p-1">
              <Button type="button" variant={previewMode === "desktop" ? "default" : "ghost"} size="sm" onClick={() => setPreviewMode("desktop")}>
                <Monitor className="mr-1 h-4 w-4" /> Desktop
              </Button>
              <Button type="button" variant={previewMode === "mobile" ? "default" : "ghost"} size="sm" onClick={() => setPreviewMode("mobile")}>
                <Smartphone className="mr-1 h-4 w-4" /> Mobile
              </Button>
            </div>
          </div>
          <Card className={cn("overflow-hidden", previewMode === "mobile" ? "max-w-sm mx-auto" : "")}>
            <CardContent className="p-0">
              <div
                className="min-h-[300px] w-full bg-white p-6 dark:bg-zinc-950"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save signature"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-9 rounded border" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

function ShapeSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: "square" | "rounded" | "circle") => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange((v ?? "square") as "square" | "rounded" | "circle")}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="square">Square</SelectItem>
          <SelectItem value="rounded">Rounded</SelectItem>
          <SelectItem value="circle">Circle</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function ImageField({ label, url, onUpload, onClear }: { label: string; url: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; onClear: () => void }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        {url ? (
          <>
            <img src={url} alt="preview" className="h-12 w-12 rounded border object-contain" />
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>Remove</Button>
          </>
        ) : (
          <Label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
            <ImageIcon className="h-4 w-4" /> Upload image
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </Label>
        )}
      </div>
    </div>
  );
}
