// AI Service for smart suggestions, summaries, and predictions
import { v4 as uuidv4 } from 'uuid';

export class AIService {
  constructor() {
    this.isEnabled = process.env.AI_ENABLED === 'true';
    this.apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    this.suggestions = new Map(); // Cache for AI suggestions
    this.summaries = new Map(); // Cache for meeting/chat summaries
  }

  // Generate smart task suggestions based on project context
  async generateTaskSuggestions(projectData, existingTasks = []) {
    try {
      if (!this.isEnabled) {
        return this.getFallbackTaskSuggestions(projectData);
      }

      const context = this.buildProjectContext(projectData, existingTasks);
      
      // Mock AI response for demo (in production, call actual AI API)
      const suggestions = this.generateMockTaskSuggestions(projectData);
      
      return {
        suggestions,
        confidence: 0.85,
        reasoning: "Based on project scope and common development practices",
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI task suggestion error:', error);
      return this.getFallbackTaskSuggestions(projectData);
    }
  }

  // Summarize meeting content
  async summarizeMeeting(meetingData) {
    try {
      if (!this.isEnabled) {
        return this.getFallbackMeetingSummary(meetingData);
      }

      const { transcript, duration, participants, agenda } = meetingData;
      
      // Mock AI response
      const summary = this.generateMockMeetingSummary(meetingData);
      
      // Cache the summary
      this.summaries.set(meetingData.id, summary);
      
      return summary;
    } catch (error) {
      console.error('AI meeting summary error:', error);
      return this.getFallbackMeetingSummary(meetingData);
    }
  }

  // Analyze project risks
  async analyzeProjectRisks(projectData, teamData) {
    try {
      const risks = this.assessProjectRisks(projectData, teamData);
      
      return {
        riskScore: risks.overall,
        risks: risks.details,
        recommendations: risks.recommendations,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI risk analysis error:', error);
      return { riskScore: 0, risks: [], recommendations: [] };
    }
  }

  // Generate team health insights
  async generateHealthInsights(teamData, workSessions = []) {
    try {
      const insights = this.analyzeTeamHealth(teamData, workSessions);
      
      return {
        overallHealth: insights.score,
        insights: insights.findings,
        recommendations: insights.suggestions,
        trends: insights.trends,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('AI health insights error:', error);
      return { overallHealth: 'good', insights: [], recommendations: [] };
    }
  }

  // Smart deadline predictions
  async predictDeadlines(taskData, teamVelocity) {
    try {
      const predictions = this.calculateDeadlinePredictions(taskData, teamVelocity);
      
      return {
        predictedCompletion: predictions.estimated,
        confidence: predictions.confidence,
        factors: predictions.influencingFactors,
        recommendations: predictions.recommendations
      };
    } catch (error) {
      console.error('AI deadline prediction error:', error);
      return null;
    }
  }

  // Generate next step suggestions
  async generateNextSteps(projectContext) {
    try {
      const steps = this.analyzeNextSteps(projectContext);
      
      return {
        immediate: steps.immediate,
        shortTerm: steps.shortTerm,
        longTerm: steps.longTerm,
        priorityOrder: steps.priority
      };
    } catch (error) {
      console.error('AI next steps error:', error);
      return { immediate: [], shortTerm: [], longTerm: [] };
    }
  }

  // Helper method to build project context for AI
  buildProjectContext(projectData, existingTasks) {
    return {
      projectName: projectData.name,
      description: projectData.description,
      phase: projectData.status,
      teamSize: projectData.teamSize || 3,
      deadline: projectData.due_date,
      existingTasks: existingTasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority
      }))
    };
  }

