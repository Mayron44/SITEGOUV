import { supabase } from "../lib/supabase"

// Fonction pour initialiser la base de données
async function initDatabase() {
  console.log("Initialisation de la base de données Supabase...")

  // Création de la table users si elle n'existe pas déjà
  const { error: usersError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "users",
    table_definition: `
      id uuid primary key references auth.users on delete cascade,
      username text not null,
      role text not null,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    `,
  })

  if (usersError) {
    console.error("Erreur lors de la création de la table users:", usersError)
  } else {
    console.log("Table users créée ou déjà existante")
  }

  // Création de la table site_content si elle n'existe pas déjà
  const { error: contentError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "site_content",
    table_definition: `
      id serial primary key,
      page_id text not null unique,
      content jsonb not null,
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now()
    `,
  })

  if (contentError) {
    console.error("Erreur lors de la création de la table site_content:", contentError)
  } else {
    console.log("Table site_content créée ou déjà existante")
  }

  // Création de la table newsletter_subscribers si elle n'existe pas déjà
  const { error: subscribersError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "newsletter_subscribers",
    table_definition: `
      id serial primary key,
      email text not null unique,
      name text,
      subscribed_at timestamp with time zone default now(),
      is_active boolean default true
    `,
  })

  if (subscribersError) {
    console.error("Erreur lors de la création de la table newsletter_subscribers:", subscribersError)
  } else {
    console.log("Table newsletter_subscribers créée ou déjà existante")
  }

  // Création de la table newsletters si elle n'existe pas déjà
  const { error: newslettersError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "newsletters",
    table_definition: `
      id serial primary key,
      title text not null,
      content text not null,
      created_at timestamp with time zone default now(),
      sent_at timestamp with time zone,
      created_by uuid references auth.users
    `,
  })

  if (newslettersError) {
    console.error("Erreur lors de la création de la table newsletters:", newslettersError)
  } else {
    console.log("Table newsletters créée ou déjà existante")
  }

  // Création de la table tasks si elle n'existe pas déjà
  const { error: tasksError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "tasks",
    table_definition: `
      id serial primary key,
      title text not null,
      description text,
      status text not null default 'pending',
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now(),
      user_id uuid references auth.users
    `,
  })

  if (tasksError) {
    console.error("Erreur lors de la création de la table tasks:", tasksError)
  } else {
    console.log("Table tasks créée ou déjà existante")
  }

  // Création de la table events si elle n'existe pas déjà
  const { error: eventsError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "events",
    table_definition: `
      id serial primary key,
      title text not null,
      description text,
      start_date timestamp with time zone not null,
      end_date timestamp with time zone,
      location text,
      created_at timestamp with time zone default now(),
      user_id uuid references auth.users
    `,
  })

  if (eventsError) {
    console.error("Erreur lors de la création de la table events:", eventsError)
  } else {
    console.log("Table events créée ou déjà existante")
  }

  // Création de la table resources si elle n'existe pas déjà
  const { error: resourcesError } = await supabase.rpc("create_table_if_not_exists", {
    table_name: "resources",
    table_definition: `
      id serial primary key,
      title text not null,
      description text,
      url text,
      file_path text,
      category text,
      created_at timestamp with time zone default now(),
      user_id uuid references auth.users
    `,
  })

  if (resourcesError) {
    console.error("Erreur lors de la création de la table resources:", resourcesError)
  } else {
    console.log("Table resources créée ou déjà existante")
  }

  console.log("Initialisation de la base de données terminée")
}

// Exécution de la fonction d'initialisation
initDatabase().catch((error) => {
  console.error("Erreur lors de l'initialisation de la base de données:", error)
})
