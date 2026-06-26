// Kova* type aliases — external code can use KovaConfig, KovaPluginApi, etc.
// All aliases are exact re-exports of the internal OpenClaw* types.
// Nothing in the core runtime changes; this is a pure additive bridge.

export type { OpenClawConfig as KovaConfig } from "../config/types.openclaw.js";
export type { OpenClawConfigInput as KovaConfigInput } from "../config/types.openclaw.js";

export type {
  OpenClawPluginApi as KovaPluginApi,
  OpenClawPluginCommandDefinition as KovaPluginCommandDefinition,
  OpenClawPluginConfigSchema as KovaPluginConfigSchema,
  OpenClawPluginDefinition as KovaPluginDefinition,
  OpenClawPluginHttpRouteAuth as KovaPluginHttpRouteAuth,
  OpenClawPluginHttpRouteHandler as KovaPluginHttpRouteHandler,
  OpenClawPluginHttpRouteMatch as KovaPluginHttpRouteMatch,
  OpenClawPluginHttpRouteParams as KovaPluginHttpRouteParams,
  OpenClawPluginHostedMediaResolver as KovaPluginHostedMediaResolver,
  OpenClawPluginModule as KovaPluginModule,
  OpenClawPluginNodeHostCommand as KovaPluginNodeHostCommand,
  OpenClawPluginNodeInvokePolicy as KovaPluginNodeInvokePolicy,
  OpenClawPluginNodeInvokePolicyContext as KovaPluginNodeInvokePolicyContext,
  OpenClawPluginNodeInvokePolicyResult as KovaPluginNodeInvokePolicyResult,
  OpenClawPluginReloadRegistration as KovaPluginReloadRegistration,
  OpenClawPluginSecurityAuditCollector as KovaPluginSecurityAuditCollector,
  OpenClawPluginSecurityAuditContext as KovaPluginSecurityAuditContext,
  OpenClawPluginService as KovaPluginService,
  OpenClawPluginServiceContext as KovaPluginServiceContext,
  OpenClawPluginToolContext as KovaPluginToolContext,
  OpenClawPluginToolFactory as KovaPluginToolFactory,
  OpenClawGatewayDiscoveryAdvertiseContext as KovaGatewayDiscoveryAdvertiseContext,
  OpenClawGatewayDiscoveryService as KovaGatewayDiscoveryService,
} from "../plugins/types.js";
