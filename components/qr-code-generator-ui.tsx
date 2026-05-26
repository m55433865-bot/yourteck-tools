"use client";

import QRCode from "qrcode";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type QrMode = "url" | "text" | "email" | "phone" | "wifi";
type WifiEncryption = "WPA" | "WEP" | "nopass";

type QrFormState = {
  mode: QrMode;
  url: string;
  text: string;
  emailAddress: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: WifiEncryption;
  wifiHidden: boolean;
};

const defaultFormState: QrFormState = {
  mode: "url",
  url: "https://tools.yourteck.com",
  text: "YourTeck Tools",
  emailAddress: "",
  emailSubject: "",
  emailBody: "",
  phone: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  wifiHidden: false,
};

const qrModes: Array<{ value: QrMode; label: string }> = [
  { value: "url", label: "URL" },
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "wifi", label: "WiFi" },
];

export function QrCodeGeneratorUi() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [form, setForm] = useState<QrFormState>(defaultFormState);
  const qrValue = useMemo(() => buildQrValue(form), [form]);
  const [renderErrorMessage, setRenderErrorMessage] = useState("");
  const errorMessage = !qrValue
    ? "Add content to generate a QR code."
    : renderErrorMessage;

  useEffect(() => {
    if (!qrValue) {
      return;
    }

    QRCode.toCanvas(canvasRef.current, qrValue, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(() => setRenderErrorMessage(""))
      .catch(() => {
        setRenderErrorMessage("Unable to generate this QR code. Try shorter content.");
      });
  }, [qrValue]);

  function updateForm<K extends keyof QrFormState>(key: K, value: QrFormState[K]) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function handleDownload() {
    const canvas = canvasRef.current;

    if (!canvas || !qrValue) {
      return;
    }

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `yourteck-${form.mode}-qr-code.png`;
    link.click();
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-5">
        <div>
          <label htmlFor="qr-mode" className="text-sm font-semibold text-slate-950">
            QR code type
          </label>
          <select
            id="qr-mode"
            value={form.mode}
            onChange={(event) => updateForm("mode", event.target.value as QrMode)}
            className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
          >
            {qrModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>

        {form.mode === "url" ? (
          <Field
            id="qr-url"
            label="Website URL"
            type="url"
            value={form.url}
            placeholder="https://example.com"
            onChange={(event) => updateForm("url", event.target.value)}
          />
        ) : null}

        {form.mode === "text" ? (
          <TextArea
            id="qr-text"
            label="Text"
            value={form.text}
            placeholder="Enter text to encode"
            onChange={(event) => updateForm("text", event.target.value)}
          />
        ) : null}

        {form.mode === "email" ? (
          <div className="grid gap-4">
            <Field
              id="qr-email-address"
              label="Email address"
              type="email"
              value={form.emailAddress}
              placeholder="name@example.com"
              onChange={(event) => updateForm("emailAddress", event.target.value)}
            />
            <Field
              id="qr-email-subject"
              label="Subject"
              value={form.emailSubject}
              placeholder="Optional subject"
              onChange={(event) => updateForm("emailSubject", event.target.value)}
            />
            <TextArea
              id="qr-email-body"
              label="Body"
              value={form.emailBody}
              placeholder="Optional email body"
              onChange={(event) => updateForm("emailBody", event.target.value)}
            />
          </div>
        ) : null}

        {form.mode === "phone" ? (
          <Field
            id="qr-phone"
            label="Phone number"
            type="tel"
            value={form.phone}
            placeholder="+15551234567"
            onChange={(event) => updateForm("phone", event.target.value)}
          />
        ) : null}

        {form.mode === "wifi" ? (
          <div className="grid gap-4">
            <Field
              id="qr-wifi-ssid"
              label="Network name"
              value={form.wifiSsid}
              placeholder="WiFi network name"
              onChange={(event) => updateForm("wifiSsid", event.target.value)}
            />
            <Field
              id="qr-wifi-password"
              label="Password"
              type="password"
              value={form.wifiPassword}
              placeholder="WiFi password"
              onChange={(event) => updateForm("wifiPassword", event.target.value)}
            />
            <div>
              <label
                htmlFor="qr-wifi-encryption"
                className="text-sm font-semibold text-slate-950"
              >
                Security
              </label>
              <select
                id="qr-wifi-encryption"
                value={form.wifiEncryption}
                onChange={(event) =>
                  updateForm("wifiEncryption", event.target.value as WifiEncryption)
                }
                className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.wifiHidden}
                onChange={(event) => updateForm("wifiHidden", event.target.checked)}
                className="size-4 accent-cyan-700"
              />
              Hidden network
            </label>
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex size-[280px] items-center justify-center rounded-lg border border-slate-200 bg-white p-3">
              <canvas ref={canvasRef} width={280} height={280} aria-label="QR code preview" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-950">Live preview</p>
              <p className="mt-1 text-sm text-slate-600">
                The QR code updates automatically while you type.
              </p>
            </div>
            {errorMessage ? (
              <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleDownload}
              disabled={!qrValue || Boolean(errorMessage)}
              className="h-12 w-full rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-950">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </div>
  );
}

function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-slate-950">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
      />
    </div>
  );
}

function buildQrValue(form: QrFormState) {
  if (form.mode === "url") {
    return form.url.trim();
  }

  if (form.mode === "text") {
    return form.text.trim();
  }

  if (form.mode === "email") {
    const address = form.emailAddress.trim();

    if (!address) {
      return "";
    }

    const params = new URLSearchParams();

    if (form.emailSubject.trim()) {
      params.set("subject", form.emailSubject.trim());
    }

    if (form.emailBody.trim()) {
      params.set("body", form.emailBody.trim());
    }

    const query = params.toString();

    return query ? `mailto:${address}?${query}` : `mailto:${address}`;
  }

  if (form.mode === "phone") {
    const phone = form.phone.trim();

    return phone ? `tel:${phone}` : "";
  }

  const ssid = escapeWifiValue(form.wifiSsid.trim());

  if (!ssid) {
    return "";
  }

  const password =
    form.wifiEncryption === "nopass" ? "" : escapeWifiValue(form.wifiPassword);

  return `WIFI:T:${form.wifiEncryption};S:${ssid};P:${password};H:${form.wifiHidden ? "true" : "false"};;`;
}

function escapeWifiValue(value: string) {
  return value.replace(/([\\;,":])/g, "\\$1");
}
