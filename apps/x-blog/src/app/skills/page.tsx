'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import {
  SparklesIcon, MagnifyingGlassIcon, BookOpenIcon,
  WrenchIcon, RocketLaunchIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline'

const SKILLS_DATA = [
  { name: 'agent-eval', description: 'Head-to-head comparison of coding agents on custom tasks with pass rate, cost, time, and consistency metrics', category: 'Testing' },
  { name: 'agent-harness-construction', description: 'Design and optimize AI agent action spaces, tool definitions, and observation formatting', category: 'Agent' },
  { name: 'agentic-engineering', description: 'Operate as an agentic engineer using eval-first execution, decomposition, and cost-aware model routing', category: 'Agent' },
  { name: 'agent-payment-x402', description: 'Add x402 payment execution to AI agents — per-task budgets, spending controls, and non-custodial wallets', category: 'Agent' },
  { name: 'ai-first-engineering', description: 'Engineering operating model for teams where AI agents generate a large share of implementation output', category: 'Process' },
  { name: 'ai-regression-testing', description: 'Regression testing strategies for AI-assisted development. Sandbox-mode API testing without database', category: 'Testing' },
  { name: 'android-clean-architecture', description: 'Clean Architecture patterns for Android and Kotlin Multiplatform projects', category: 'Architecture' },
  { name: 'api-design', description: 'REST API design patterns including resource naming, status codes, pagination, filtering, error responses', category: 'Backend' },
  { name: 'architecture-decision-records', description: 'Capture architectural decisions made during Claude Code sessions as structured ADRs', category: 'Documentation' },
  { name: 'article-writing', description: 'Write articles, guides, blog posts, tutorials, newsletter issues, and other long-form content', category: 'Content' },
  { name: 'autonomous-loops', description: 'Patterns and architectures for autonomous Claude Code loops — from simple pipelines to production agents', category: 'Agent' },
  { name: 'backend-patterns', description: 'Backend architecture patterns, API design, database optimization, and server-side best practices', category: 'Backend' },
  { name: 'benchmark', description: 'Measure performance baselines, detect regressions before/after PRs, and compare strategies', category: 'Testing' },
  { name: 'blueprint', description: 'System architecture planning and design patterns for large-scale applications', category: 'Architecture' },
  { name: 'browser-qa', description: 'Automate visual testing and UI interaction verification using browser automation', category: 'Testing' },
  { name: 'bun-runtime', description: 'Bun as runtime, package manager, bundler, and test runner. Migration from Node.js', category: 'Backend' },
  { name: 'canary-watch', description: 'Monitor a deployed URL for regressions after deploys, merges, or dependency upgrades', category: 'DevOps' },
  { name: 'claude-api', description: 'Anthropic Claude API patterns for Python and TypeScript. Covers Messages API, streaming, tool use', category: 'API' },
  { name: 'claude-devfleet', description: 'Orchestrate multi-agent coding tasks via Claude DevFleet — plan projects, dispatch parallel agents', category: 'Agent' },
  { name: 'clickhouse-io', description: 'ClickHouse database patterns, query optimization, analytics, and data engineering', category: 'Database' },
  { name: 'codebase-onboarding', description: 'Analyze an unfamiliar codebase and generate a structured onboarding guide', category: 'Documentation' },
  { name: 'coding-standards', description: 'Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React', category: 'Standards' },
  { name: 'context-budget', description: 'Audit Claude Code context window consumption across agents, skills, MCP servers, and rules', category: 'Optimization' },
  { name: 'cost-aware-llm-pipeline', description: 'Build cost-effective LLM pipelines with smart routing, caching, and budget controls', category: 'Optimization' },
  { name: 'database-migrations', description: 'Schema migration strategies for SQL and NoSQL databases with zero-downtime patterns', category: 'Database' },
  { name: 'deep-research', description: 'Conduct thorough research on any topic using web search, summarization, and synthesis', category: 'Research' },
  { name: 'deployment-patterns', description: 'Deploy applications using modern patterns — containers, serverless, edge computing', category: 'DevOps' },
  { name: 'docker-patterns', description: 'Docker best practices, multi-stage builds, security hardening, and compose orchestration', category: 'DevOps' },
  { name: 'documentation-lookup', description: 'Find and synthesize documentation from web search to code examples', category: 'Research' },
  { name: 'evaluate-test', description: 'Write comprehensive tests — unit, integration, e2e — with coverage analysis', category: 'Testing' },
  { name: 'function-calling', description: 'Design and implement function calling patterns for Claude with schema validation', category: 'API' },
  { name: 'git-workflows', description: 'Git branching strategies, commit conventions, code review, and merge conflict resolution', category: 'VCS' },
  { name: 'context-management', description: 'Manage context window efficiently with summarization, compression, and prioritization', category: 'Optimization' },
  { name: 'incident-response', description: 'Respond to production incidents with runbooks, postmortems, and blameless analysis', category: 'DevOps' },
  { name: 'javascript-pro', description: 'Advanced JavaScript patterns, async patterns, memory management, and performance', category: 'Frontend' },
  { name: 'json-schema', description: 'Design and validate JSON schemas for APIs, configuration, and data interchange', category: 'Standards' },
  { name: 'llm-evaluation', description: 'Evaluate LLM outputs using automated metrics, human feedback, and red-teaming', category: 'AI' },
  { name: 'memory-management', description: 'Implement persistent memory systems for AI agents with semantic search', category: 'Agent' },
  { name: 'mcp-servers', description: 'Build and integrate MCP servers for extending Claude with custom tools', category: 'Integration' },
  { name: 'nextjs-pro', description: 'Next.js advanced patterns — App Router, Server Components, streaming, caching', category: 'Frontend' },
  { name: 'openapi-spec', description: 'Design and document REST APIs with OpenAPI/Swagger specifications', category: 'API' },
  { name: 'playwright-testing', description: 'End-to-end testing with Playwright — selectors, assertions, CI integration', category: 'Testing' },
  { name: 'prompt-engineering', description: 'Craft effective prompts for Claude — context, examples, constraints, iteration', category: 'AI' },
  { name: 'python-pro', description: 'Advanced Python patterns, async programming, type hints, and performance optimization', category: 'Backend' },
  { name: 'react-performance', description: 'Optimize React apps — rendering, bundle size, state management, lazy loading', category: 'Frontend' },
  { name: 'security-audit', description: 'Security review patterns for code — OWASP Top 10, secrets detection, dependency audit', category: 'Security' },
  { name: 'sql-optimization', description: 'Optimize SQL queries, indexes, query plans, and database performance tuning', category: 'Database' },
  { name: 'system-design', description: 'Design scalable systems — load balancing, caching, microservices, event-driven', category: 'Architecture' },
  { name: 'test-driven-development', description: 'TDD practices with red-green-refactor cycles and mock patterns', category: 'Testing' },
  { name: 'typescript-pro', description: 'Advanced TypeScript — generics, conditional types, decorators, performance', category: 'Standards' },
  { name: 'vector-databases', description: 'Implement vector similarity search with embeddings for AI applications', category: 'AI' },
  { name: 'web-security', description: 'Web application security — XSS, CSRF, injection, authentication patterns', category: 'Security' },
  { name: 'workflow-automation', description: 'Automate workflows using scheduling, webhooks, and event-driven architectures', category: 'DevOps' },
]

