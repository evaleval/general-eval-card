"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { SystemInfo } from "@/components/ai-evaluation-dashboard"

interface SystemInfoFormProps {
  onSubmit: (data: SystemInfo) => void
  initialData: SystemInfo | null
}

const SYSTEM_TYPES = [
  "Text-to-Text (e.g., chatbots, language models)",
  "Text-to-Image (e.g., image generation)",
  "Image-to-Text (e.g., image captioning, OCR)",
  "Image-to-Image (e.g., image editing, style transfer)",
  "Audio/Speech (e.g., speech recognition, text-to-speech)",
  "Video (e.g., video generation, analysis)",
  "Multimodal",
  "Robotic/Embodied AI",
  "Other",
]

const DEPLOYMENT_CONTEXTS = [
  "Research/Academic",
  "Internal/Enterprise Use",
  "Public/Consumer-Facing",
  "High-Risk Applications",
  "Other",
]

export function SystemInfoForm({ onSubmit, initialData }: SystemInfoFormProps) {
  const [formData, setFormData] = useState<SystemInfo>({
    name: initialData?.name || "",
    url: initialData?.url || "",
    provider: initialData?.provider || "",
    systemTypes: initialData?.systemTypes || [],
  deploymentContexts: initialData?.deploymentContexts || [],
  modality: initialData?.modality || "text",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleSystemTypeChange = (type: string, checked: boolean) => {
    setFormData((prev: SystemInfo) => ({
      ...prev,
      systemTypes: checked ? [...prev.systemTypes, type] : prev.systemTypes.filter((t) => t !== type),
    }))
  }

  const handleDeploymentContextChange = (context: string, checked: boolean) => {
    setFormData((prev: SystemInfo) => ({
      ...prev,
      deploymentContexts: checked
        ? [...prev.deploymentContexts, context]
        : prev.deploymentContexts.filter((c) => c !== context),
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">System Information</CardTitle>
        <CardDescription>Provide basic information about the AI system you want to evaluate</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">AI System Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., GPT-4, Claude, Custom Model"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">AI System URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Provider/Organization *</Label>
            <Input
              id="provider"
              value={formData.provider}
              onChange={(e) => setFormData((prev) => ({ ...prev, provider: e.target.value }))}
              placeholder="e.g., OpenAI, Anthropic, Internal Team"
              required
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">System Type (select all that apply) *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {SYSTEM_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      checked={formData.systemTypes.includes(type)}
                      onCheckedChange={(checked) => handleSystemTypeChange(type, checked as boolean)}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Deployment Context (select all that apply) *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {DEPLOYMENT_CONTEXTS.map((context) => (
                  <div key={context} className="flex items-center space-x-2">
                    <Checkbox
                      id={`context-${context}`}
                      checked={formData.deploymentContexts.includes(context)}
                      onCheckedChange={(checked) => handleDeploymentContextChange(context, checked as boolean)}
                    />
                    <Label htmlFor={`context-${context}`} className="text-sm font-normal">
                      {context}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              !formData.name ||
              !formData.provider ||
              formData.systemTypes.length === 0 ||
              formData.deploymentContexts.length === 0
            }
          >
            Continue to Category Selection
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