  // Generate mock task suggestions (replace with real AI in production)
  generateMockTaskSuggestions(projectData) {
    const templates = {
      'PulseCollab Platform': [
        {
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment',
          priority: 'high',
          estimatedHours: 8,
          category: 'DevOps'
        },
        {
          title: 'Implement user analytics dashboard',
          description: 'Create analytics views for user engagement tracking',
          priority: 'medium',
          estimatedHours: 16,
          category: 'Analytics'
        },
        {
          title: 'Add mobile responsive design',
          description: 'Optimize UI for mobile devices',
          priority: 'medium',
          estimatedHours: 12,
          category: 'Frontend'
        }
      ],
      'default': [
        {
          title: 'Define project requirements',
          description: 'Document detailed project specifications',
          priority: 'high',
          estimatedHours: 4,
          category: 'Planning'
        },
        {
          title: 'Create project timeline',
          description: 'Break down project into phases with deadlines',
          priority: 'high',
          estimatedHours: 3,
          category: 'Planning'
        },
        {
          title: 'Set up development environment',
          description: 'Configure tools and dependencies',
          priority: 'medium',
          estimatedHours: 6,
          category: 'Setup'
        }
      ]
    };

    return templates[projectData.name] || templates.default;
  }

  // Generate mock meeting summary
  generateMockMeetingSummary(meetingData) {
    return {
      id: uuidv4(),
      meetingId: meetingData.id,
      title: meetingData.title || 'Team Meeting',
      summary: `Meeting focused on ${meetingData.agenda || 'project progress and planning'}. Key decisions were made regarding next steps and resource allocation.`,
      keyPoints: [
        'Reviewed current project status and milestones',
        'Discussed upcoming deadlines and priorities',
        'Allocated tasks among team members',
        'Identified potential blockers and solutions'
      ],
      actionItems: [
        {
          task: 'Follow up on pending requirements',
          assignee: 'Team Lead',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
        },
        {
          task: 'Schedule technical review session',
          assignee: 'Developer',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        }
      ],
      decisions: [
        'Approved proposed architecture changes',
        'Agreed on weekly sprint review schedule'
      ],
      nextMeeting: {
        suggestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        agenda: 'Review action item progress and plan next sprint'
      },
      sentiment: 'positive',
      participationScore: 8.5,
      createdAt: new Date()
    };
  }

