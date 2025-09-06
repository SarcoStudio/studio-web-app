/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateFieldDataInput = {
  id?: string | null,
  field_unit: string,
  field_id: string,
  date_time: string,
};

export type ModelFieldDataConditionInput = {
  field_unit?: ModelStringInput | null,
  field_id?: ModelStringInput | null,
  date_time?: ModelStringInput | null,
  and?: Array< ModelFieldDataConditionInput | null > | null,
  or?: Array< ModelFieldDataConditionInput | null > | null,
  not?: ModelFieldDataConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type FieldData = {
  __typename: "FieldData",
  id: string,
  field_unit: string,
  field_id: string,
  date_time: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateFieldDataInput = {
  id: string,
  field_unit?: string | null,
  field_id?: string | null,
  date_time?: string | null,
};

export type DeleteFieldDataInput = {
  id: string,
};

export type ModelFieldDataFilterInput = {
  id?: ModelIDInput | null,
  field_unit?: ModelStringInput | null,
  field_id?: ModelStringInput | null,
  date_time?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelFieldDataFilterInput | null > | null,
  or?: Array< ModelFieldDataFilterInput | null > | null,
  not?: ModelFieldDataFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelFieldDataConnection = {
  __typename: "ModelFieldDataConnection",
  items:  Array<FieldData | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionFieldDataFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  field_unit?: ModelSubscriptionStringInput | null,
  field_id?: ModelSubscriptionStringInput | null,
  date_time?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionFieldDataFilterInput | null > | null,
  or?: Array< ModelSubscriptionFieldDataFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreateFieldDataMutationVariables = {
  input: CreateFieldDataInput,
  condition?: ModelFieldDataConditionInput | null,
};

export type CreateFieldDataMutation = {
  createFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateFieldDataMutationVariables = {
  input: UpdateFieldDataInput,
  condition?: ModelFieldDataConditionInput | null,
};

export type UpdateFieldDataMutation = {
  updateFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteFieldDataMutationVariables = {
  input: DeleteFieldDataInput,
  condition?: ModelFieldDataConditionInput | null,
};

export type DeleteFieldDataMutation = {
  deleteFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetFieldDataQueryVariables = {
  id: string,
};

export type GetFieldDataQuery = {
  getFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListFieldDataQueryVariables = {
  filter?: ModelFieldDataFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFieldDataQuery = {
  listFieldData?:  {
    __typename: "ModelFieldDataConnection",
    items:  Array< {
      __typename: "FieldData",
      id: string,
      field_unit: string,
      field_id: string,
      date_time: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateFieldDataSubscriptionVariables = {
  filter?: ModelSubscriptionFieldDataFilterInput | null,
};

export type OnCreateFieldDataSubscription = {
  onCreateFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFieldDataSubscriptionVariables = {
  filter?: ModelSubscriptionFieldDataFilterInput | null,
};

export type OnUpdateFieldDataSubscription = {
  onUpdateFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFieldDataSubscriptionVariables = {
  filter?: ModelSubscriptionFieldDataFilterInput | null,
};

export type OnDeleteFieldDataSubscription = {
  onDeleteFieldData?:  {
    __typename: "FieldData",
    id: string,
    field_unit: string,
    field_id: string,
    date_time: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};
