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
