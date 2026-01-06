"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  Upload,
  Link2,
  FileText,
  Mail,
  MessageSquare,
  Wifi,
  User,
  Sun,
  Moon,
  Globe,
  Copy,
} from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/lib/i18n"

type QRType = "url" | "text" | "email" | "sms" | "wifi" | "vcard"

export default function QRCodeGenerator() {
  const { locale, setLocale, t } = useLanguage()

  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") as "light" | "dark") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const [qrType, setQRType] = useState<QRType>("url")
  const [qrData, setQRData] = useState("https://ahoikapptn.com")
  const [color, setColor] = useState("#6366f1")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [size, setSize] = useState(256)
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M")
  const [cornerStyle, setCornerStyle] = useState<"square" | "rounded">("square")
  const [logo, setLogo] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(20)

  const [urlValue, setUrlValue] = useState("https://ahoikapptn.com")
  const [textValue, setTextValue] = useState("")
  const [email, setEmail] = useState({ address: "", subject: "", body: "" })
  const [sms, setSms] = useState({ phone: "", message: "" })
  const [wifi, setWifi] = useState({ ssid: "", password: "", encryption: "WPA" })
  const [vcard, setVcard] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    organization: "",
    url: "",
  })

  const qrRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateQRData = (): string => {
    switch (qrType) {
      case "url":
        return urlValue
      case "text":
        return textValue
      case "email":
        return `mailto:${email.address}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
      case "sms":
        return `sms:${sms.phone}?body=${encodeURIComponent(sms.message)}`
      case "wifi":
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
FN:${vcard.firstName} ${vcard.lastName}
N:${vcard.lastName};${vcard.firstName};;;
TEL:${vcard.phone}
EMAIL:${vcard.email}
ORG:${vcard.organization}
URL:${vcard.url}
END:VCARD`
      default:
        return urlValue
    }
  }

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault()
    setQRData(generateQRData())
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogo(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const downloadQRCode = async () => {
    try {
      const QRCode = (await import("qrcode")).default

      const canvas = document.createElement("canvas")
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      await QRCode.toCanvas(canvas, generateQRData(), {
        width: size,
        margin: 1,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection as any,
      })

      if (cornerStyle === "rounded") {
        const tempCanvas = document.createElement("canvas")
        tempCanvas.width = size
        tempCanvas.height = size
        const tempCtx = tempCanvas.getContext("2d")
        if (!tempCtx) return

        const radius = 20
        tempCtx.beginPath()
        tempCtx.moveTo(radius, 0)
        tempCtx.lineTo(size - radius, 0)
        tempCtx.quadraticCurveTo(size, 0, size, radius)
        tempCtx.lineTo(size, size - radius)
        tempCtx.quadraticCurveTo(size, size, size - radius, size)
        tempCtx.lineTo(radius, size)
        tempCtx.quadraticCurveTo(0, size, 0, size - radius)
        tempCtx.lineTo(0, radius)
        tempCtx.quadraticCurveTo(0, 0, radius, 0)
        tempCtx.closePath()
        tempCtx.clip()

        tempCtx.drawImage(canvas, 0, 0)

        ctx.clearRect(0, 0, size, size)
        ctx.drawImage(tempCanvas, 0, 0)
      }

      if (logo) {
        await new Promise<void>((resolve, reject) => {
          const logoImg = new Image()

          logoImg.onload = () => {
            try {
              const actualLogoSize = size * (logoSize / 100)
              const logoX = (size - actualLogoSize) / 2
              const logoY = (size - actualLogoSize) / 2
              const padding = 10

              ctx.fillStyle = "white"
              ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
              ctx.shadowBlur = 8
              ctx.fillRect(logoX - padding, logoY - padding, actualLogoSize + padding * 2, actualLogoSize + padding * 2)

              ctx.shadowColor = "transparent"
              ctx.shadowBlur = 0

              ctx.drawImage(logoImg, logoX, logoY, actualLogoSize, actualLogoSize)
              resolve()
            } catch (err) {
              reject(err)
            }
          }

          logoImg.onerror = (err) => {
            reject(new Error("Unable to load logo"))
          }

          if (!logo.startsWith("blob:") && !logo.startsWith("data:")) {
            logoImg.crossOrigin = "anonymous"
          }

          logoImg.src = logo
        })
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Unable to create PNG image")
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `qrcode-${qrType}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, "image/png")
    } catch (error) {
      alert(t.errors.downloadError)
    }
  }

  const downloadQRCodeSVG = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const clonedSvg = svg.cloneNode(true) as SVGElement

    if (cornerStyle === "rounded") {
      clonedSvg.setAttribute("style", "border-radius: 16px; overflow: hidden;")
    }

    if (logo) {
      const actualLogoSize = size * (logoSize / 100)
      const logoX = (size - actualLogoSize) / 2
      const logoY = (size - actualLogoSize) / 2

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", String(logoX - 5))
      rect.setAttribute("y", String(logoY - 5))
      rect.setAttribute("width", String(actualLogoSize + 10))
      rect.setAttribute("height", String(actualLogoSize + 10))
      rect.setAttribute("fill", "white")
      clonedSvg.appendChild(rect)

      const image = document.createElementNS("http://www.w3.org/2000/svg", "image")
      image.setAttribute("x", String(logoX))
      image.setAttribute("y", String(logoY))
      image.setAttribute("width", String(actualLogoSize))
      image.setAttribute("height", String(actualLogoSize))
      image.setAttribute("href", logo)
      clonedSvg.appendChild(image)
    }

    const svgData = new XMLSerializer().serializeToString(clonedSvg)
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `qrcode-${qrType}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyQRCodeToClipboard = async () => {
    try {
      console.log("[v0] Starting clipboard copy...")
      const QRCode = (await import("qrcode")).default

      const canvasSize = Math.min(size, 2048)
      const canvas = document.createElement("canvas")
      canvas.width = canvasSize
      canvas.height = canvasSize
      const ctx = canvas.getContext("2d", { willReadFrequently: true })
      if (!ctx) {
        console.error("[v0] Failed to get canvas context")
        return
      }

      console.log("[v0] Generating QR code on canvas...")
      await QRCode.toCanvas(canvas, generateQRData(), {
        width: canvasSize,
        margin: 1,
        color: {
          dark: color,
          light: backgroundColor,
        },
        errorCorrectionLevel: errorCorrection as any,
      })

      if (cornerStyle === "rounded") {
        console.log("[v0] Applying rounded corners...")
        const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize)
        ctx.clearRect(0, 0, canvasSize, canvasSize)

        const radius = Math.floor(canvasSize * 0.05)
        ctx.beginPath()
        ctx.moveTo(radius, 0)
        ctx.lineTo(canvasSize - radius, 0)
        ctx.quadraticCurveTo(canvasSize, 0, canvasSize, radius)
        ctx.lineTo(canvasSize, canvasSize - radius)
        ctx.quadraticCurveTo(canvasSize, canvasSize, canvasSize - radius, canvasSize)
        ctx.lineTo(radius, canvasSize)
        ctx.quadraticCurveTo(0, canvasSize, 0, canvasSize - radius)
        ctx.lineTo(0, radius)
        ctx.quadraticCurveTo(0, 0, radius, 0)
        ctx.closePath()
        ctx.clip()

        ctx.putImageData(imageData, 0, 0)
      }

      if (logo) {
        console.log("[v0] Adding logo...")
        await new Promise<void>((resolve, reject) => {
          const logoImg = new Image()

          logoImg.onload = () => {
            try {
              const actualLogoSize = canvasSize * (logoSize / 100)
              const logoX = (canvasSize - actualLogoSize) / 2
              const logoY = (canvasSize - actualLogoSize) / 2
              const padding = Math.floor(actualLogoSize * 0.1)

              ctx.fillStyle = "white"
              ctx.shadowColor = "rgba(0, 0, 0, 0.3)"
              ctx.shadowBlur = 8
              ctx.fillRect(logoX - padding, logoY - padding, actualLogoSize + padding * 2, actualLogoSize + padding * 2)

              ctx.shadowColor = "transparent"
              ctx.shadowBlur = 0

              ctx.drawImage(logoImg, logoX, logoY, actualLogoSize, actualLogoSize)
              console.log("[v0] Logo added successfully")
              resolve()
            } catch (err) {
              console.error("[v0] Logo drawing error:", err)
              reject(err)
            }
          }

          logoImg.onerror = () => {
            console.error("[v0] Logo loading error")
            reject(new Error("Unable to load logo"))
          }

          if (!logo.startsWith("blob:") && !logo.startsWith("data:")) {
            logoImg.crossOrigin = "anonymous"
          }

          logoImg.src = logo
        })
      }

      console.log("[v0] Creating blob...")
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0)
      })

      if (!blob) {
        console.error("[v0] Failed to create blob")
        throw new Error("Unable to create PNG image")
      }

      console.log("[v0] Blob created, size:", blob.size, "bytes")

      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          console.log("[v0] Attempting modern Clipboard API...")
          const clipboardItem = new ClipboardItem({
            "image/png": blob,
          })
          await navigator.clipboard.write([clipboardItem])
          console.log("[v0] Successfully copied via Clipboard API!")
          alert(t.messages.copiedToClipboard)
          return
        }
      } catch (clipError) {
        console.error("[v0] Clipboard API failed:", clipError)
      }

      // Fallback: Try execCommand approach
      try {
        console.log("[v0] Trying execCommand fallback...")
        const img = new Image()
        img.src = canvas.toDataURL("image/png")

        const div = document.createElement("div")
        div.contentEditable = "true"
        div.appendChild(img)
        document.body.appendChild(div)

        const range = document.createRange()
        range.selectNodeContents(div)
        const selection = window.getSelection()
        if (selection) {
          selection.removeAllRanges()
          selection.addRange(range)

          const success = document.execCommand("copy")
          console.log("[v0] execCommand result:", success)

          document.body.removeChild(div)

          if (success) {
            alert(t.messages.copiedToClipboard)
            return
          }
        }
      } catch (execError) {
        console.error("[v0] execCommand failed:", execError)
      }

      // If all methods fail
      console.error("[v0] All clipboard methods failed")
      alert(
        t.messages.clipboardNotSupported ||
          "Impossible de copier dans le presse-papiers. Utilisez le bouton Télécharger PNG à la place.",
      )
    } catch (error) {
      console.error("[v0] Copy error:", error)
      alert(t.messages.clipboardError || "Erreur lors de la copie. Utilisez le bouton Télécharger PNG à la place.")
    }
  }

  const tabIcons = {
    url: <Link2 className="w-4 h-4" />,
    text: <FileText className="w-4 h-4" />,
    email: <Mail className="w-4 h-4" />,
    sms: <MessageSquare className="w-4 h-4" />,
    wifi: <Wifi className="w-4 h-4" />,
    vcard: <User className="w-4 h-4" />,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/qr-logo.png" alt={t.aria.logo} width={48} height={48} className="object-cover" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-5xl">
                {t.appName}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
                aria-label={t.aria.toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </button>

              <Select value={locale} onValueChange={(value) => setLocale(value as "fr" | "en" | "es")}>
                <SelectTrigger className="w-[160px] bg-card border-border">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/french-flag.png"
                        alt="Français"
                        width={20}
                        height={15}
                        className="rounded border border-border"
                      />
                      <span>{t.languages?.fr || "Français"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="en">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/uk-flag.png"
                        alt="English"
                        width={20}
                        height={15}
                        className="rounded border border-border"
                      />
                      <span>{t.languages?.en || "English"}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="es">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/spanish-flag.jpg"
                        alt="Espanol"
                        width={20}
                        height={15}
                        className="rounded border border-border"
                      />
                      <span>{t.languages?.es || "Espanol"}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-44 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary to-secondary p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader className="border-b bg-muted/50 py-2">
                    <CardTitle className="text-2xl font-bold text-foreground text-center">{t.configuration}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleGenerate} className="space-y-6">
                      <div>
                        <Label className="text-base font-semibold text-foreground mb-3 block">{t.contentType}</Label>
                        <Tabs value={qrType} onValueChange={(value) => setQRType(value as QRType)} className="w-full">
                          <TabsList className="grid grid-cols-3 gap-2 bg-muted p-1 h-auto">
                            <TabsTrigger
                              value="url"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.url}
                              <span className="hidden sm:inline">{t.tabs.url}</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="text"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.text}
                              <span className="hidden sm:inline">{t.tabs.text}</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="email"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.email}
                              <span className="hidden sm:inline">{t.tabs.email}</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="sms"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.sms}
                              <span className="hidden sm:inline">{t.tabs.sms}</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="wifi"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.wifi}
                              <span className="hidden sm:inline">{t.tabs.wifi}</span>
                            </TabsTrigger>
                            <TabsTrigger
                              value="vcard"
                              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                            >
                              {tabIcons.vcard}
                              <span className="hidden sm:inline">{t.tabs.vcard}</span>
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="url" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="url" className="text-foreground">
                                {t.fields.url}
                              </Label>
                              <Input
                                id="url"
                                type="url"
                                placeholder={t.fields.urlPlaceholder}
                                value={urlValue}
                                onChange={(e) => setUrlValue(e.target.value)}
                                required
                                className="mt-2"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="text" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="text" className="text-foreground">
                                {t.fields.text}
                              </Label>
                              <Textarea
                                id="text"
                                placeholder={t.fields.textPlaceholder}
                                value={textValue}
                                onChange={(e) => setTextValue(e.target.value)}
                                required
                                rows={4}
                                className="mt-2"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="email" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="emailAddress" className="text-foreground">
                                {t.fields.emailAddress}
                              </Label>
                              <Input
                                id="emailAddress"
                                type="email"
                                placeholder={t.fields.emailAddressPlaceholder}
                                value={email.address}
                                onChange={(e) => setEmail({ ...email, address: e.target.value })}
                                required
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="emailSubject" className="text-foreground">
                                {t.fields.emailSubject}
                              </Label>
                              <Input
                                id="emailSubject"
                                placeholder={t.fields.emailSubjectPlaceholder}
                                value={email.subject}
                                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="emailBody" className="text-foreground">
                                {t.fields.emailBody}
                              </Label>
                              <Textarea
                                id="emailBody"
                                placeholder={t.fields.emailBodyPlaceholder}
                                value={email.body}
                                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                                rows={3}
                                className="mt-2"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="sms" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="smsPhone" className="text-foreground">
                                {t.fields.smsPhone}
                              </Label>
                              <Input
                                id="smsPhone"
                                type="tel"
                                placeholder={t.fields.smsPhonePlaceholder}
                                value={sms.phone}
                                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                                required
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="smsMessage" className="text-foreground">
                                {t.fields.smsMessage}
                              </Label>
                              <Textarea
                                id="smsMessage"
                                placeholder={t.fields.smsMessagePlaceholder}
                                value={sms.message}
                                onChange={(e) => setSms({ ...sms, message: e.target.value })}
                                rows={3}
                                className="mt-2"
                              />
                            </div>
                          </TabsContent>

                          <TabsContent value="wifi" className="space-y-4 mt-4">
                            <div>
                              <Label htmlFor="wifiSsid" className="text-foreground">
                                {t.fields.wifiSsid}
                              </Label>
                              <Input
                                id="wifiSsid"
                                placeholder={t.fields.wifiSsidPlaceholder}
                                value={wifi.ssid}
                                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                                required
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="wifiPassword" className="text-foreground">
                                {t.fields.wifiPassword}
                              </Label>
                              <Input
                                id="wifiPassword"
                                type="password"
                                placeholder={t.fields.wifiPasswordPlaceholder}
                                value={wifi.password}
                                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="wifiEncryption" className="text-foreground">
                                {t.fields.wifiEncryption}
                              </Label>
                              <Select
                                value={wifi.encryption}
                                onValueChange={(value) => setWifi({ ...wifi, encryption: value })}
                              >
                                <SelectTrigger id="wifiEncryption" className="mt-2">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="WPA">{t.fields.wifiEncryptionWPA}</SelectItem>
                                  <SelectItem value="WEP">{t.fields.wifiEncryptionWEP}</SelectItem>
                                  <SelectItem value="nopass">{t.fields.wifiEncryptionNone}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TabsContent>

                          <TabsContent value="vcard" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="vcardFirstName" className="text-foreground">
                                  {t.fields.vcardFirstName}
                                </Label>
                                <Input
                                  id="vcardFirstName"
                                  placeholder={t.fields.vcardFirstNamePlaceholder}
                                  value={vcard.firstName}
                                  onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                                  required
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="vcardLastName" className="text-foreground">
                                  {t.fields.vcardLastName}
                                </Label>
                                <Input
                                  id="vcardLastName"
                                  placeholder={t.fields.vcardLastNamePlaceholder}
                                  value={vcard.lastName}
                                  onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                                  required
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="vcardPhone" className="text-foreground">
                                {t.fields.vcardPhone}
                              </Label>
                              <Input
                                id="vcardPhone"
                                type="tel"
                                placeholder={t.fields.vcardPhonePlaceholder}
                                value={vcard.phone}
                                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="vcardEmail" className="text-foreground">
                                {t.fields.vcardEmail}
                              </Label>
                              <Input
                                id="vcardEmail"
                                type="email"
                                placeholder={t.fields.vcardEmailPlaceholder}
                                value={vcard.email}
                                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="vcardOrganization" className="text-foreground">
                                {t.fields.vcardOrganization}
                              </Label>
                              <Input
                                id="vcardOrganization"
                                placeholder={t.fields.vcardOrganizationPlaceholder}
                                value={vcard.organization}
                                onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="vcardUrl" className="text-foreground">
                                {t.fields.vcardUrl}
                              </Label>
                              <Input
                                id="vcardUrl"
                                type="url"
                                placeholder={t.fields.vcardUrlPlaceholder}
                                value={vcard.url}
                                onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
                                className="mt-2"
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                        size="lg"
                      >
                        {t.buttons.generate}
                      </Button>
                    </form>
                  </CardContent>
                </div>
              </Card>

              <Card className="shadow-2xl border-0 bg-gradient-to-br from-secondary to-accent p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader className="border-b bg-muted/50 py-2">
                    <CardTitle className="text-2xl font-bold text-foreground text-center">{t.customization}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <Tabs defaultValue="colors" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="colors">{t.customizationTabs.colors}</TabsTrigger>
                        <TabsTrigger value="style">{t.customizationTabs.style}</TabsTrigger>
                        <TabsTrigger value="logo">{t.customizationTabs.logo}</TabsTrigger>
                        <TabsTrigger value="error">{t.customizationTabs.error}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="colors" className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="color" className="text-foreground font-semibold">
                              {t.customizationFields.qrColor}
                            </Label>
                            <div className="flex gap-2 items-center mt-2">
                              <Input
                                id="color"
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-16 h-12 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="backgroundColor" className="text-foreground font-semibold">
                              {t.customizationFields.backgroundColor}
                            </Label>
                            <div className="flex gap-2 items-center mt-2">
                              <Input
                                id="backgroundColor"
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="w-16 h-12 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                className="flex-1 font-mono text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="style" className="space-y-6">
                        <div>
                          <Label htmlFor="cornerStyle" className="text-foreground font-semibold">
                            {t.customizationFields.cornerStyle}
                          </Label>
                          <Select
                            value={cornerStyle}
                            onValueChange={(value) => setCornerStyle(value as "square" | "rounded")}
                          >
                            <SelectTrigger id="cornerStyle" className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="square">{t.customizationFields.cornerStyleSquare}</SelectItem>
                              <SelectItem value="rounded">{t.customizationFields.cornerStyleRounded}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="size" className="text-foreground font-semibold">
                            {t.customizationFields.size}: {size}x{size}px
                          </Label>
                          <Slider
                            id="size"
                            min={128}
                            max={512}
                            step={16}
                            value={[size]}
                            onValueChange={(value) => setSize(value[0])}
                            className="w-full mt-3"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="logo" className="space-y-6">
                        <div>
                          <Label htmlFor="logo" className="text-foreground font-semibold">
                            {t.customizationFields.logo}
                          </Label>
                          <div className="flex gap-2 mt-3">
                            <Input
                              ref={fileInputRef}
                              id="logo"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {logo ? t.buttons.change : t.buttons.add}
                            </Button>
                            {logo && (
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => setLogo(null)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {t.buttons.remove}
                              </Button>
                            )}
                          </div>
                          {logo && (
                            <div className="mt-4">
                              <Label htmlFor="logoSize" className="text-foreground font-semibold">
                                {t.customizationFields.logoSize}: {logoSize}%
                              </Label>
                              <Slider
                                id="logoSize"
                                min={10}
                                max={40}
                                step={1}
                                value={[logoSize]}
                                onValueChange={(value) => setLogoSize(value[0])}
                                className="w-full mt-3"
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="error" className="space-y-6">
                        <div>
                          <Label htmlFor="errorCorrection" className="text-foreground font-semibold">
                            {t.customizationFields.errorCorrection}
                          </Label>
                          <Select
                            value={errorCorrection}
                            onValueChange={(value) => setErrorCorrection(value as "L" | "M" | "Q" | "H")}
                          >
                            <SelectTrigger id="errorCorrection" className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="L">{t.customizationFields.errorCorrectionL}</SelectItem>
                              <SelectItem value="M">{t.customizationFields.errorCorrectionM}</SelectItem>
                              <SelectItem value="Q">{t.customizationFields.errorCorrectionQ}</SelectItem>
                              <SelectItem value="H">{t.customizationFields.errorCorrectionH}</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground mt-2">
                            {t.customizationFields.errorCorrectionDescription}
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary to-secondary p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader className="border-b bg-muted/50 py-2">
                    <CardTitle className="text-2xl font-bold text-foreground text-center">{t.preview}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    {qrData && (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div
                            ref={qrRef}
                            className="p-6 bg-muted shadow-lg"
                            style={{
                              borderRadius: cornerStyle === "rounded" ? "24px" : "12px",
                              transition: "border-radius 0.3s ease",
                            }}
                          >
                            <div
                              style={{
                                borderRadius: cornerStyle === "rounded" ? "16px" : "0px",
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              <QRCodeSVG value={qrData} size={size} fgColor={color} bgColor={backgroundColor} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={downloadQRCode} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            {t.buttons.downloadPNG}
                          </Button>
                          <Button onClick={downloadQRCodeSVG} variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            {t.buttons.downloadSVG}
                          </Button>
                          <Button onClick={copyQRCodeToClipboard} variant="outline">
                            <Copy className="w-4 h-4 mr-2" />
                            {t.buttons.copyToClipboard}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