  // Assess project risks using heuristics
  assessProjectRisks(projectData, teamData) {
    const risks = [];
    let overallScore = 0;

    // Timeline risk
    if (projectData.due_date) {
      const daysUntilDeadline = Math.ceil((new Date(projectData.due_date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilDeadline < 7) {
        risks.push({
          type: 'timeline',
          severity: 'high',
          description: 'Project deadline is approaching rapidly',
          impact: 'May result in delayed delivery or reduced scope'
        });
        overallScore += 30;
      }
    }

    // Team capacity risk
    if (teamData.members && teamData.members.length < 3) {
      risks.push({
        type: 'capacity',
        severity: 'medium',
        description: 'Small team size may limit capacity',
        impact: 'Potential bottlenecks in development'
      });
      overallScore += 15;
    }

    // Progress risk
    if (projectData.progress_percent < 20 && daysUntilDeadline < 30) {
      risks.push({
        type: 'progress',
        severity: 'high',
        description: 'Low progress relative to time remaining',
        impact: 'High risk of missing deadline'
      });
      overallScore += 25;
    }

    const recommendations = this.generateRiskRecommendations(risks);

    return {
      overall: Math.min(overallScore, 100),
      details: risks,
      recommendations
    };
  }

  generateRiskRecommendations(risks) {
    const recommendations = [];

    risks.forEach(risk => {
      switch (risk.type) {
        case 'timeline':
          recommendations.push('Consider reducing scope or extending deadline');
          recommendations.push('Implement daily standups to track progress');
          break;
        case 'capacity':
          recommendations.push('Consider adding team members or external resources');
          recommendations.push('Prioritize critical features for MVP');
          break;
        case 'progress':
          recommendations.push('Schedule emergency planning session');
          recommendations.push('Identify and remove blockers immediately');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  // Analyze team health using work patterns
  analyzeTeamHealth(teamData, workSessions) {
    const findings = [];
    const suggestions = [];
    let score = 85; // Default good health score

    // Analyze work patterns
    const avgHoursPerDay = this.calculateAverageWorkHours(workSessions);
    
    if (avgHoursPerDay > 10) {
      findings.push('Team showing signs of overwork');
      suggestions.push('Schedule mandatory breaks and limit overtime');
      score -= 15;
    } else if (avgHoursPerDay < 6) {
      findings.push('Team engagement may be low');
      suggestions.push('Check for blockers or motivation issues');
      score -= 10;
    }

    // Analyze communication patterns
    if (teamData.recentMessages < 20) {
      findings.push('Low communication activity detected');
      suggestions.push('Encourage more frequent updates and collaboration');
      score -= 8;
    }

    return {
      score: Math.max(score, 0),
      findings,
      suggestions,
      trends: ['stable', 'improving', 'concerning'][Math.floor(Math.random() * 3)]
    };
  }

  calculateAverageWorkHours(workSessions) {
    if (!workSessions.length) return 8;
    
    const totalHours = workSessions.reduce((sum, session) => {
      return sum + (session.duration_minutes / 60);
    }, 0);
    
    return totalHours / Math.max(workSessions.length, 1);
  }

  // Fallback suggestions when AI is not available
  getFallbackTaskSuggestions(projectData) {
    return {
      suggestions: this.generateMockTaskSuggestions(projectData),
      confidence: 0.6,
      reasoning: "Based on common project patterns",
      timestamp: new Date()
    };
  }

  getFallbackMeetingSummary(meetingData) {
    return {
      id: uuidv4(),
      meetingId: meetingData.id,
      title: meetingData.title || 'Team Meeting',
      summary: 'Meeting summary unavailable - AI service not configured',
      keyPoints: ['Meeting completed successfully'],
      actionItems: [],
      decisions: [],
      sentiment: 'neutral',
      createdAt: new Date()
    };
  }

  // Calculate deadline predictions based on velocity
  calculateDeadlinePredictions(taskData, teamVelocity) {
    const remainingEffort = taskData.filter(t => t.status !== 'completed')
      .reduce((sum, task) => sum + (task.estimate_hours || 4), 0);
    
    const weeklyVelocity = teamVelocity.averageHoursPerWeek || 40;
    const weeksToComplete = Math.ceil(remainingEffort / weeklyVelocity);
    
    const estimatedCompletion = new Date();
    estimatedCompletion.setDate(estimatedCompletion.getDate() + (weeksToComplete * 7));
    
    return {
      estimated: estimatedCompletion,
      confidence: 0.75,
      influencingFactors: ['Team velocity', 'Task complexity', 'Available capacity'],
      recommendations: weeksToComplete > 4 ? 
        ['Consider parallel development', 'Add resources if possible'] :
        ['Current pace looks sustainable']
    };
  }

  // Analyze next steps based on project state
  analyzeNextSteps(projectContext) {
    const { completedTasks, pendingTasks, blockers } = projectContext;
    
    return {
      immediate: [
        'Review and resolve any blockers',
        'Update task status and progress',
        'Communicate with stakeholders'
      ],
      shortTerm: [
        'Plan next sprint/iteration',
        'Conduct code reviews',
        'Update documentation'
      ],
      longTerm: [
        'Prepare for testing phase',
        'Plan deployment strategy',
        'Gather user feedback'
      ],
      priority: ['blockers', 'critical_path', 'dependencies', 'optimization']
    };
  }

  // Get cached or generate new AI insights
  async getCachedInsights(key, generator) {
    if (this.suggestions.has(key)) {
      const cached = this.suggestions.get(key);
      // Return cached if less than 1 hour old
      if (Date.now() - cached.timestamp < 3600000) {
        return cached.data;
      }
    }
    
    const insights = await generator();
    this.suggestions.set(key, {
      data: insights,
      timestamp: Date.now()
    });
    
    return insights;
  }

  // Clear old cached data
  clearOldCache() {
    const oneHourAgo = Date.now() - 3600000;
    
    for (const [key, value] of this.suggestions) {
      if (value.timestamp < oneHourAgo) {
        this.suggestions.delete(key);
      }
    }
    
    for (const [key, value] of this.summaries) {
      if (value.timestamp < oneHourAgo) {
        this.summaries.delete(key);
      }
    }
  }
}

export const aiService = new AIService();
