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

interface DocumentationSource {
  id: string
  url: string
  description: string
  sourceType: keyof typeof SOURCE_TYPES
  documentType: string
}

interface CategoryEvaluationProps {
  category: Category
  score?: CategoryScore
  onScoreUpdate: (score: CategoryScore) => void
}

const CustomFieldComponent = ({
  questionId,
  fieldType,
  value,
  onChange,
}: {
  questionId: string
  fieldType: string
  value: string
  onChange: (value: string) => void
}) => {
  const getFieldConfig = (questionId: string, fieldType: string) => {
    const configs: Record<string, Record<string, { label: string; placeholder: string; type?: string }>> = {
      A1: {
        benchmarkName: { label: "Benchmark/Dataset Name", placeholder: "e.g., MMLU, HellaSwag, GSM8K" },
        version: { label: "Version", placeholder: "e.g., v1.2, 2024-01" },
        taskVariants: { label: "Task Variants", placeholder: "e.g., multiple choice, generation, classification" },
        metrics: { label: "Metrics", placeholder: "e.g., accuracy, F1, BLEU, perplexity" },
      },
      A2: {
        thresholds: { label: "Quantitative Thresholds", placeholder: "e.g., >85% accuracy, <0.1 error rate" },
        thresholdSource: {
          label: "Threshold Source",
          placeholder: "e.g., industry standard, research paper, policy requirement",
        },
        passFail: { label: "Pass/Fail Determination", placeholder: "e.g., Pass - exceeded 85% threshold" },
      },
      A3: {
        comparativeScores: {
          label: "Comparative Scores",
          placeholder: "e.g., Our model: 87.2%, GPT-4: 85.1%, Previous version: 82.3%",
        },
        baselineType: { label: "Baseline Type", placeholder: "e.g., SOTA, previous version, industry standard" },
        significance: { label: "Statistical Significance", placeholder: "e.g., p<0.05, 95% CI: [1.2, 3.8]" },
      },
      A4: {
        testTypes: { label: "Test Types", placeholder: "e.g., adversarial attacks, load testing, distribution shift" },
        failureRates: { label: "Failure/Degradation Rates", placeholder: "e.g., 15% failure under adversarial inputs" },
        robustnessMetrics: {
          label: "Robustness Metrics",
          placeholder: "e.g., attack success rate, performance drop %",
        },
      },
      A5: {
        liveMetrics: { label: "Live Metrics Tracked", placeholder: "e.g., error rates, latency, drift detection" },
        samplingCadence: { label: "Sampling Cadence", placeholder: "e.g., every 1000 requests, hourly, daily" },
        alertThresholds: { label: "Alert Thresholds", placeholder: "e.g., >5% error rate, >500ms latency" },
      },
      A6: {
        procedure: {
          label: "Contamination Check Procedure",
          placeholder: "e.g., n-gram overlap analysis, URL deduplication",
        },
        contaminationRate: {
          label: "Contamination Rate",
          placeholder: "e.g., <1% overlap detected, 0.3% exact matches",
        },
        mitigations: { label: "Mitigations Taken", placeholder: "e.g., removed overlapping samples, used holdout set" },
      },
      B1: {
        scope: {
          label: "Evaluation Scope",
          placeholder: "e.g., measures reasoning capability in mathematical contexts",
        },
        successFailureDefinitions: {
          label: "Success/Failure Definitions",
          placeholder: "e.g., success = >80% on grade-level problems",
        },
        hypotheses: { label: "Hypotheses Being Tested", placeholder: "e.g., model can solve multi-step word problems" },
      },
      B2: {
        replicationPackage: {
          label: "Replication Package",
          placeholder: "e.g., GitHub repo with code, configs, prompts",
        },
        accessLevel: { label: "Access Level", placeholder: "e.g., public, access-controlled, internal only" },
        proxies: { label: "Proxies (if not shareable)", placeholder: "e.g., synthetic examples, anonymized data" },
      },
      B3: {
        riskRegister: { label: "Risk Register Entries", placeholder: "e.g., R-001: Bias in hiring decisions" },
        severityLikelihood: { label: "Severity/Likelihood", placeholder: "e.g., High severity, Medium likelihood" },
        failureCases: { label: "Example Failure Cases", placeholder: "e.g., model recommends unqualified candidates" },
      },
      B4: {
        beforeAfterMetrics: {
          label: "Before/After Metrics",
          placeholder: "e.g., bias score: 0.8 → 0.3 after mitigation",
        },
        targetThresholds: { label: "Target Thresholds", placeholder: "e.g., bias score <0.2, fairness metric >0.8" },
        gateCriteria: {
          label: "Release Gate Criteria",
          placeholder: "e.g., all mitigations must show >50% improvement",
        },
      },
      B5: {
        reviewers: { label: "Reviewers", placeholder: "e.g., domain experts, affected user groups, ethics board" },
        feedbackChanges: {
          label: "Changes from Feedback",
          placeholder: "e.g., added bias metrics, revised interpretation",
        },
        disagreements: {
          label: "Unresolved Disagreements",
          placeholder: "e.g., threshold levels, risk severity ratings",
        },
      },
      B6: {
        uncertaintyDisclosure: {
          label: "Uncertainty Disclosure",
          placeholder: "e.g., error bars, confidence intervals, variance across runs",
        },
        axesConsistency: { label: "Axes Consistency", placeholder: "e.g., consistent 0-100 scale, no truncated axes" },
        sampleSizes: { label: "Sample Sizes", placeholder: "e.g., n=1000 test samples, 5 random seeds" },
        selectionCriteria: { label: "Selection Criteria", placeholder: "e.g., all results shown, no cherry-picking" },
      },
      B7: {
        standardsMapping: { label: "Standards Mapping", placeholder: "e.g., NIST AI RMF, ISO 27001, GDPR compliance" },
        gaps: { label: "Identified Gaps", placeholder: "e.g., missing bias documentation, incomplete audit trail" },
        remediationPlan: {
          label: "Remediation Plan",
          placeholder: "e.g., implement bias testing by Q2, add audit logging",
        },
      },
      B8: {
        triggers: {
          label: "Re-evaluation Triggers",
          placeholder: "e.g., model updates, data drift >5%, security incidents",
        },
        versionedSpecs: { label: "Versioned Eval Specs", placeholder: "e.g., eval spec v2.1, change log maintained" },
        auditTrail: { label: "Audit Trail", placeholder: "e.g., all changes logged with timestamps and rationale" },
      },
    }

    return configs[questionId]?.[fieldType] || { label: fieldType, placeholder: "" }
  }

  const config = getFieldConfig(questionId, fieldType)

  return (
    <div>
      <Label className="text-xs font-medium">{config.label}</Label>
      <Textarea
        placeholder={config.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1"
      />
    </div>
  )
}

export function CategoryEvaluation({ category, score, onScoreUpdate }: CategoryEvaluationProps) {
  const [benchmarkAnswers, setBenchmarkAnswers] = useState<Record<string, string>>({})
  const [processAnswers, setProcessAnswers] = useState<Record<string, string>>({})
  const [benchmarkSources, setBenchmarkSources] = useState<Record<string, Source[]>>({})
  const [processSources, setProcessSources] = useState<Record<string, DocumentationSource[]>>({})
  const [customFields, setCustomFields] = useState<Record<string, Record<string, string>>>({})

  useEffect(() => {
    if (score) {
      // This would be populated from saved data in a real implementation
      // For now, we'll calculate based on the scores
    }
  }, [score])

  const addSource = (questionId: string, section: "benchmark" | "process") => {
    if (section === "benchmark") {
      const newSource: Source = {
        id: Date.now().toString(),
        url: "",
        description: "",
        sourceType: "internal",
        score: "",
      }
      setBenchmarkSources((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newSource],
      }))
    } else {
      const newDocSource: DocumentationSource = {
        id: Date.now().toString(),
        url: "",
        description: "",
        sourceType: "internal",
        documentType: "",
      }
      setProcessSources((prev) => ({
        ...prev,
        [questionId]: [...(prev[questionId] || []), newDocSource],
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
    field: keyof (Source | DocumentationSource),
    value: string,
    section: "benchmark" | "process",
  ) => {
    if (section === "benchmark") {
      setBenchmarkSources((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || []).map((source) =>
          source.id === sourceId ? { ...source, [field]: value } : source,
        ),
      }))
    } else {
      setProcessSources((prev) => ({
        ...prev,
        [questionId]: (prev[questionId] || []).map((source) =>
          source.id === sourceId ? { ...source, [field]: value } : source,
        ),
      }))
    }
  }

  const updateCustomField = (questionId: string, fieldType: string, value: string) => {
    setCustomFields((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [fieldType]: value,
      },
    }))
  }

  const calculateScore = () => {
    const benchmarkScore = Object.values(benchmarkAnswers).filter((answer) => answer === "yes").length
    const processScore = Object.values(processAnswers).filter((answer) => answer === "yes").length
    const totalScore = benchmarkScore + processScore

    let status: CategoryScore["status"]
    if (totalScore >= 11) status = "strong"
    else if (totalScore >= 8) status = "adequate"
    else if (totalScore >= 5) status = "weak"
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
                    {question.customFields && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Structured Information</Label>
                        <div className="grid gap-3">
                          {question.customFields.map((fieldType) => (
                            <CustomFieldComponent
                              key={fieldType}
                              questionId={question.id}
                              fieldType={fieldType}
                              value={customFields[question.id]?.[fieldType] || ""}
                              onChange={(value) => updateCustomField(question.id, fieldType, value)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

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
                    {question.customFields && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Structured Information</Label>
                        <div className="grid gap-3">
                          {question.customFields.map((fieldType) => (
                            <CustomFieldComponent
                              key={fieldType}
                              questionId={question.id}
                              fieldType={fieldType}
                              value={customFields[question.id]?.[fieldType] || ""}
                              onChange={(value) => updateCustomField(question.id, fieldType, value)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Additional Documentation & Evidence</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSource(question.id, "process")}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Documentation
                      </Button>
                    </div>

                    {(processSources[question.id] || []).map((source, index) => (
                      <div key={source.id} className="space-y-3 p-3 border rounded-lg bg-background">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Document {index + 1}</span>
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
                              placeholder="Describe the documentation, policy, or process..."
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
                              <Label className="text-xs">Document Type</Label>
                              <Input
                                placeholder="e.g., Policy, Procedure, Report"
                                value={source.documentType || ""}
                                onChange={(e) =>
                                  updateSource(question.id, source.id, "documentType", e.target.value, "process")
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(processSources[question.id] || []).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Click "Add Documentation" to document policies and processes
                      </div>
                    )}
                  </div>
                )}

                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleSave} disabled={!isComplete} size="lg" className="w-full max-w-md">
            {score ? "Update" : "Save"} Category Evaluation
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
