"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"
import { CATEGORIES } from "@/lib/category-data"

const loadEvaluationDetails = async (id: string) => {
  const evaluationFiles = [
    "/evaluations/gpt-4-turbo.json",
    "/evaluations/claude-3-sonnet.json",
    "/evaluations/gemini-pro.json",
    "/evaluations/fraud-detector.json",
  ]

  for (const file of evaluationFiles) {
    try {
      const response = await fetch(file)
      const data = await response.json()

      if (data.id === id) {
        return data
      }
    } catch (error) {
      console.error(`Failed to load evaluation data from ${file}:`, error)
    }
  }

  return null
}

export default function EvaluationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const evaluationId = params.id as string

  const [evaluation, setEvaluation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const data = await loadEvaluationDetails(evaluationId)
      setEvaluation(data)
      setLoading(false)
    }
    loadData()
  }, [evaluationId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading evaluation details...</p>
        </div>
      </div>
    )
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-heading mb-4">Evaluation Not Found</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.push("/")} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-heading">{evaluation.systemName}</h1>
            <p className="text-muted-foreground">{evaluation.provider}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* System Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">System Version</p>
            <p className="font-medium">{evaluation.version}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deployment Context</p>
            <p className="font-medium">{evaluation.deploymentContext}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Evaluation Date</p>
            <p className="font-medium">{evaluation.evaluationDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Evaluator</p>
            <p className="font-medium">{evaluation.evaluator}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Modality</p>
            <p className="font-medium">{evaluation.modality}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completeness Score</p>
            <p className="font-medium">{evaluation.overallStats?.completenessScore || "N/A"}%</p>
          </div>
        </CardContent>
      </Card>

      {/* Applicable Categories */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Applicable Categories ({evaluation.selectedCategories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {evaluation.selectedCategories?.map((categoryId: string) => {
              const category = CATEGORIES.find((c) => c.id === categoryId)
              return (
                <Badge key={categoryId} variant="secondary">
                  {category?.name || categoryId}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {evaluation.overallStats?.strongCategories?.length || 0}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Strong</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {evaluation.overallStats?.adequateCategories?.length || 0}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Adequate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {evaluation.overallStats?.weakCategories?.length || 0}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Weak</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {evaluation.overallStats?.insufficientCategories?.length || 0}
              </div>
              <div className="text-sm text-red-600 dark:text-red-400">Insufficient</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Details */}
      {evaluation.categoryEvaluations &&
        Object.entries(evaluation.categoryEvaluations).map(([categoryId, data]: [string, any]) => {
          const category = CATEGORIES.find((c) => c.id === categoryId)
          return (
            <Card key={categoryId} className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {category?.name || categoryId}
                  <Badge variant={category?.type === "capability" ? "secondary" : "destructive"}>
                    {category?.type || "unknown"}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category?.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Benchmark Questions */}
                {data.benchmarkSources && (
                  <div>
                    <h4 className="font-semibold mb-3">Part A: Benchmark & Testing</h4>
                    <div className="space-y-4">
                      {Object.entries(data.benchmarkSources).map(([questionId, sources]: [string, any]) => (
                        <div key={questionId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{questionId}:</span>
                            <Badge variant={data.benchmarkAnswers?.[questionId] === "yes" ? "default" : "secondary"}>
                              {data.benchmarkAnswers?.[questionId] || "N/A"}
                            </Badge>
                          </div>
                          {sources?.map((source: any, idx: number) => (
                            <div key={idx} className="mt-3 p-3 bg-muted rounded">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">URL:</span> {source.url}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Source Type:</span> {source.sourceType}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Benchmark:</span> {source.benchmarkName}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Metrics:</span> {source.metrics}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Score:</span> {source.score}
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-muted-foreground">Description:</span> {source.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Process Questions */}
                {data.processSources && (
                  <div>
                    <h4 className="font-semibold mb-3">Part B: Documentation & Process</h4>
                    <div className="space-y-4">
                      {Object.entries(data.processSources).map(([questionId, sources]: [string, any]) => (
                        <div key={questionId} className="border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{questionId}:</span>
                            <Badge variant={data.processAnswers?.[questionId] === "yes" ? "default" : "secondary"}>
                              {data.processAnswers?.[questionId] || "N/A"}
                            </Badge>
                          </div>
                          {sources?.map((source: any, idx: number) => (
                            <div key={idx} className="mt-3 p-3 bg-muted rounded">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">URL:</span> {source.url}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Document Type:</span> {source.documentType}
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-muted-foreground">Description:</span> {source.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Aspects */}
                {data.additionalAspects && (
                  <div>
                    <h4 className="font-semibold mb-3">Part C: Additional Aspects</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{data.additionalAspects}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}
