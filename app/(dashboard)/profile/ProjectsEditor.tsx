'use client'

import { useState } from 'react'

interface Project {
  title: string
  description: string
  tech: string
}

interface Props {
  initial: { title: string; description: string; tech: string[] }[]
}

export function ProjectsEditor({ initial }: Props) {
  const [projects, setProjects] = useState<Project[]>(
    initial.length > 0
      ? initial.map(p => ({ title: p.title, description: p.description, tech: p.tech?.join(', ') ?? '' }))
      : [{ title: '', description: '', tech: '' }]
  )

  function addProject() {
    setProjects(prev => [...prev, { title: '', description: '', tech: '' }])
  }

  function removeProject(index: number) {
    setProjects(prev => prev.filter((_, i) => i !== index))
  }

  function update(index: number, field: keyof Project, value: string) {
    setProjects(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-zinc-400">Projects</label>
        <button
          type="button"
          onClick={addProject}
          className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1 rounded-lg transition"
        >
          + Add project
        </button>
      </div>

      <div className="space-y-4">
        {projects.map((project, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">Project {i + 1}</span>
              {projects.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProject(i)}
                  className="text-xs text-zinc-600 hover:text-red-400 transition"
                >
                  Remove
                </button>
              )}
            </div>

            <input
              name="project_title"
              value={project.title}
              onChange={e => update(i, 'title', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
              placeholder="Project name e.g. PersonaPage"
            />
            <textarea
              name="project_description"
              value={project.description}
              onChange={e => update(i, 'description', e.target.value)}
              rows={2}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition resize-none"
              placeholder="What does it do? What problem does it solve?"
            />
            <input
              name="project_tech"
              value={project.tech}
              onChange={e => update(i, 'tech', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition"
              placeholder="Tech used e.g. Next.js, Supabase, OpenAI"
            />
          </div>
        ))}
      </div>

      <p className="text-zinc-600 text-xs mt-2">
        Add all your key projects — the AI uses these to tailor your profile for each context
      </p>
    </div>
  )
}