// Dark-compatible category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Agent':         'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  'AI':            'bg-pink-500/10 text-pink-300 border border-pink-500/20',
  'Testing':       'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'Backend':       'bg-green-500/10 text-green-300 border border-green-500/20',
  'Frontend':      'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  'Database':      'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  'DevOps':        'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  'Architecture':  'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  'Security':      'bg-red-500/10 text-red-300 border border-red-500/20',
  'API':           'bg-teal-500/10 text-teal-300 border border-teal-500/20',
  'Standards':     'bg-white/5 text-slate-300 border border-white/10',
  'Documentation': 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  'Content':       'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  'Process':       'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'Optimization':  'bg-lime-500/10 text-lime-300 border border-lime-500/20',
  'Research':      'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  'Integration':   'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20',
  'VCS':           'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
}

function getCategoryClass(c: string) {
  return CATEGORY_COLORS[c] || 'bg-white/5 text-slate-400 border border-white/10'
}

function SkillCard({
  skill, isSelected, onClick,
}: {
  skill: (typeof SKILLS_DATA)[0]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 text-left transition-all duration-150"
      style={{
        borderBottom: '1px solid var(--bd)',
        background: isSelected ? 'var(--ac-dim)' : 'transparent',
        borderLeft: isSelected ? '2px solid var(--ac)' : '2px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-h)'
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-medium text-sm font-mono"
          style={{ color: isSelected ? 'var(--ac)' : 'var(--t1)' }}
        >
          {skill.name}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryClass(skill.category)}`}>
          {skill.category}
        </span>
      </div>
      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--t3)' }}>
        {skill.description}
      </p>
    </button>
  )
}

function SkillDetail({ skill }: { skill: (typeof SKILLS_DATA)[0] }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--ac-dim)', border: '1px solid rgba(240,54,104,0.2)' }}
        >
          <SparklesIcon className="w-6 h-6" style={{ color: 'var(--ac)' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-1 font-mono" style={{ color: 'var(--t1)' }}>
            {skill.name}
          </h2>
          <span className={`px-2.5 py-1 rounded-full text-xs ${getCategoryClass(skill.category)}`}>
            {skill.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--t2)' }}>
        {skill.description}
      </p>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpenIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium" style={{ color: 'var(--t2)' }}>分类</span>
          </div>
          <span className={`px-2 py-0.5 rounded-lg text-xs ${getCategoryClass(skill.category)}`}>
            {skill.category}
          </span>
        </div>
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <WrenchIcon className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium" style={{ color: 'var(--t2)' }}>调用方式</span>
          </div>
          <code
            className="text-xs font-mono"
            style={{ color: 'var(--ac)' }}
          >
            /skill {skill.name}
          </code>
        </div>
      </div>

      {/* How to Use */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: 'var(--t1)' }}>
          <RocketLaunchIcon className="w-4 h-4" style={{ color: 'var(--ac)' }} />
          如何使用
        </h3>
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--bd)' }}
        >
          <div>
            <p className="text-xs mb-1.5" style={{ color: 'var(--t2)' }}>1. 安装</p>
            <code
              className="block rounded-lg p-2.5 text-xs font-mono"
              style={{ background: 'var(--bg-base)', color: 'var(--ac)', border: '1px solid var(--bd)' }}
            >
              skillhub install {skill.name}
            </code>
          </div>
          <div>
            <p className="text-xs mb-1.5" style={{ color: 'var(--t2)' }}>2. 激活</p>
            <code
              className="block rounded-lg p-2.5 text-xs font-mono"
              style={{ background: 'var(--bg-base)', color: 'var(--ac)', border: '1px solid var(--bd)' }}
            >
              /skill {skill.name}
            </code>
          </div>
        </div>
      </div>

      {/* External Link */}
      <a
        href={`https://github.com/skill-clawn/everything-claude-code/tree/main/skills/${skill.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group/link"
        style={{ color: 'var(--ac)' }}
      >
        <span>查看完整文档</span>
        <ArrowRightIcon className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
      </a>
    </div>
  )
}

export default function SkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState(SKILLS_DATA[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filteredSkills = SKILLS_DATA.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!mounted) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div
            className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"
            style={{ borderColor: 'var(--ac)', borderTopColor: 'transparent' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Navbar />

      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--bd)' }}>
        <div className="max-w-full mx-auto px-4 py-5">
          <div className="flex items-center gap-2.5 mb-1">
            <SparklesIcon className="w-5 h-5" style={{ color: 'var(--ac)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--t1)' }}>Skill 相关</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--t2)' }}>
            {SKILLS_DATA.length} 个精选 Skills · 持续更新
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 py-6">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--bd)' }}
        >
          {/* Search */}
          <div className="p-4" style={{ borderBottom: '1px solid var(--bd)' }}>
            <div className="relative">
              <MagnifyingGlassIcon
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--t3)' }}
              />
              <input
                type="text"
                placeholder="搜索 skills…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </div>
          </div>

          {/* Split layout */}
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left — list */}
            <div
              className="border-r overflow-y-auto max-h-[65vh]"
              style={{ borderColor: 'var(--bd)' }}
            >
              {filteredSkills.length === 0 ? (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--t3)' }}>
                  没有匹配的 skill
                </div>
              ) : (
                filteredSkills.map(skill => (
                  <SkillCard
                    key={skill.name}
                    skill={skill}
                    isSelected={selectedSkill.name === skill.name}
                    onClick={() => setSelectedSkill(skill)}
                  />
                ))
              )}
            </div>

            {/* Right — detail */}
            <div className="p-5 overflow-y-auto max-h-[65vh]">
              <SkillDetail skill={selectedSkill} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
