"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { CategoryScore } from "@/app/page"
import { HelpCircle, CheckCircle, Plus, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { BENCHMARK_QUESTIONS, PROCESS_QUESTIONS, SOURCE_TYPES } from "@/lib/category-data"

interface Category {
  id: string
  name: string
  type: "capability" | "risk"
  description: string
  detailedGuidance: string
}

interface Source {
  id: string
  url: string
  description: string
  sourceType: keyof typeof SOURCE_TYPES
  score?: string
}

interface CategoryEvaluationProps {
  category: Category
  score?: CategoryScore
  onScoreUpdate: (score: CategoryScore) => void
}

export function CategoryEvaluation({ category, score, onScoreUpdate }: CategoryEvaluationProps) {
  const [benchmarkAnswers, setBenchmarkAnswers] = useState<Record<string, string>>({})
  const [processAnswers, setProcessAnswers] = useState<Record<string, string>>({})
  const [benchmarkSources, setBenchmarkSources] = useState<Record<string, Source[]>>({})
  const [processSources, setProcessSources] = useState<Record<string, Source[]>>({})

  // Initialize from existing score
  useEffect(() => {
    if (score) {
      // This would be populated from saved data in a real implementation
      // For now, we'll calculate based on the scores
    }
  }, [score])

  const addSource = (questionId: string, section: "benchmark" | "process") => {
    const newSource: Source = {
      id: Date.now().toString(),
      url: "",
      description: "",
      sourceType: "internal",
      score: "",
    }

    if (section === "benchmark") {
      setBenchmarkSources((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newSource],
      }))
    } else {
      setProcessSources((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newSource],
      }))
    }
  }

  const removeSource = (questionId: string, sourceId: string, section: "benchmark" | "process") => {
    if (section === "benchmark") {
      setBenchmarkSources((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || []).filter((s) => s.id !== sourceId),
      }))
    } else {
      setProcessSources((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || []).filter((s) => s.id !== sourceId),
      }))
    }
  }

  const updateSource = (
    questionId: string,
    sourceId: string,
    field: keyof Source,
    value: string,
    section: "benchmark" | "process",
  ) => {
    const updateSources = section === "benchmark" ? setBenchmarkSources : setProcessSources
    updateSources((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] || []).map((source) =>
        source.id === sourceId ? { ...source, [field]: value } : source,
      ),
    }))
  }

  const calculateScore = () => {
    const benchmarkScore = Object.values(benchmarkAnswers).filter((answer) => answer === "yes").length
    const processScore = Object.values(processAnswers).filter((answer) => answer === "yes").length
    const totalScore = benchmarkScore + processScore

    let status: CategoryScore["status"]
    if (totalScore >= 11) status = "strong"
    else if (totalScore >= 8) status = "adequate"
    else if (totalScore >= 4) status = "weak"
    else status = "insufficient"

    return { benchmarkScore, processScore, totalScore, status }
  }

  const handleAnswerChange = (questionId: string, value: string, section: "benchmark" | "process") => {
    if (section === "benchmark") {
      setBenchmarkAnswers((prev) => ({ ...prev, [questionId]: value }))
      if (value !== "yes") {
        setBenchmarkSources((prev) => ({ ...prev, [questionId]: [] }))
      }
    } else {
      setProcessAnswers((prev) => ({ ...prev, [questionId]: value }))
      if (value !== "yes") {
        setProcessSources((prev) => ({ ...prev, [questionId]: [] }))
      }
    }
  }

  const handleSave = () => {
    const newScore = calculateScore()
    onScoreUpdate(newScore)
  }

  const currentScore = calculateScore()
  const isComplete = Object.keys(benchmarkAnswers).length === 6 && Object.keys(processAnswers).length === 8

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Category Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="font-heading flex items-center gap-2">
                  {category.name}
                  <Badge variant={category.type === "capability" ? "secondary" : "destructive"}>{category.type}</Badge>
                </CardTitle>
                <CardDescription className="mt-2">{category.description}</CardDescription>
              </div>
              {isComplete && (
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Score: {currentScore.totalScore}/14</span>
                  </div>
                  <Badge
                    variant={
                      currentScore.status === "strong"
                        ? "default"
                        : currentScore.status === "adequate"
                          ? "secondary"
                          : currentScore.status === "weak"
                            ? "outline"
                            : "destructive"
                    }
                  >
                    {currentScore.status.charAt(0).toUpperCase() + currentScore.status.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Source Types</h4>
                <div className="grid gap-2 text-sm">
                  {Object.entries(SOURCE_TYPES).map(([key, type]) => (
                    <div key={key}>
                      <span className="font-medium">{type.label}:</span> {type.description}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Evaluation Guidance</h4>
                <div className="text-sm whitespace-pre-line">{category.detailedGuidance}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part A: Benchmark & Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Part A: Benchmark & Testing Evaluation</CardTitle>
            <CardDescription>
              Quantitative assessment through standardized tests and measurements ({currentScore.benchmarkScore}/6)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {BENCHMARK_QUESTIONS.map((question) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <Label className="text-sm font-medium flex-1">
                    {question.id}. {question.text}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{question.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <RadioGroup
                  value={benchmarkAnswers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value, "benchmark")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${question.id}-no`} />
                    <Label htmlFor={`${question.id}-no`}>No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="na" id={`${question.id}-na`} />
                    <Label htmlFor={`${question.id}-na`}>Not Applicable</Label>
                  </div>
                </RadioGroup>

                {benchmarkAnswers[question.id] === "yes" && (
                  <div className="space-y-4 ml-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sources & Evidence</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSource(question.id, "benchmark")}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Source
                      </Button>
                    </div>

                    {(benchmarkSources[question.id] || []).map((source, index) => (
                      <div key={source.id} className="space-y-3 p-3 border rounded-lg bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Source {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSource(question.id, source.id, "benchmark")}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid gap-3">
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              placeholder="https://..."
                              value={source.url}
                              onChange={(e) => updateSource(question.id, source.id, "url", e.target.value, "benchmark")}
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              placeholder="Describe the benchmark, test, or evaluation method..."
                              value={source.description}
                              onChange={(e) =>
                                updateSource(question.id, source.id, "description", e.target.value, "benchmark")
                              }
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Source Type</Label>
                              <RadioGroup
                                value={source.sourceType}
                                onValueChange={(value) =>
                                  updateSource(question.id, source.id, "sourceType", value, "benchmark")
                                }
                              >
                                {Object.entries(SOURCE_TYPES).map(([key, type]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <RadioGroupItem value={key} id={`${source.id}-${key}`} />
                                    <Label htmlFor={`${source.id}-${key}`} className="text-xs">
                                      {type.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>

                            <div>
                              <Label className="text-xs">Score (if applicable)</Label>
                              <Input
                                placeholder="e.g., 85%, 0.92, Pass"
                                value={source.score || ""}
                                onChange={(e) =>
                                  updateSource(question.id, source.id, "score", e.target.value, "benchmark")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(benchmarkSources[question.id] || []).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Click "Add Source" to document benchmarks and evidence
                      </div>
                    )}
                  </div>
                )}

                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Part B: Documentation & Process */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Part B: Documentation & Process Evaluation</CardTitle>
            <CardDescription>
              Governance, transparency, and risk management processes ({currentScore.processScore}/8)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {PROCESS_QUESTIONS.map((question) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <Label className="text-sm font-medium flex-1">
                    {question.id}. {question.text}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>{question.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <RadioGroup
                  value={processAnswers[question.id] || ""}
                  onValueChange={(value) => handleAnswerChange(question.id, value, "process")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                    <Label htmlFor={`${question.id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`${question.id}-no`} />
                    <Label htmlFor={`${question.id}-no`}>No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="na" id={`${question.id}-na`} />
                    <Label htmlFor={`${question.id}-na`}>Not Applicable</Label>
                  </div>
                </RadioGroup>

                {processAnswers[question.id] === "yes" && (
                  <div className="space-y-4 ml-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Sources & Evidence</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSource(question.id, "process")}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Source
                      </Button>
                    </div>

                    {(processSources[question.id] || []).map((source, index) => (
                      <div key={source.id} className="space-y-3 p-3 border rounded-lg bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Source {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSource(question.id, source.id, "process")}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid gap-3">
                          <div>
                            <Label className="text-xs">URL</Label>
                            <Input
                              placeholder="https://..."
                              value={source.url}
                              onChange={(e) => updateSource(question.id, source.id, "url", e.target.value, "process")}
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              placeholder="Describe the benchmark, test, or evaluation method..."
                              value={source.description}
                              onChange={(e) =>
                                updateSource(question.id, source.id, "description", e.target.value, "process")
                              }
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Source Type</Label>
                              <RadioGroup
                                value={source.sourceType}
                                onValueChange={(value) =>
                                  updateSource(question.id, source.id, "sourceType", value, "process")
                                }
                              >
                                {Object.entries(SOURCE_TYPES).map(([key, type]) => (
                                  <div key={key} className="flex items-center space-x-2">
                                    <RadioGroupItem value={key} id={`${source.id}-${key}`} />
                                    <Label htmlFor={`${source.id}-${key}`} className="text-xs">
                                      {type.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>

                            <div>
                              <Label className="text-xs">Score (if applicable)</Label>
                              <Input
                                placeholder="e.g., 85%, 0.92, Pass"
                                value={source.score || ""}
                                onChange={(e) =>
                                  updateSource(question.id, source.id, "score", e.target.value, "process")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(processSources[question.id] || []).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Click "Add Source" to document benchmarks and evidence
                      </div>
                    )}
                  </div>
                )}

                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button onClick={handleSave} disabled={!isComplete} size="lg" className="w-full max-w-md">
            {score ? "Update" : "Save"} Category Evaluation
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
