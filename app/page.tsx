"use client"

import { useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SystemInfoForm } from "@/components/system-info-form"
import { CategorySelection } from "@/components/category-selection"
import { EvaluationForm } from "@/components/evaluation-form"
import { ResultsDashboard } from "@/components/results-dashboard"
import { CheckCircle, Circle, BarChart3 } from "lucide-react"
import { CATEGORIES } from "@/lib/category-data"

export type SystemInfo = {
  name: string
  url: string
  provider: string
  systemTypes: string[]
  deploymentContexts: string[]
}

export type CategoryScore = {
  benchmarkScore: number
  processScore: number
  totalScore: number
  status: "strong" | "adequate" | "weak" | "insufficient" | "not-evaluated"
}

export type EvaluationData = {
  systemInfo: SystemInfo | null
  selectedCategories: string[]
  categoryScores: Record<string, CategoryScore>
  currentCategory: string | null
}

export default function AIEvaluationDashboard() {
  const [activeTab, setActiveTab] = useState("system-info")
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    systemInfo: null,
    selectedCategories: [],
    categoryScores: {},
    currentCategory: null,
  })

  const updateSystemInfo = (systemInfo: SystemInfo) => {
    setEvaluationData((prev) => ({ ...prev, systemInfo }))
    setActiveTab("categories")
  }

  const updateSelectedCategories = (categories: string[]) => {
    setEvaluationData((prev) => ({ ...prev, selectedCategories: categories }))
    if (categories.length > 0) {
      setActiveTab("evaluation")
    }
  }

  const updateCategoryScore = (categoryId: string, score: CategoryScore) => {
    setEvaluationData((prev) => ({
      ...prev,
      categoryScores: { ...prev.categoryScores, [categoryId]: score },
    }))
  }

  const getOverallProgress = () => {
    const totalSelected = evaluationData.selectedCategories.length
    const completed = Object.keys(evaluationData.categoryScores).length
    return totalSelected > 0 ? (completed / totalSelected) * 100 : 0
  }

  const getStatusCounts = () => {
    const scores = Object.values(evaluationData.categoryScores)
    return {
      strong: scores.filter((s) => s.status === "strong").length,
      adequate: scores.filter((s) => s.status === "adequate").length,
      weak: scores.filter((s) => s.status === "weak").length,
      insufficient: scores.filter((s) => s.status === "insufficient").length,
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading text-foreground">AI Evaluation Dashboard</h1>
              <p className="text-muted-foreground">Comprehensive AI system assessment and scoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={getOverallProgress()} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(getOverallProgress())}%</span>
                </div>
              </div>
              {evaluationData.systemInfo && (
                <Badge variant="secondary" className="font-medium">
                  {evaluationData.systemInfo.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system-info" className="flex items-center gap-2">
              {evaluationData.systemInfo ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              System Info
            </TabsTrigger>
            <TabsTrigger value="categories" disabled={!evaluationData.systemInfo} className="flex items-center gap-2">
              {evaluationData.selectedCategories.length > 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="evaluation"
              disabled={evaluationData.selectedCategories.length === 0}
              className="flex items-center gap-2"
            >
              {Object.keys(evaluationData.categoryScores).length > 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              Evaluation
            </TabsTrigger>
            <TabsTrigger
              value="results"
              disabled={Object.keys(evaluationData.categoryScores).length === 0}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system-info">
            <SystemInfoForm onSubmit={updateSystemInfo} initialData={evaluationData.systemInfo} />
          </TabsContent>

          <TabsContent value="categories">
            <CategorySelection
              categories={CATEGORIES}
              selectedCategories={evaluationData.selectedCategories}
              onSelectionChange={updateSelectedCategories}
            />
          </TabsContent>

          <TabsContent value="evaluation">
            <EvaluationForm
              categories={CATEGORIES}
              selectedCategories={evaluationData.selectedCategories}
              categoryScores={evaluationData.categoryScores}
              onScoreUpdate={updateCategoryScore}
              onComplete={() => setActiveTab("results")}
            />
          </TabsContent>

          <TabsContent value="results">
            <ResultsDashboard
              systemInfo={evaluationData.systemInfo}
              categories={CATEGORIES}
              selectedCategories={evaluationData.selectedCategories}
              categoryScores={evaluationData.categoryScores}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
