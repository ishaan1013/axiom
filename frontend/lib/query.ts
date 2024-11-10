import {
  getWorkspaces,
  createWorkspace,
  removeCollaborator,
  deleteInvite,
  respondToInvite,
  getFiles,
  deleteWorkspace,
} from "@/lib/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Collaborator, Invite, FilesResponse, Workspace } from "./types";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useWorkspaces(userId: string) {
  return useQuery({
    queryKey: ["workspaces", userId],
    queryFn: () => getWorkspaces(userId),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; assignmentId: string }) =>
      createWorkspace(data.userId, data.assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export const getCollaborators = async (workspaceId: string, userId: string) => {
  const res = await fetch(
    `${API_BASE_URL}/api/workspaces/${workspaceId}/users?userId=${userId}`
  );
  if (!res.ok) throw new Error("Failed to fetch collaborators");
  return res.json();
};

export const getInvites = async (workspaceId: string) => {
  const res = await fetch(
    `${API_BASE_URL}/api/workspaces/${workspaceId}/invites`
  );
  if (!res.ok) throw new Error("Failed to fetch invites");
  return res.json();
};

export function useRemoveCollaborator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; workspaceId: string }) =>
      removeCollaborator(data.userId, data.workspaceId),
    onMutate: async ({ userId, workspaceId }) => {
      await queryClient.cancelQueries({
        queryKey: ["collaborators", workspaceId],
      });
      const previousCollaborators = queryClient.getQueryData<Collaborator[]>([
        "collaborators",
        workspaceId,
      ]);
      queryClient.setQueryData<Collaborator[]>(
        ["collaborators", workspaceId],
        (old = []) => old.filter((c) => c.id !== userId)
      );
      return { previousCollaborators };
    },
    onError: (err, { workspaceId }, context) => {
      queryClient.setQueryData(
        ["collaborators", workspaceId],
        context?.previousCollaborators
      );
      toast.error("Failed to remove collaborator");
    },
    onSuccess: () => {
      toast.success("Collaborator removed successfully");
    },
    onSettled: (_, __, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: ["collaborators", workspaceId],
      });
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { inviteId: string; workspaceId: string }) =>
      deleteInvite(data.inviteId),
    onMutate: async ({ inviteId, workspaceId }) => {
      await queryClient.cancelQueries({ queryKey: ["invites", workspaceId] });
      const previousInvites = queryClient.getQueryData<Invite[]>([
        "invites",
        workspaceId,
      ]);
      queryClient.setQueryData<Invite[]>(["invites", workspaceId], (old = []) =>
        old.filter((invite) => invite.id !== inviteId)
      );
      return { previousInvites };
    },
    onError: (err, { workspaceId }, context) => {
      queryClient.setQueryData(
        ["invites", workspaceId],
        context?.previousInvites
      );
      toast.error("Failed to revoke invite");
    },
    onSuccess: () => {
      toast.success("Invite revoked successfully");
    },
    onSettled: (_, __, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["invites", workspaceId] });
    },
  });
}

export function useRespondToInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { inviteId: string; accept: boolean }) =>
      respondToInvite(data.inviteId, data.accept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export const getInvitesForUser = async (userId: string) => {
  const res = await fetch(
    `${API_BASE_URL}/api/workspaces/invites/user/${userId}`
  );
  if (!res.ok) throw new Error("Failed to fetch user invites");
  return res.json();
};

export function useUserInvites(userId: string) {
  return useQuery({
    queryKey: ["invites", userId],
    queryFn: () => getInvitesForUser(userId),
    enabled: !!userId,
  });
}

export function useFiles(initialData?: FilesResponse) {
  return useQuery({
    queryKey: ["files"],
    queryFn: getFiles,
    initialData,
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkspace,
    onMutate: async (workspaceId) => {
      await queryClient.cancelQueries({ queryKey: ["workspaces"] });
      const previousWorkspaces = queryClient.getQueryData<{
        workspaces: Workspace[];
      }>(["workspaces"]);
      queryClient.setQueryData<{ workspaces: Workspace[] }>(
        ["workspaces"],
        (old) => {
          if (!old) return { workspaces: [] };
          return {
            workspaces: old.workspaces.filter((w) => w.id !== workspaceId),
          };
        }
      );
      return { previousWorkspaces };
    },
    onError: (err, workspaceId, context) => {
      if (context?.previousWorkspaces) {
        queryClient.setQueryData(["workspaces"], context.previousWorkspaces);
      }
      toast.error("Failed to delete workspace");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useCollaborators(workspaceId: string | null, userId: string) {
  return useQuery<Collaborator[]>({
    queryKey: ["collaborators", workspaceId],
    queryFn: () => getCollaborators(workspaceId!, userId),
    enabled: !!workspaceId,
  });
}

export function useWorkspaceInvites(workspaceId: string | null) {
  return useQuery<Invite[]>({
    queryKey: ["invites", workspaceId],
    queryFn: () => getInvites(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; workspaceId: string }) =>
      fetch(`${API_BASE_URL}/api/workspaces/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create invite");
        return res.json();
      }),
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["invites", workspaceId] });
      toast.success("Invite sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send invite");
    },
  });
}
