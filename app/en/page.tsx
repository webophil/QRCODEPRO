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
import { Download, Upload, Link2, FileText, Mail, MessageSquare, Wifi, User, Sun, Moon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type QRType = "url" | "text" | "email" | "sms" | "wifi" | "vcard"

export default function QRCodeGeneratorEN() {
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

  const downloadQRCode = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector("svg")
    if (!svg) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size

      if (cornerStyle === "rounded") {
        ctx.save()
        ctx.beginPath()
        const radius = 16
        ctx.moveTo(radius, 0)
        ctx.lineTo(size - radius, 0)
        ctx.quadraticCurveTo(size, 0, size, radius)
        ctx.lineTo(size, size - radius)
        ctx.quadraticCurveTo(size, size, size - radius, size)
        ctx.lineTo(radius, size)
        ctx.quadraticCurveTo(0, size, 0, size - radius)
        ctx.lineTo(0, radius)
        ctx.quadraticCurveTo(0, 0, radius, 0)
        ctx.closePath()
        ctx.clip()
      }

      ctx.drawImage(img, 0, 0)

      if (logo) {
        const logoImg = new Image()
        logoImg.onload = () => {
          const actualLogoSize = size * (logoSize / 100)
          const logoX = (size - actualLogoSize) / 2
          const logoY = (size - actualLogoSize) / 2

          ctx.fillStyle = "white"
          ctx.fillRect(logoX - 5, logoY - 5, actualLogoSize + 10, actualLogoSize + 10)

          ctx.drawImage(logoImg, logoX, logoY, actualLogoSize, actualLogoSize)

          if (cornerStyle === "rounded") {
            ctx.restore()
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `qrcode-${qrType}.png`
              a.click()
              URL.revokeObjectURL(url)
            }
          })
        }
        logoImg.src = logo
      } else {
        if (cornerStyle === "rounded") {
          ctx.restore()
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `qrcode-${qrType}.png`
            a.click()
            URL.revokeObjectURL(url)
          }
        })
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted pt-44 pb-12 px-4">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Logo on the left */}
            <Link href="/en" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-md">
                <Image src="/images/qr-logo.png" alt="QR Pro Logo" width={48} height={48} className="object-cover" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-5xl">
                QR Pro
              </span>
            </Link>

            {/* Theme toggle and language flags on the right */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-primary" />
                ) : (
                  <Moon className="w-5 h-5 text-primary" />
                )}
              </button>

              <Link href="/" className="hover:opacity-70 transition-opacity">
                <Image
                  src="/french-flag.png"
                  alt="Français"
                  width={32}
                  height={24}
                  className="rounded border border-border"
                />
              </Link>

              <Link href="/en" className="hover:opacity-70 transition-opacity">
                <Image
                  src="/uk-flag.png"
                  alt="English"
                  width={32}
                  height={24}
                  className="rounded border border-border"
                />
              </Link>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              QR Code Generator
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Custom QR codes for all your professional and personal needs
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary to-secondary p-1">
              <div className="bg-card rounded-lg">
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle className="text-2xl font-bold text-foreground text-center">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleGenerate} className="space-y-6">
                    <div>
                      <Label className="text-base font-semibold text-foreground mb-3 block">Content Type</Label>
                      <Tabs value={qrType} onValueChange={(value) => setQRType(value as QRType)} className="w-full">
                        <TabsList className="grid grid-cols-3 gap-2 bg-muted p-1 h-auto">
                          <TabsTrigger
                            value="url"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.url}
                            <span className="hidden sm:inline">URL</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="text"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.text}
                            <span className="hidden sm:inline">Text</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="email"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.email}
                            <span className="hidden sm:inline">Email</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="sms"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.sms}
                            <span className="hidden sm:inline">SMS</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="wifi"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.wifi}
                            <span className="hidden sm:inline">Wi-Fi</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="vcard"
                            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          >
                            {tabIcons.vcard}
                            <span className="hidden sm:inline">vCard</span>
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="url" className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="url" className="text-foreground">
                              URL
                            </Label>
                            <Input
                              id="url"
                              type="url"
                              placeholder="https://example.com"
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
                              Text
                            </Label>
                            <Textarea
                              id="text"
                              placeholder="Enter your text here..."
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
                              Email Address
                            </Label>
                            <Input
                              id="emailAddress"
                              type="email"
                              placeholder="contact@example.com"
                              value={email.address}
                              onChange={(e) => setEmail({ ...email, address: e.target.value })}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="emailSubject" className="text-foreground">
                              Subject
                            </Label>
                            <Input
                              id="emailSubject"
                              placeholder="Email subject"
                              value={email.subject}
                              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="emailBody" className="text-foreground">
                              Message
                            </Label>
                            <Textarea
                              id="emailBody"
                              placeholder="Message body"
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
                              Phone Number
                            </Label>
                            <Input
                              id="smsPhone"
                              type="tel"
                              placeholder="+1234567890"
                              value={sms.phone}
                              onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="smsMessage" className="text-foreground">
                              Message
                            </Label>
                            <Textarea
                              id="smsMessage"
                              placeholder="Your message"
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
                              Network Name (SSID)
                            </Label>
                            <Input
                              id="wifiSsid"
                              placeholder="MyWiFi"
                              value={wifi.ssid}
                              onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                              required
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="wifiPassword" className="text-foreground">
                              Password
                            </Label>
                            <Input
                              id="wifiPassword"
                              type="password"
                              placeholder="••••••••"
                              value={wifi.password}
                              onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="wifiEncryption" className="text-foreground">
                              Security Type
                            </Label>
                            <Select
                              value={wifi.encryption}
                              onValueChange={(value) => setWifi({ ...wifi, encryption: value })}
                            >
                              <SelectTrigger id="wifiEncryption" className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                                <SelectItem value="WEP">WEP</SelectItem>
                                <SelectItem value="nopass">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TabsContent>

                        <TabsContent value="vcard" className="space-y-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="vcardFirstName" className="text-foreground">
                                First Name
                              </Label>
                              <Input
                                id="vcardFirstName"
                                placeholder="John"
                                value={vcard.firstName}
                                onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                                required
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label htmlFor="vcardLastName" className="text-foreground">
                                Last Name
                              </Label>
                              <Input
                                id="vcardLastName"
                                placeholder="Doe"
                                value={vcard.lastName}
                                onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                                required
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="vcardPhone" className="text-foreground">
                              Phone
                            </Label>
                            <Input
                              id="vcardPhone"
                              type="tel"
                              placeholder="+1234567890"
                              value={vcard.phone}
                              onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcardEmail" className="text-foreground">
                              Email
                            </Label>
                            <Input
                              id="vcardEmail"
                              type="email"
                              placeholder="john.doe@example.com"
                              value={vcard.email}
                              onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcardOrganization" className="text-foreground">
                              Organization
                            </Label>
                            <Input
                              id="vcardOrganization"
                              placeholder="Company name"
                              value={vcard.organization}
                              onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                              className="mt-2"
                            />
                          </div>
                          <div>
                            <Label htmlFor="vcardUrl" className="text-foreground">
                              Website
                            </Label>
                            <Input
                              id="vcardUrl"
                              type="url"
                              placeholder="https://example.com"
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
                      Generate QR Code
                    </Button>
                  </form>
                </CardContent>
              </div>
            </Card>

            <div className="rounded-xl bg-gradient-to-br from-secondary to-accent p-1 shadow-xl">
              <Card className="shadow-xl border-0 bg-card/80 backdrop-blur">
                <CardHeader className="border-b bg-muted/50 text-center leading-7">
                  <CardTitle className="text-2xl font-bold text-foreground">Customization</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <Tabs defaultValue="colors" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                      <TabsTrigger value="colors">Colors</TabsTrigger>
                      <TabsTrigger value="style">Style & Size</TabsTrigger>
                      <TabsTrigger value="logo">Logo</TabsTrigger>
                      <TabsTrigger value="error">Error Correction</TabsTrigger>
                    </TabsList>

                    <TabsContent value="colors" className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="color" className="text-foreground font-semibold">
                            QR Color
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
                            Background Color
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
                          Corner Style
                        </Label>
                        <Select
                          value={cornerStyle}
                          onValueChange={(value) => setCornerStyle(value as "square" | "rounded")}
                        >
                          <SelectTrigger id="cornerStyle" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Classic Square</SelectItem>
                            <SelectItem value="rounded">Rounded Corners</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="size" className="text-foreground font-semibold">
                          Size: {size}x{size}px
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
                          Logo (optional)
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
                            {logo ? "Change" : "Add"}
                          </Button>
                          {logo && (
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => setLogo(null)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {logo && (
                          <div className="mt-4">
                            <Label htmlFor="logoSize" className="text-foreground font-semibold">
                              Logo Size: {logoSize}%
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
                          Error Correction Level
                        </Label>
                        <Select
                          value={errorCorrection}
                          onValueChange={(value) => setErrorCorrection(value as "L" | "M" | "Q" | "H")}
                        >
                          <SelectTrigger id="errorCorrection" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="L">Low (7%)</SelectItem>
                            <SelectItem value="M">Medium (15%)</SelectItem>
                            <SelectItem value="Q">Quartile (25%)</SelectItem>
                            <SelectItem value="H">High (30%)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground mt-2">
                          Higher levels allow the QR code to remain readable even if partially damaged
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-primary to-secondary p-1">
              <div className="bg-card rounded-lg">
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle className="text-2xl font-bold text-foreground text-center">Preview</CardTitle>
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
                            <QRCodeSVG
                              value={qrData}
                              size={size}
                              fgColor={color}
                              bgColor={backgroundColor}
                              level={errorCorrection}
                              includeMargin={false}
                            />
                            {logo && (
                              <div
                                className="absolute top-1/2 left-1/2"
                                style={{
                                  transform: "translate(-50%, -50%)",
                                  width: `${size * (logoSize / 100)}px`,
                                  height: `${size * (logoSize / 100)}px`,
                                }}
                              >
                                <div className="w-full h-full bg-white p-1 rounded-lg shadow-md flex items-center justify-center">
                                  <img
                                    src={logo || "/placeholder.svg"}
                                    alt="Logo"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={downloadQRCode}
                        className="w-full bg-chart-1 hover:bg-chart-1/90 text-primary-foreground font-semibold"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download as PNG
                      </Button>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
