"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CategoryEvaluation } from "@/components/category-evaluation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { CategoryScore } from "@/components/ai-evaluation-dashboard"
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from "lucide-react"

interface Category {
  id: string
  name: string
  type: "capability" | "risk"
  description: string
  detailedGuidance: string
}

interface EvaluationFormProps {
  categories: Category[]
  selectedCategories: string[]
  categoryScores: Record<string, CategoryScore>
  onScoreUpdate: (categoryId: string, score: CategoryScore) => void
  onComplete: () => void
}

export function EvaluationForm({
  categories,
  selectedCategories,
  categoryScores,
  onScoreUpdate,
  onComplete,
}: EvaluationFormProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  const selectedCategoryObjects = categories.filter((c) => selectedCategories.includes(c.id))
  const currentCategory = selectedCategoryObjects[currentCategoryIndex]

  const completedCount = Object.keys(categoryScores).length
  const totalCount = selectedCategories.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleNext = () => {
    if (currentCategoryIndex < selectedCategoryObjects.length - 1) {
      setCurrentCategoryIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex((prev) => prev - 1)
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    const index = selectedCategoryObjects.findIndex((c) => c.id === categoryId)
    if (index !== -1) {
      setCurrentCategoryIndex(index)
    }
  }

  const isCurrentCategoryCompleted = currentCategory && categoryScores[currentCategory.id]
  const allCompleted = completedCount === totalCount

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading">Detailed Evaluation</CardTitle>
              <CardDescription>Complete the evaluation for each selected category</CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Progress:</span>
                <Badge variant="secondary">
                  {completedCount}/{totalCount}
                </Badge>
              </div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Navigation Sidebar as Tabs */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={selectedCategoryObjects[0]?.id || ""} orientation="vertical" value={selectedCategoryObjects[currentCategoryIndex]?.id || ""} onValueChange={(val) => handleCategorySelect(val)}>
              <TabsList className="flex-col w-full max-h-[60vh] overflow-y-auto">
                {selectedCategoryObjects.map((category, index) => {
                  const isCompleted = categoryScores[category.id]
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="w-full text-left p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isCompleted ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                          <div className="flex flex-col text-left">
                            <span className="text-sm font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground">{category.type}</span>
                          </div>
                        </div>
                        {isCompleted && <span className="text-xs text-muted-foreground">{categoryScores[category.id].totalScore}/{categoryScores[category.id].totalApplicable || categoryScores[category.id].totalQuestions || 0}</span>}
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Current Category Evaluation */}
        <div className="lg:col-span-3">
          {currentCategory && (
            <CategoryEvaluation
              key={currentCategory.id}
              category={currentCategory}
              score={categoryScores[currentCategory.id]}
              onScoreUpdate={(score) => onScoreUpdate(currentCategory.id, score)}
            />
          )}

          {/* Navigation Controls */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handlePrevious} disabled={currentCategoryIndex === 0}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Category {currentCategoryIndex + 1} of {totalCount}
                  </p>
                  {currentCategory && <p className="font-medium">{currentCategory.name}</p>}
                </div>

                {currentCategoryIndex < selectedCategoryObjects.length - 1 ? (
                  <Button onClick={handleNext} disabled={!isCurrentCategoryCompleted}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={onComplete} disabled={!allCompleted} className="bg-green-600 hover:bg-green-700">
                    View Results
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
