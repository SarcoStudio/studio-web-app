/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createFieldData = /* GraphQL */ `mutation CreateFieldData(
  $input: CreateFieldDataInput!
  $condition: ModelFieldDataConditionInput
) {
  createFieldData(input: $input, condition: $condition) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateFieldDataMutationVariables,
  APITypes.CreateFieldDataMutation
>;
export const updateFieldData = /* GraphQL */ `mutation UpdateFieldData(
  $input: UpdateFieldDataInput!
  $condition: ModelFieldDataConditionInput
) {
  updateFieldData(input: $input, condition: $condition) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateFieldDataMutationVariables,
  APITypes.UpdateFieldDataMutation
>;
export const deleteFieldData = /* GraphQL */ `mutation DeleteFieldData(
  $input: DeleteFieldDataInput!
  $condition: ModelFieldDataConditionInput
) {
  deleteFieldData(input: $input, condition: $condition) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteFieldDataMutationVariables,
  APITypes.DeleteFieldDataMutation
>;
