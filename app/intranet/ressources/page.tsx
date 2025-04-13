"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { type Resource, addResource, deleteResource, getResources, moveResource } from "@/lib/resource-service"
import { ArrowUp, ArrowDown, Trash2, ExternalLink, Plus } from "lucide-react"

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    type: "link",
  })
  const [loading, setLoading] = useState(true)

  // Charger les ressources au chargement de la page
  useEffect(() => {
    async function loadResources() {
      setLoading(true)
      const data = await getResources()
      setResources(data)
      setLoading(false)
    }

    loadResources()
  }, [])

  // Gérer l'ajout d'une ressource
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newResource.title || !newResource.url) return

    const resource = await addResource(newResource.title, newResource.url, newResource.type)
    if (resource) {
      setResources([...resources, resource])
      setNewResource({
        title: "",
        url: "",
        type: "link",
      })
    }
  }

  // Gérer la suppression d'une ressource
  const handleDeleteResource = async (id: string) => {
    const success = await deleteResource(id)
    if (success) {
      setResources(resources.filter((r) => r.id !== id))
    }
  }

  // Gérer le déplacement d'une ressource
  const handleMoveResource = async (id: string, direction: "up" | "down") => {
    const success = await moveResource(id, direction)
    if (success) {
      const data = await getResources()
      setResources(data)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Ressources</h1>

      {/* Formulaire d'ajout de ressource */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Ajouter une ressource</h2>
        <form onSubmit={handleAddResource} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              id="title"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={newResource.url}
              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="w-[150px]">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={newResource.type}
              onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="link">Lien</option>
              <option value="document">Document</option>
              <option value="video">Vidéo</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* Liste des ressources */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Liste des ressources</h2>
        </div>
        {loading ? (
          <div className="p-4 text-center">Chargement...</div>
        ) : resources.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Aucune ressource disponible</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {resource.title}
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </td>
                    <td className="px-4 py-3 capitalize">{resource.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMoveResource(resource.id, "up")}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          aria-label="Monter"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleMoveResource(resource.id, "down")}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          aria-label="Descendre"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="p-1 text-gray-600 hover:text-red-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
