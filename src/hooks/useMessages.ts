import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DbMessage } from "@/types/database";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      // Get distinct conversations with last message
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Group by conversation_id, take latest
      const convMap = new Map<string, DbMessage[]>();
      for (const msg of (data ?? []) as DbMessage[]) {
        const arr = convMap.get(msg.conversation_id) || [];
        arr.push(msg);
        convMap.set(msg.conversation_id, arr);
      }
      return Array.from(convMap.entries()).map(([id, msgs]) => ({
        id,
        messages: msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
        lastMessage: msgs[0],
        unread: msgs.filter(m => m.recipient_id === user.id && !m.read_at).length,
        otherUserId: msgs[0].sender_id === user.id ? msgs[0].recipient_id : msgs[0].sender_id,
      }));
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  const qc = useQueryClient();
  const [realtimeMessages, setRealtimeMessages] = useState<DbMessage[]>([]);

  const query = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DbMessage[];
    },
  });

  useEffect(() => {
    if (!conversationId) return;
    setRealtimeMessages([]);
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setRealtimeMessages(prev => [...prev, payload.new as DbMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const allMessages = [...(query.data ?? []), ...realtimeMessages.filter(rm => !(query.data ?? []).some(m => m.id === rm.id))];

  return { ...query, data: allMessages };
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: { conversation_id: string; recipient_id: string; content: string; property_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("messages").insert({
        ...msg,
        sender_id: user.id,
      } as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["conversations"] }); },
  });
}
