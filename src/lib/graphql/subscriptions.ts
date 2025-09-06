/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateFieldData = /* GraphQL */ `subscription OnCreateFieldData($filter: ModelSubscriptionFieldDataFilterInput) {
  onCreateFieldData(filter: $filter) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateFieldDataSubscriptionVariables,
  APITypes.OnCreateFieldDataSubscription
>;
export const onUpdateFieldData = /* GraphQL */ `subscription OnUpdateFieldData($filter: ModelSubscriptionFieldDataFilterInput) {
  onUpdateFieldData(filter: $filter) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateFieldDataSubscriptionVariables,
  APITypes.OnUpdateFieldDataSubscription
>;
export const onDeleteFieldData = /* GraphQL */ `subscription OnDeleteFieldData($filter: ModelSubscriptionFieldDataFilterInput) {
  onDeleteFieldData(filter: $filter) {
    id
    field_unit
    field_id
    date_time
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteFieldDataSubscriptionVariables,
  APITypes.OnDeleteFieldDataSubscription
>;
