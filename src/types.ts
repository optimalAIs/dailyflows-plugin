import type {
  ChannelCapabilities,
  ChannelConfigAdapter,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelPlugin,
  ChannelStatusAdapter,
  OpenClawConfig,
  RuntimeEnv,
} from "openclaw/plugin-sdk";

export type DailyflowsAttachmentType = "image" | "file" | "audio";

export type DailyflowsInboundAttachment = {
  type: DailyflowsAttachmentType;
  url: string;
  name?: string;
  mime?: string;
  size?: number;
  durationMs?: number;
};

export type DailyflowsInboundMessage = {
  messageId?: string;
  chatType?: "direct" | "group";
  senderId: string;
  senderName?: string;
  conversationId: string;
  conversationName?: string;
  text?: string;
  attachments?: DailyflowsInboundAttachment[];
};

export type DailyflowsWebhookPayload = {
  id: string;
  type: "message.received";
  occurredAt?: number;
  accountId?: string;
  message: DailyflowsInboundMessage;
};

export type DailyflowsOutboundAttachment = {
  type: DailyflowsAttachmentType;
  url: string;
  name?: string;
  mime?: string;
  size?: number;
  durationMs?: number;
};

export type DailyflowsOutboundPayload = {
  accountId: string;
  conversationId: string;
  messageId?: string;
  text?: string;
  replyToId?: string;
  attachments?: DailyflowsOutboundAttachment[];
};

export type DailyflowsAccountConfig = {
  name?: string;
  enabled?: boolean;
  webhookSecret?: string;
  outboundUrl?: string;
  outboundToken?: string;
};

export type DailyflowsChannelConfig = {
  enabled?: boolean;
  webhookPath?: string;
  webhookSecret?: string;
  accounts?: Record<string, DailyflowsAccountConfig>;
};

export type ResolvedDailyflowsAccount = {
  accountId: string;
  name?: string;
  enabled: boolean;
  webhookSecret?: string;
  outboundUrl?: string;
  outboundToken?: string;
  config: DailyflowsChannelConfig;
};

export type DailyflowsChannelPlugin = ChannelPlugin<ResolvedDailyflowsAccount>;
export type DailyflowsOutboundAdapter = ChannelOutboundAdapter;
export type DailyflowsOutboundContext = ChannelOutboundContext;
export type DailyflowsOutboundResult = Awaited<
  ReturnType<NonNullable<ChannelOutboundAdapter["sendText"]>>
>;
export type DailyflowsChannelConfigAdapter = ChannelConfigAdapter<ResolvedDailyflowsAccount>;
export type DailyflowsChannelStatusAdapter = ChannelStatusAdapter<ResolvedDailyflowsAccount>;
export type DailyflowsRuntimeEnv = RuntimeEnv;
export type DailyflowsChannelMeta = ChannelMeta;
export type DailyflowsChannelCapabilities = ChannelCapabilities;
export type DailyflowsConfig = OpenClawConfig;
