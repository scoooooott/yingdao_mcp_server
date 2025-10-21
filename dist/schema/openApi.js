import { z } from "zod";
import i18n from '../i18n/index.js';
// Schema for executeRpaApp method
export const executeRpaAppSchema = {
    appUuid: z.string().describe(i18n.t('schema.local.executeRpaApp.appUuid')),
    appParams: z.any().describe(i18n.t('schema.local.executeRpaApp.appParams'))
};
// Schema for queryRobotParam method
export const queryRobotParamSchema = {
    robotUuid: z.string().optional().describe(i18n.t('schema.local.queryRobotParam.robotUuid'))
};
// Schema for queryAppList method - no parameters needed
export const queryAppListSchema = {};
// Response types for better type safety
export const AppInfoSchema = z.object({
    uuid: z.string(),
    name: z.string(),
    description: z.string().optional()
});
// Export all schemas
export const localSchemas = {
    executeRpaApp: executeRpaAppSchema,
    queryRobotParam: queryRobotParamSchema,
    queryAppList: queryAppListSchema
};
export const uploadFileSchema = {
    file: z.any().describe(i18n.t('schema.uploadFile.file')),
    fileName: z.string().max(100).describe(i18n.t('schema.uploadFile.fileName'))
};
export const robotParamSchema = {
    robotUuid: z.string().optional().describe(i18n.t('schema.robotParam.robotUuid')),
    accurateRobotName: z.string().optional().describe(i18n.t('schema.robotParam.accurateRobotName'))
};
export const querySchema = {
    appId: z.string().optional().describe(i18n.t('schema.query.appId')),
    size: z.string()
        .optional()
        .default('30')
        .transform(Number)
        .describe(i18n.t('schema.query.size')),
    page: z.string()
        .optional()
        .default('1')
        .transform(Number)
        .describe(i18n.t('schema.query.page')),
    ownerUserSearchKey: z.string().optional().describe(i18n.t('schema.query.ownerUserSearchKey')),
    appName: z.string().optional().describe(i18n.t('schema.query.appName'))
};
export const startJobSchema = {
    robotUuid: z.string().describe(i18n.t('schema.startJob.robotUuid')),
    accountName: z.string().optional().describe(i18n.t('schema.startJob.accountName')),
    robotClientGroupUuid: z.string().optional().describe(i18n.t('schema.startJob.robotClientGroupUuid')),
    waitTimeoutSeconds: z.number()
        .optional()
        .describe(i18n.t('schema.startJob.waitTimeoutSeconds')),
    runTimeout: z.number()
        .optional()
        .describe(i18n.t('schema.startJob.runTimeout')),
    params: z.record(z.any()).optional()
        .describe(i18n.t('schema.startJob.params'))
};
export const queryJobSchema = {
    jobUuid: z.string().describe(i18n.t('schema.queryJob.jobUuid'))
};
export const clientListSchema = {
    status: z.string().optional().describe(i18n.t('schema.clientList.status')),
    key: z.string().optional().describe(i18n.t('schema.clientList.key')),
    robotClientGroupUuid: z.string().optional().describe(i18n.t('schema.clientList.robotClientGroupUuid')),
    page: z.string()
        .default('1')
        .transform(Number)
        .describe(i18n.t('schema.clientList.page')),
    size: z.string()
        .default('30')
        .transform(Number)
        .describe(i18n.t('schema.clientList.size'))
};
