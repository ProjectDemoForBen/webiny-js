// @flow
import { ObjectId } from "mongodb";
import { ListResponse } from "webiny-api/graphql";
import type { HeadlessFieldTypePlugin } from "webiny-api-headless/types";
import createTypeName from "webiny-api-headless/utils/createTypeName";
import createListArgs from "webiny-api-headless/utils/createListArgs";
import findEntry from "webiny-api-headless/utils/findEntry";
import findEntries from "webiny-api-headless/utils/findEntries";

const createResolver = ({ models, field }) => {
    const { type, modelId } = field.settings;
    const refModel = models.find(m => m.modelId === modelId);

    return async (entry, args, context, { fieldName }) => {
        if (type === "one") {
            return findEntry({
                model: refModel,
                args: { where: { _id: ObjectId(entry[fieldName]) } },
                context
            });
        }

        // Load "many" entries
        const { where = {}, ...rest } = args;
        where["id_in"] = entry[fieldName] || [];

        const { entries, meta } = await findEntries({
            model: refModel,
            args: { where, ...rest },
            context
        });

        return new ListResponse(entries, meta);
    };
};

export default ({
    name: "cms-headless-field-type-ref",
    type: "cms-headless-field-type",
    fieldType: "ref",
    read: {
        createTypeField({ model, field }) {
            const { modelId, type } = field.settings;
            const many = type === "many";
            const gqlType = createTypeName(modelId);
            const fieldArgs = many ? createListArgs({ model, field }) : "";

            return field.fieldId + fieldArgs + `: ${many ? `${gqlType}ListResponse` : gqlType}`;
        },
        createResolver
    },
    manage: {
        createTypeField({ field }) {
            const { modelId, type } = field.settings;
            const gqlType = createTypeName(modelId);

            return field.fieldId + `: ${type === "many" ? `${gqlType}ListResponse` : gqlType}`;
        },
        createInputField({ field }) {
            const { type } = field.settings;

            return field.fieldId + `: ${type === "many" ? "[ID]" : "ID"}`;
        },
        createResolver
    }
}: HeadlessFieldTypePlugin);
