import { getSupabase } from "./supabase";
import { getCurrentUser } from "./auth-service";

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  order: number;
  user_id: string;
  created_at: string;
}

// Fonction pour récupérer toutes les ressources
export async function getResources(): Promise<Resource[]> {
  const supabase = getSupabase();

  try {
    let resources: Resource[] = [];
    const localStorageKey = "resources";

    try {
      const storedResources = localStorage.getItem(localStorageKey);
      if (storedResources) {
        resources = JSON.parse(storedResources);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des ressources depuis localStorage:", error);
    }

    if (resources.length === 0) {
      try {
        const { data, error } = await supabase.from("resources").select("*").order("order", { ascending: true });

        if (error) {
          console.error("Erreur lors de la récupération des ressources depuis Supabase:", error);
          return [];
        }

        if (data) {
          try {
            localStorage.setItem(localStorageKey, JSON.stringify(data));
          } catch (error) {
            console.error("Erreur lors de la mise à jour de localStorage:", error);
          }

          return data;
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des ressources depuis Supabase:", error);
      }
    }

    return resources;
  } catch (error) {
    console.error("Erreur lors de la récupération des ressources:", error);
    return [];
  }
}

// Fonction pour ajouter une ressource
export async function addResource(title: string, url: string, type: string): Promise<Resource | null> {
  const supabase = getSupabase();

  try {
    const user = getCurrentUser();
    if (!user) return null;

    const existingResources = await getResources();
    const order = existingResources.length;

    const newResource = {
      title,
      url,
      type,
      order,
      user_id: user.id,
    };

    try {
      const { data, error } = await supabase.from("resources").insert(newResource).select().single();

      if (error) {
        console.error("Erreur lors de l'ajout de la ressource à Supabase:", error);
      } else if (data) {
        try {
          localStorage.setItem("resources", JSON.stringify([...existingResources, data]));
        } catch (error) {
          console.error("Erreur lors de la mise à jour de localStorage:", error);
        }
        return data;
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de la ressource à Supabase:", error);
    }

    const localId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const localResource: Resource = {
      ...newResource,
      id: localId,
      created_at: new Date().toISOString(),
    };

    try {
      localStorage.setItem("resources", JSON.stringify([...existingResources, localResource]));
    } catch (error) {
      console.error("Erreur lors de l'ajout de la ressource à localStorage:", error);
    }

    return localResource;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la ressource:", error);
    return null;
  }
}

// Fonction pour supprimer une ressource
export async function deleteResource(resourceId: string): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const user = getCurrentUser();
    if (!user) return false;

    const resources = await getResources();
    const updatedResources = resources.filter((r) => r.id !== resourceId);

    const reorderedResources = updatedResources.map((resource, index) => ({
      ...resource,
      order: index,
    }));

    try {
      localStorage.setItem("resources", JSON.stringify(reorderedResources));
    } catch (error) {
      console.error("Erreur lors de la mise à jour de localStorage:", error);
    }

    if (!resourceId.startsWith("local-")) {
      try {
        const { error } = await supabase.from("resources").delete().eq("id", resourceId);

        if (error) {
          console.error("Erreur lors de la suppression de la ressource de Supabase:", error);
        } else {
          const supabaseResources = reorderedResources.filter((r) => !r.id.startsWith("local-"));

          for (const resource of supabaseResources) {
            const { error: updateError } = await supabase
              .from("resources")
              .update({ order: resource.order })
              .eq("id", resource.id);

            if (updateError) {
              console.error(`Erreur lors de la mise à jour de l'ordre pour la ressource ${resource.id}:`, updateError);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la ressource de Supabase:", error);
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la ressource:", error);
    return false;
  }
}

// Fonction pour déplacer une ressource vers le haut ou vers le bas
export async function moveResource(resourceId: string, direction: "up" | "down"): Promise<boolean> {
  const supabase = getSupabase();

  try {
    const resources = await getResources();
    if (!resources || resources.length === 0) return false;

    const index = resources.findIndex((r) => r.id === resourceId);
    if (index === -1) return false;

    if (direction === "up" && index === 0) return false;
    if (direction === "down" && index === resources.length - 1) return false;

    const newResources = [...resources];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    const tempOrder = newResources[index].order;
    newResources[index].order = newResources[swapIndex].order;
    newResources[swapIndex].order = tempOrder;

    [newResources[index], newResources[swapIndex]] = [newResources[swapIndex], newResources[index]];

    try {
      localStorage.setItem("resources", JSON.stringify(newResources));
    } catch (error) {
      console.error("Erreur lors de la mise à jour des ressources dans localStorage:", error);
    }

    const resource1 = newResources[index];
    const resource2 = newResources[swapIndex];

    if (!resource1.id.startsWith("local-")) {
      try {
        const { error: updateError1 } = await supabase
          .from("resources")
          .update({ order: resource1.order })
          .eq("id", resource1.id);

        if (updateError1) {
          console.error(`Erreur lors de la mise à jour de l'ordre pour la ressource ${resource1.id}:`, updateError1);
        }
      } catch (error) {
        console.error(`Erreur lors de la mise à jour de la ressource ${resource1.id}:`, error);
      }
    }

    if (!resource2.id.startsWith("local-")) {
      try {
        const { error: updateError2 } = await supabase
          .from("resources")
          .update({ order: resource2.order })
          .eq("id", resource2.id);

        if (updateError2) {
          console.error(`Erreur lors de la mise à jour de l'ordre pour la ressource ${resource2.id}:`, updateError2);
        }
      } catch (error) {
        console.error(`Erreur lors de la mise à jour de la ressource ${resource2.id}:`, error);
      }
    }

    return true;
  } catch (error) {
    console.error("Erreur lors du déplacement de la ressource:", error);
    return false;
  }
}
