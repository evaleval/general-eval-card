"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Download, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type EvaluationCardData = {
  id: string
  systemName: string
  provider: string
  modality: string // Added modality field
  completedDate: string
  applicableCategories: number
  completedCategories: number
  status: "strong" | "adequate" | "weak" | "insufficient"
  capabilityEval: {
    strong: number
    adequate: number
    weak: number
    insufficient: number
    strongCategories: string[]
    adequateCategories: string[]
    weakCategories: string[]
    insufficientCategories: string[]
    totalApplicable: number
  }
  riskEval: {
    strong: number
    adequate: number
    weak: number
    insufficient: number
    strongCategories: string[]
    adequateCategories: string[]
    weakCategories: string[]
    insufficientCategories: string[]
    totalApplicable: number
  }
}

interface EvaluationCardProps {
  evaluation: EvaluationCardData
  onView: (id: string) => void
  onDelete: (id: string) => void
}

const getCompletenessColor = (score: number) => {
  if (score >= 85) return "bg-emerald-500 text-white"
  if (score >= 70) return "bg-blue-500 text-white"
  if (score >= 55) return "bg-amber-500 text-white"
  return "bg-red-500 text-white"
}

export function EvaluationCard({ evaluation, onView, onDelete }: EvaluationCardProps) {
  const router = useRouter()

  const calculateCompletenessScore = () => {
    const weights = { strong: 4, adequate: 3, weak: 2, insufficient: 1 }
    const capTotal = evaluation.capabilityEval.totalApplicable
    const riskTotal = evaluation.riskEval.totalApplicable

    if (capTotal === 0 && riskTotal === 0) {
      return "0.0"
    }

    let capScore = 0
    if (capTotal > 0) {
      capScore =
        ((evaluation.capabilityEval.strong * weights.strong +
          evaluation.capabilityEval.adequate * weights.adequate +
          evaluation.capabilityEval.weak * weights.weak +
          evaluation.capabilityEval.insufficient * weights.insufficient) /
          (capTotal * 4)) *
        100
    }

    let riskScore = 0
    if (riskTotal > 0) {
      riskScore =
        ((evaluation.riskEval.strong * weights.strong +
          evaluation.riskEval.adequate * weights.adequate +
          evaluation.riskEval.weak * weights.weak +
          evaluation.riskEval.insufficient * weights.insufficient) /
          (riskTotal * 4)) *
        100
    }

    const totalApplicable = capTotal + riskTotal
    const weightedScore = (capScore * capTotal + riskScore * riskTotal) / totalApplicable

    // Ensure we return a valid number
    return isNaN(weightedScore) ? "0.0" : weightedScore.toFixed(1)
  }

  const handleViewDetails = () => {
    router.push(`/evaluation/${evaluation.id}`)
  }

  const completenessScore = Number.parseFloat(calculateCompletenessScore())

  return (
    <TooltipProvider>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-lg font-heading truncate">{evaluation.systemName}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{evaluation.provider}</p>
              <Badge variant="outline" className="text-xs px-2 py-1 w-fit">
                {evaluation.modality}
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(evaluation.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">Completeness</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`px-2 py-1 rounded text-sm font-semibold cursor-help ${getCompletenessColor(completenessScore)}`}
                  >
                    {completenessScore}%
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    Weighted average: (Strong×4 + Adequate×3 + Weak×2 + Insufficient×1) ÷ (Total×4) × 100
                    <br />
                    Capability: {evaluation.capabilityEval.totalApplicable} categories
                    <br />
                    Risk: {evaluation.riskEval.totalApplicable} categories
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">Date</span>
              <p className="text-sm font-semibold">{evaluation.completedDate}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Capability Eval ({evaluation.capabilityEval.totalApplicable} applicable)
              </p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-emerald-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.capabilityEval.strong}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.capabilityEval.strongCategories.length > 0
                        ? evaluation.capabilityEval.strongCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-blue-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.capabilityEval.adequate}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.capabilityEval.adequateCategories.length > 0
                        ? evaluation.capabilityEval.adequateCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-amber-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.capabilityEval.weak}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.capabilityEval.weakCategories.length > 0
                        ? evaluation.capabilityEval.weakCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-red-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.capabilityEval.insufficient}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.capabilityEval.insufficientCategories.length > 0
                        ? evaluation.capabilityEval.insufficientCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Risk Eval ({evaluation.riskEval.totalApplicable} applicable)
              </p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-emerald-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.riskEval.strong}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.riskEval.strongCategories.length > 0
                        ? evaluation.riskEval.strongCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-blue-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.riskEval.adequate}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.riskEval.adequateCategories.length > 0
                        ? evaluation.riskEval.adequateCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-amber-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.riskEval.weak}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.riskEval.weakCategories.length > 0
                        ? evaluation.riskEval.weakCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-center cursor-help">
                      <div className="w-full h-2 bg-red-500 rounded mb-1"></div>
                      <p className="font-medium">{evaluation.riskEval.insufficient}</p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {evaluation.riskEval.insufficientCategories.length > 0
                        ? evaluation.riskEval.insufficientCategories.join(", ")
                        : "No categories"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
