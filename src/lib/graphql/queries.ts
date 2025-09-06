/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getFieldData = /* GraphQL */ `query GetFieldData($id: ID!) {
  getFieldData(id: $id) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetFieldDataQueryVariables,
  APITypes.GetFieldDataQuery
>;
export const listFieldData = /* GraphQL */ `query ListFieldData(
  $filter: ModelFieldDataFilterInput
  $limit: Int
  $nextToken: String
) {
  listFieldData(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      field_unit
      field_id
      date_time
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListFieldDataQueryVariables,
  APITypes.ListFieldDataQuery
>;
