"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Brain, Shield, HelpCircle } from "lucide-react"

interface Category {
  id: string
  name: string
  type: "capability" | "risk"
  description: string
}

interface CategorySelectionProps {
  categories: Category[]
  selectedCategories: string[]
  onSelectionChange: (categories: string[]) => void
}

export function CategorySelection({ categories, selectedCategories, onSelectionChange }: CategorySelectionProps) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedCategories)

  const capabilityCategories = categories.filter((c) => c.type === "capability")
  const riskCategories = categories.filter((c) => c.type === "risk")

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setLocalSelection((prev) => (checked ? [...prev, categoryId] : prev.filter((id) => id !== categoryId)))
  }

  const handleSelectAll = (type: "capability" | "risk") => {
    const categoryIds = categories.filter((c) => c.type === type).map((c) => c.id)
    const allSelected = categoryIds.every((id) => localSelection.includes(id))

    if (allSelected) {
      setLocalSelection((prev) => prev.filter((id) => !categoryIds.includes(id)))
    } else {
      setLocalSelection((prev) => [...new Set([...prev, ...categoryIds])])
    }
  }

  const handleContinue = () => {
    onSelectionChange(localSelection)
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Category Applicability Assessment</CardTitle>
            <CardDescription>
              Select which categories are applicable to your AI system. Only complete the detailed evaluation for
              categories marked as applicable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Selected Categories:</span>
                <Badge variant="secondary">{localSelection.length}/20</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capability Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                <CardTitle className="font-heading">Capability Categories</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleSelectAll("capability")}>
                {capabilityCategories.every((c) => localSelection.includes(c.id)) ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <CardDescription>Core functional capabilities and performance areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {capabilityCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={category.id}
                    checked={localSelection.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                  />
                  <label htmlFor={category.id} className="text-sm font-medium cursor-pointer flex-1">
                    {category.name}
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Categories */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-destructive" />
                <CardTitle className="font-heading">Risk Categories</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleSelectAll("risk")}>
                {riskCategories.every((c) => localSelection.includes(c.id)) ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <CardDescription>Potential risks, safety concerns, and ethical considerations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {riskCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={category.id}
                    checked={localSelection.includes(category.id)}
                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                  />
                  <label htmlFor={category.id} className="text-sm font-medium cursor-pointer flex-1">
                    {category.name}
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleContinue} disabled={localSelection.length === 0} size="lg">
            Continue to Evaluation ({localSelection.length} categories selected)
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
