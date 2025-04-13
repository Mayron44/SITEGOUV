import { NextResponse } from "next/server"

// Type pour la requête
interface SendMessageRequest {
  discordId: string
  content: string
  token: string
}

export async function POST(request: Request) {
  try {
    // Récupérer les données de la requête
    const { discordId, content, token }: SendMessageRequest = await request.json()

    // Vérifier que tous les champs requis sont présents
    if (!discordId || !content || !token) {
      return NextResponse.json({ success: false, error: "Paramètres manquants" }, { status: 400 })
    }

    // Étape 1: Créer un canal DM avec l'utilisateur
    const dmChannelResponse = await fetch(`https://discord.com/api/v10/users/@me/channels`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: discordId,
      }),
    })

    if (!dmChannelResponse.ok) {
      const errorData = await dmChannelResponse.json()
      return NextResponse.json(
        {
          success: false,
          error: `Erreur lors de la création du canal DM: ${dmChannelResponse.statusText}`,
          details: errorData,
        },
        { status: dmChannelResponse.status },
      )
    }

    const dmChannel = await dmChannelResponse.json()
    const channelId = dmChannel.id

    // Étape 2: Envoyer le message dans le canal DM
    const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: content,
      }),
    })

    if (!messageResponse.ok) {
      const errorData = await messageResponse.json()
      return NextResponse.json(
        {
          success: false,
          error: `Erreur lors de l'envoi du message: ${messageResponse.statusText}`,
          details: errorData,
        },
        { status: messageResponse.status },
      )
    }

    // Succès
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de l'envoi du message Discord:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 },
    )
  }
}
